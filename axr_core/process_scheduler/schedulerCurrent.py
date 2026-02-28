from __future__ import annotations
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List
from uuid import UUID
import asyncio

from axr_core.process_manager.process import AIProcess, ProcessState
from axr_core.process_graph.models import ProcessStep, StepStatus
from axr_core.process_graph.resolver import ProcessGraphResolver
from axr_core.security_module.evaluator import SecurityEvaluator
from axr_core.capabilities.issuer import CapabilityIssuer
from axr_core.capabilities.validator import CapabilityValidator
from axr_core.syscalls.exec_handler import ExecHandler
from axr_core.process_memory.memory_manager import ProcessMemoryManager
from axr_core.transactions.transaction_manager import TransactionManager
from axr_core.checkpointing.checkpoint_manager import CheckpointManager
from axr_core.retry.retry_manager import RetryManager
from axr_core.events.event_bus import EventBus
from axr_core.events.event import Event
from axr_core.resource_manager.resource_manager import ResourceManager
from axr_core.resource_manager.resource_model import ProcessResources
from axr_core.persistence.repository import PersistenceRepository
from axr_core.distributed.nats_client import NATSClient
from axr_core.distributed.message import task_message
from axr_core.reliability.lease_manager import LeaseManager
from axr_core.distributed.worker_registry import WorkerRegistry

class ProcessScheduler:
    
    def __init__(self, max_workers: int = 4, poll_interval: float = 0.1):
        self.processes: Dict[UUID, AIProcess] = {}
        self.steps: Dict[UUID, List[ProcessStep]] = {}
        self._process_rr_index = 0
        self.global_max_parallel = max_workers
        self._global_active_steps = 0
        
        
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.poll_interval = poll_interval

        self._lock = threading.Lock()
        self._running = False
        
        # Initilize security module
        self.security_evaluator = SecurityEvaluator(
            policy_path="policies/devsecops_safe.yaml"
        )
        
        self.capability_issuer = CapabilityIssuer()
        self.capability_validator = CapabilityValidator()
        self.exec_handler = ExecHandler()
        self.memory_manager = ProcessMemoryManager()
        self.repo = PersistenceRepository()
        self.event_bus = EventBus(repo=self.repo)
        self.transaction_manager = TransactionManager(self.memory_manager, self.event_bus)
        self.checkpoint_manager = CheckpointManager(self.memory_manager)
        self.retry_manager = RetryManager()
        self.resource_manager = ResourceManager()
        self.lease_manager = LeaseManager(timeout_seconds=15)
        self.worker_registry = WorkerRegistry(ttl_seconds=10)

        self._lease_worker_map: Dict[UUID, str] = {}
        
        self.max_parallel_per_process = 10
        self._active_steps_per_process: Dict[UUID, int] = {}
        
        self._retry_queue: Dict[UUID, float] = {}  # step_id -> next_retry_timestamp
        self.MAX_RETRIES = 3
        self.BASE_BACKOFF = 0.5
        self._rr_index: Dict[str, int] = {}
    
    #------------------------------
    # NATS Server
    # -----------------------------
    
    async def init_nats(self):
        self.nats = NATSClient()
        
        self.loop = asyncio.get_running_loop()
        
        await self.nats.connect()
        await self.nats.subscribe("axr.results", self._on_result)
        await self.nats.subscribe("axr.heartbeat", cb=self._handle_heartbeat)
        print("[NATS] Scheduler connected and subscribed to axr.results")    
        
    
    # ---------------------------
    # Kernel registration methods
    # ---------------------------

    def register_process(self, process: AIProcess, steps: List[ProcessStep]) -> None:
        with self._lock:
            self.processes[process.pid] = process
            self.steps[process.pid] = steps
            self.resource_manager.register_process(
                process.pid,
                ProcessResources(max_concurrent_steps=10, max_budget=process.budget_limit),
            )
            
            self.repo.save_process(process)
            for step in steps:
                self.repo.save_step(step)

            # 🔥 restore checkpoint state
            self._restore_process_state(process)

    # ---------------------------
    # Kernel loop control
    # ---------------------------

    def start(self) -> None:
        self._running = True
        while self._running:
            self._schedule_cycle()
            time.sleep(self.poll_interval)

    def stop(self) -> None:
        self._running = False
        self.executor.shutdown(wait=True)
    
    
    # ---------------------------
    # Core scheduling cycle
    # ---------------------------

    def _schedule_cycle(self) -> None:
        
        now = time.time()
        ready_retry_steps = [
            sid for sid, ts in self._retry_queue.items() if ts <= now
        ]

        for sid in ready_retry_steps:
            for pid, steps in self.steps.items():
                step = next((s for s in steps if s.step_id == sid), None)
                if step and step.status == StepStatus.PENDING:
                    print(f"[RETRY-READY] {step.syscall}")
                    step.mark_ready()
                    self.repo.save_step(step)

            self._retry_queue.pop(sid, None)
        
        
        with self._lock:
            active_processes = [
                p for p in self.processes.values()
                if p.is_active()
                and p.state != ProcessState.PAUSED
                and not getattr(p, "finalized", False)
            ]

        futures = []

        if not active_processes:
            return

        start_index = self._process_rr_index
        count = len(active_processes)

        for i in range(count):
            process = active_processes[(start_index + i) % count]
            
            if process.state == ProcessState.PAUSED:
                continue

            if process.state == ProcessState.FAILED:
                continue
            print(f"[SCHED] Checking process {process.pid} STATE= {process.state}")

            if process.state == ProcessState.READY:
                process.start()
                self._active_steps_per_process[process.pid] = 0

                self.event_bus.publish(
                    Event(event_type="PROCESS_STARTED", pid=process.pid)
                )

            steps = self.steps.get(process.pid, [])
            resolver = ProcessGraphResolver(steps)
            runnable_steps = resolver.resolve()

            for s in runnable_steps:
                if s.status == StepStatus.PENDING:
                    s.mark_ready()

            runnable_steps.sort(key=lambda s: s.priority)

            if runnable_steps:
                print(f"[RESOLVE] Runnable steps: {[s.syscall for s in runnable_steps]}")

            for step in runnable_steps:
                if process.state == ProcessState.FAILED:
                    break

                if step.status != StepStatus.READY:
                    continue

                active = self._active_steps_per_process.get(process.pid, 0)
                if active >= self.max_parallel_per_process:
                    print(f"[FAIR] Process {process.pid} hit parallel limit")
                    continue

                # 🔐 SECURITY CHECK (pre-schedule)
                if not self.security_evaluator.allow(process, step):
                    print(f"[SECURITY] Blocked {step.syscall} for PID={process.pid}")

                    step.fail("Blocked by security policy")
                    self.repo.save_step(step)

                    self.event_bus.publish(
                        Event(
                            event_type="STEP_FAILED",
                            pid=process.pid,
                            step_id=step.step_id,
                            metadata={"reason": "security_policy"},
                        )
                    )

                    print(f"[SECURITY] {step.syscall} marked FAILED — process will finalize later")


                    continue
                
                # 🧠 RESOURCE CHECK
                remaining_budget = process.remaining_budget()

                if not self.resource_manager.can_schedule(
                    process.pid, step.cost_estimate, remaining_budget
                ):
                    print(f"[RESOURCE] No slot for PID={process.pid}")
                    continue

                # allocate AFTER approval
                self.resource_manager.allocate(process.pid)
                
                if self._global_active_steps >= self.global_max_parallel:
                    print("[GLOBAL-FAIR] Global parallel limit reached")
                    break

                # READY EVENT
                self.event_bus.publish(
                    Event(
                        event_type="STEP_READY",
                        pid=process.pid,
                        step_id=step.step_id,
                        metadata={"syscall": step.syscall},
                    )
                )
                
                

                step.start()
                process.current_step_id = step.step_id
                process.mark_scheduled()

                with self._lock:
                    self._active_steps_per_process[process.pid] = (
                        self._active_steps_per_process.get(process.pid, 0) + 1
                    )

                print(
                    f"[FAIR-DEBUG] pid={process.pid} active="
                    f"{self._active_steps_per_process[process.pid]}"
                )

                futures.append(self.executor.submit(self._execute_step, process, step))
                self._global_active_steps += 1
                continue  # ⬅️ important: only one step per process per cycle

        for future in as_completed(futures):
            pass

        self._finalize_processes()
        self._check_expired_leases()
        self._process_rr_index = (start_index + 1) % count

    # ---------------------------
    # Step execution (LOCAL SIMULATION)
    # ---------------------------

    def _execute_step(self, process: AIProcess, step: ProcessStep) -> None:
        self.event_bus.publish(
            Event(
                event_type="STEP_STARTED",
                pid=process.pid,
                step_id=step.step_id,
                metadata={"syscall": step.syscall},
            )
        )

        try:
            print(f"[EXEC] PID= {process.pid} STEP= {step.syscall}")

            process.charge_budget(step.cost_estimate)
            self.repo.save_process(process)

            # 🔎 FIND WORKERS FOR TOOL
            workers = self.worker_registry.get_workers_for_tool(step.syscall)

            if not workers:
                print(f"[ROUTE] No workers available for {step.syscall}")

                # schedule retry instead of immediate READY
                self._schedule_retry(process, step, "no_workers")

                self.resource_manager.release(process.pid)
                self._decrement_active(process.pid)
                self._global_active_steps = max(0, self._global_active_steps - 1)

                return

            live_workers = self.worker_registry.get_live_workers()
            worker_load = self._get_worker_load()

            # 🧠 CAPACITY FILTER
            eligible = []
            for wid in workers:
                if wid not in live_workers:
                    continue
                
                capacity = live_workers[wid].get("capacity", 1)
                active = worker_load.get(wid, 0)

                if active < capacity:
                    eligible.append(wid)

            if not eligible:
                print(f"[ROUTE] All workers at capacity for {step.syscall}")

                step.status = StepStatus.READY
                self.repo.save_step(step)

                self.resource_manager.release(process.pid)
                self._decrement_active(process.pid)
                return

            # 🔁 ROUND ROBIN + LEAST LOAD
            rr = self._rr_index.get(step.syscall, 0)

            scored = []
            for i, w in enumerate(eligible):
                load = worker_load.get(w, 0)
                rr_offset = (i - rr) % len(eligible)
                scored.append((w, load, rr_offset))

            target_worker = min(scored, key=lambda x: (x[1], x[2]))[0]
            self._rr_index[step.syscall] = (rr + 1) % len(eligible)
            
            # Capability Issue
            cap = self.capability_issuer.issue(
                pid =process.pid,
                step_id= step.step_id,
                syscall=step.syscall,
                budget_limit=step.cost_estimate
            )
            
            print(f"[CAP] Issued cap_id= {cap.cap_id} syscall= {cap.syscall}")
            
            process_memory = self.memory_manager.read_process_memory(process.pid)

            # JSON-safe: convert UUID keys -> str
            json_safe_memory = {
                str(k): v for k, v in process_memory.items()
            }
            
            # 🛰️ DISPATCH TO NATS
            payload = task_message(process, step, memory_inputs=json_safe_memory, capability=cap)

            step.assigned_worker = target_worker
            step.status = StepStatus.RUNNING
            self.repo.save_step(step)
            print(
                f"[NATS-PUB] subject= axr.tasks.{target_worker} size={len(payload)}"
            )

            asyncio.run_coroutine_threadsafe(
                self.nats.publish(f"axr.tasks.{target_worker}", payload),
                self.loop,
            )

            print(f"[ROUTE] {step.syscall} -> Worker_ID: {target_worker}")

            # ⏱️ START LEASE (for load tracking)
            with self._lock:
                self.lease_manager.start_lease(process.pid, step.step_id, target_worker)
                self._lease_worker_map[step.step_id] = target_worker
            


        except Exception as e:
            step.fail(str(e))

            self.event_bus.publish(
                Event(
                    event_type="STEP_FAILED",
                    pid=process.pid,
                    step_id=step.step_id,
                    metadata={"error": str(e)},
                )
            )

            process.fail(str(e))
            
            with self._lock:
                self.lease_manager.complete_lease(step.step_id)
                self._lease_worker_map.pop(step.step_id, None)
            
            if step.failure_policy == "retry":
                self._schedule_retry(process, step, str(e))
                self.resource_manager.release(process.pid)

                with self._lock:
                    self._active_steps_per_process[process.pid] = max(
                        0, self._active_steps_per_process[process.pid] - 1
                    )
                self._global_active_steps = max(0, self._global_active_steps - 1)
                return

        finally:
            # ⚠️ DO NOT release resource here yet
            # resource released when result comes (next phase)
            self.repo.save_step(step)
            self.repo.save_process(process)

    
    # ---------------------------
    # On Result
    # ---------------------------
    
    async def _on_result(self, msg):
        import json
        from axr_core.capabilities.models import Capability
        from datetime import datetime

        data = json.loads(msg.data.decode())

        pid = UUID(data["pid"])
        step_id = UUID(data["step_id"])

        process = self.processes.get(pid)
        steps = self.steps.get(pid, [])
        step = next((s for s in steps if s.step_id == step_id), None)

        if not process or not step:
            return
        
        if process and process.state == ProcessState.FAILED:
            print(f"[RESULT-IGNORED] Process {pid} already failed/cancelled")
            return

        # Ignore results for failed/finalized process
        if process.state == ProcessState.FAILED or getattr(process, "finalized", False):
            print(f"[RESULT-IGNORED] Process {pid} already failed")
            return
        
        cap_data = data.get("capability")
        
        if cap_data:
           
            cap = Capability(
            cap_id=UUID(cap_data["cap_id"]),
            pid=UUID(cap_data["pid"]),
            step_id=UUID(cap_data["step_id"]),
            syscall=cap_data["syscall"],
            issued_at=datetime.fromisoformat(cap_data["issued_at"]),
            expires_at=datetime.fromisoformat(cap_data["expires_at"]),
            budget_limit=cap_data["budget_limit"],
            signature=cap_data["signature"],
            )
            
            
            
            if not self.capability_validator.validate(cap):
                print(f"[CAP] Invalid capability for step {data['step_id']}")
                step.fail("Invalid capability")
                self.repo.save_step(step)
                
                with self._lock:
                    self.lease_manager.complete_lease(step_id)
                    self._lease_worker_map.pop(step_id, None)
                    
                
                self.resource_manager.release(pid)
                self._decrement_active(pid)
                self._global_active_steps = max(0, self._global_active_steps -1)
                return
            else:
                print(f"[CAP] Valid capability for step {data['step_id']}")
        
        else:
            print(f"[CAP-ERROR] Missing capability for step {step_id}")
            step.fail("Missing capability token")
            self.repo.save_step(step)
            self.repo.save_process(process)
            
            with self._lock:
                self.lease_manager.complete_lease(step_id)
                self._lease_worker_map.pop(step_id, None)
            
            self.resource_manager.release(pid)
            self._decrement_active(pid)
            self._global_active_steps = max(0, self._global_active_steps -1)
            return

        # ✅ COMPLETE LEASE
        with self._lock:
            self.lease_manager.complete_lease(step_id)
            self._lease_worker_map.pop(step_id, None)
        
        self.repo.save_step(step)

        # ✅ ACTIVE STEP COUNT--
        self._decrement_active(pid)
        
        self._global_active_steps = max(0, self._global_active_steps - 1)

        # ✅ RESOURCE RELEASE
        self.resource_manager.release(pid)

        # -------------------------
        # SUCCESS
        # -------------------------
        if data["status"] == "success":
            step.succeed()

            if data.get("output"):
                self.memory_manager.write_output(pid, step_id, data["output"])


            # after STEP_SUCCEEDED event publish
            self.event_bus.publish(
                Event(
                    event_type="STEP_SUCCEEDED",
                    pid=pid,
                    step_id=step_id,
                )
            )

            # 🔐 CHECKPOINT (safe point)
            self.checkpoint_manager.save_checkpoint(
                process,
                self.steps.get(pid, [])
            )
            
        # -------------------------
        # FAILURE
        # -------------------------
        else:
            error_msg = data.get("error", "Worker failure")

            if step.failure_policy == "retry":
                self._schedule_retry(process, step, error_msg)
            elif step.failure_policy == "skip":
                step.status = StepStatus.SKIPPED
                self.event_bus.publish(
                    Event(
                        event_type="STEP_SKIPPED",
                        pid=pid,
                        step_id=step_id,
                        metadata={"error": error_msg},
                    )
                )
            else:
                step.fail(error_msg)
                self.event_bus.publish(
                    Event(
                        event_type="STEP_FAILED",
                        pid=pid,
                        step_id=step_id,
                        metadata={"error": error_msg},
                    )
                )
    
    # ---------------------------
    # Heartbeat Handler
    # ---------------------------
    
    async def _handle_heartbeat(self, msg):
        import json

        data = json.loads(msg.data.decode())

        worker_id = data["worker_id"]
        tools = data["tools"]
        capacity = data.get("capacity", 1)

        self.worker_registry.register(worker_id, tools, capacity)

        print(f"[HB] Worker {worker_id} tools={tools}")

    # ---------------------------
    # Active counter helper
    # ---------------------------

    def _decrement_active(self, pid: UUID):
        with self._lock:
            if pid in self._active_steps_per_process:
                self._active_steps_per_process[pid] = max(
                    0, self._active_steps_per_process[pid] - 1
                )


    # ---------------------------
    # Process completion check
    # ---------------------------

    def _finalize_processes(self):
        with self._lock:
            for pid, process in self.processes.items():

                if getattr(process, "finalized", False):
                    continue

                steps = self.steps.get(pid, [])
                if not steps:
                    continue

                any_failed = any(step.status == StepStatus.FAILED for step in steps)
                any_skipped = any(step.status == StepStatus.SKIPPED for step in steps)
                all_success = all(step.status == StepStatus.SUCCESS for step in steps)
                
                # FAILURE (FAILED or SKIPPED → your rule)
                if (any_failed or any_skipped) and process.state != ProcessState.FAILED:
                    print(f"[PROCESS] {pid} transitioning to FAILED → triggering rollback")

                    # 🔥 mark process failed first
                    process.fail("One or more steps failed/skipped")
                    process.finalized = True
                    self.repo.save_process(process)

                    # 🔥 TRANSACTION ROLLBACK
                    try:
                        self.transaction_manager.rollback_process(process, steps)
                        # after STEP_SUCCEEDED event publish

                        # 🔐 CHECKPOINT (safe point)
                        self.checkpoint_manager.save_checkpoint(
                            process,
                            self.steps.get(pid, [])
                        )
                        
                    except Exception as e:
                        print(f"[TXN-ERROR] Rollback failed for PID={pid}: {e}")

                    self.event_bus.publish(
                        Event(event_type="PROCESS_FAILED", pid=pid)
                    )

                    self._active_steps_per_process.pop(pid, None)

                    print(f"\n[PROCESS] {pid} finalized as FAILED\n")
                    continue

                # SUCCESS
                if all_success:
                    # 🔐 CHECKPOINT after rollback (new consistent state)
                    self.checkpoint_manager.save_checkpoint(process, steps)
                    process.terminate()
                    process.finalized = True

                    self.event_bus.publish(
                        Event(event_type="PROCESS_SUCCEEDED", pid=pid)
                    )

                    self.repo.save_process(process)
                    self._active_steps_per_process.pop(pid, None)

                    print(f"\n[PROCESS] {pid} finalized as SUCCEEDED\n")
                    
    # -------------------------------
    # Worker Load
    # -------------------------------
    
    def _get_worker_load(self):    
        with self._lock:
            load = {}

            for step_id, worker_id in self._lease_worker_map.items():
                load[worker_id] = load.get(worker_id, 0) + 1

        return load

    
    # -------------------------------
    # Checking Expired Leases
    # -------------------------------
    
    def _check_expired_leases(self):
        expired = self.lease_manager.get_expired()

        for pid, step_id in expired:
            print(f"[LEASE] Step {step_id} expired → requeue")

            steps = self.steps.get(pid, [])
            step = next((s for s in steps if s.step_id == step_id), None)

            if not step:
                continue

            step.status = StepStatus.READY
            step.retries += 1
            step.assigned_worker = None
            self.repo.save_step(step)

            self.event_bus.publish(
                Event(
                    event_type="STEP_REQUEUED",
                    pid=pid,
                    step_id=step_id,
                    metadata={"reason": "lease_timeout", "retry": step.retries},
                )
            )

            self.resource_manager.release(pid)
            
            with self._lock:
                self.lease_manager.complete_lease(step_id)
                self._lease_worker_map.pop(step_id, None)
            self._decrement_active(pid)
    
    
    # --------------------------------
    # Cancel Process
    # --------------------------------
    
    def cancel_process(self, pid: UUID):
        process = self.processes.get(pid)
        if not process:
            return False

        steps = self.steps.get(pid, [])

        print(f"[CANCEL] Cancelling process {pid}")

        # mark process failed
        process.fail("Cancelled by user")
        process.finalized = True
        self.repo.save_process(process)

        # fail running steps + clear leases
        for step in steps:
            if step.status == StepStatus.RUNNING:
                step.fail("Cancelled")

            self.lease_manager.complete_lease(step.step_id)
            self._lease_worker_map.pop(step.step_id, None)
            step.assigned_worker = None
            self.repo.save_step(step)

        # release resources
        self.resource_manager.release(pid)
        self._active_steps_per_process.pop(pid, None)

        # emit event
        self.event_bus.publish(
            Event(event_type="PROCESS_CANCELLED", pid=pid)
        )

        return True
    
    
    # --------------------------------
    # Pause Process
    # --------------------------------
    
    def pause_process(self, pid: UUID):
        process = self.processes.get(pid)
        if not process:
            return False

        if process.state == ProcessState.PAUSED:
            return True

        process.pause()
        self.repo.save_process(process)

        self.event_bus.publish(
            Event(event_type="PROCESS_PAUSED", pid=pid)
        )

        print(f"[PAUSE] Process {pid} paused")
        return True
    
    # --------------------------------
    # Resume Process
    # --------------------------------
    
    def resume_process(self, pid: UUID):
        process = self.processes.get(pid)
        if not process:
            return False

        if process.state != ProcessState.PAUSED:
            return True

        process.state = ProcessState.READY
        self.repo.save_process(process)

        self.event_bus.publish(
            Event(event_type="PROCESS_RESUMED", pid=pid)
        )

        print(f"[RESUME] Process {pid} resumed")
        return True
    
    
    # ----------------------------------
    # Helper: Scheduler Retry
    # ----------------------------------
    
    def _schedule_retry(self, process: AIProcess, step: ProcessStep, reason: str):
        if step.retries >= self.MAX_RETRIES:
            print(f"[DEAD] Step {step.syscall} exceeded retries")
            step.fail("Max retries exceeded")
            self.repo.save_step(step)

            self.event_bus.publish(
                Event(
                    event_type="STEP_DEAD",
                    pid=process.pid,
                    step_id=step.step_id,
                    metadata={"reason": reason},
                )
            )
            return

        step.retries += 1
        backoff = self.BASE_BACKOFF * (2 ** (step.retries - 1))
        retry_time = time.time() + backoff

        self._retry_queue[step.step_id] = retry_time
        step.status = StepStatus.PENDING
        self.repo.save_step(step)

        print(f"[RETRY] {step.syscall} retry={step.retries} in {backoff:.2f}s")

        self.event_bus.publish(
            Event(
                event_type="STEP_RETRY_SCHEDULED",
                pid=process.pid,
                step_id=step.step_id,
                metadata={"retry": step.retries, "backoff": backoff},
            )
        )
    
    
    # ------------------------------
    # Restore Method
    # ------------------------------
    
    def _restore_process_state(self, process: AIProcess):
        steps = self.steps.get(process.pid, [])
        if not steps:
            return

        print(f"[RESTORE] Process {process.pid}")

        for step in steps:
            if step.status == StepStatus.RUNNING:
                # was in-flight → retry
                step.status = StepStatus.PENDING
                print(f"[RESTORE] {step.syscall} RUNNING → PENDING")

        print(f"[RESTORE] Memory restored for {process.pid}")
        
        any_failed = any(s.status == StepStatus.FAILED for s in steps)
        all_done = all(
            s.status in {StepStatus.SUCCESS, StepStatus.SKIPPED} for s in steps
        )

        if any_failed:
            process.fail("Restored with failed step")
        elif all_done:
            process.terminate()
            process.finalized = True
        else:
            process.state = ProcessState.RUNNING

        self.repo.save_process(process)
        for step in steps:
            self.repo.save_step(step)
            
        self._active_steps_per_process[process.pid] = 0
        self._global_active_steps = 0
        
        # 🔥 reset resource usage for restored process
        self.resource_manager.reset_usage(process.pid)
        
        # 🔐 persist restored state as new checkpoint baseline
        self.checkpoint_manager.save_checkpoint(process, steps)
    
    
    
    def run_once(self) -> None:
        """
        Run ad single scheduling cycle (for testing).
        """
        self._schedule_cycle()