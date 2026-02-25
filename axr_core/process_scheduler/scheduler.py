from __future__ import annotations

import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List
from uuid import UUID

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
import asyncio


class ProcessScheduler:
    """
    AXR Kernel Process Scheduler (in-memory MVP)

    Manages:
    - active processes
    - step resolution
    - parallel execution
    """

    def __init__(self, max_workers: int = 4, poll_interval: float = 0.1):
        self.processes: Dict[UUID, AIProcess] = {}
        self.steps: Dict[UUID, List[ProcessStep]] = {}

        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.poll_interval = poll_interval

        self._lock = threading.Lock()
        self._running = False
        
        # Initilize security module
        self.security_evaluator = SecurityEvaluator(
            policy_path="policies/devsecops_safe.yaml"
        )
        
        self.capability_issuer = CapabilityIssuer()
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
        
        self._rr_index = {}
        self._lease_worker_map: Dict[UUID, str] = {}
        
        self.max_parallel_per_process = 2
        self._active_steps_per_process: Dict[UUID, int] = {}

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
        with self._lock:
            active_processes = [
                p for p in self.processes.values() 
                if p.is_active() and not getattr(p, "finalized", False)
            ]

        futures = []

        for process in active_processes:
            print(f"[SCHED] Checking process {process.pid} state= {process.state}")
            
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
            
            runnable_steps.sort(key=lambda s:s.priority)
            if runnable_steps:
                print(f"\n[RESOLVE] Runnable steps: {[s.syscall for s in runnable_steps]}")

            for step in runnable_steps:
                
                active = self._active_steps_per_process.get(process.pid, 0)
                if active >= self.max_parallel_per_process:
                    print(f"[FAIR] Process {process.pid} hit parallel limit")
                    
                if step.status == StepStatus.RUNNING:
                    continue
                    
                if step.status != StepStatus.READY:
                    continue
                
                # Resource admission control
                if not self.resource_manager.can_schedule(
                    process.pid,
                    step.cost_estimate,
                    process.remaining_budget(),
                ):
                    print(f"[RESOURCE] Blocked {step.syscall} (no slots/budget)")
                    continue
                
                print(f"[READY] {step.syscall}")
                
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
                
                # Allocate resource slot
                self.resource_manager.allocate(process.pid)
                self._active_steps_per_process[process.pid] = active + 1
                
                print(
                    f"[FAIR-DEBUG] pid= {process.pid}  active="
                    f"{self._active_steps_per_process.get(process.pid, 0)}"
                )
                
                with self._lock:
                    self._active_steps_per_process[process.pid] = active + 1
                
                futures.append(
                    self.executor.submit(self._execute_step, process, step)
                )
                # self._execute_step(process, step)

        # # Wait for step execution to complete
        for future in as_completed(futures):
            pass
        
        self._check_expired_leases()
        # Check process completion
        self._finalize_processes()

    # ---------------------------
    # Step execution
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

            # Charge budget before dispatch
            process.charge_budget(step.cost_estimate)
            self.repo.save_process(process)
            
            process_memory = self.memory_manager.read_process_memory(process.pid)
            
            # JSON-safe: convert UUID keys -> str
            json_safe_memory = {
                str(k): v for k, v in process_memory.items()
            }
            
            # Workers that support this tool
            workers = self.worker_registry.get_workers_for_tool(step.syscall)
            
            if not workers:
                print(f"[ROUTE] No workers available for {step.syscall}")
                
                step.status = StepStatus.READY
                self.resource_manager.release(process.pid)
                
                with self._lock:
                    self._active_steps_per_process[process.pid] = max(0, self._active_steps_per_process[process.pid] -1)
                return
            
            live_workers =  self.worker_registry.get_live_workers()
            worker_load = self._get_worker_load()
            
            print(f"[ROUTE-DEBUG] live workers: {live_workers}")
            print(f"[ROUTE-DEBUG] worker load: {worker_load}")
            
            # Capacity filtering
            eligible = []
            
            for wid in workers:
                capacity = live_workers[wid].get("capacity",1)
                active = worker_load.get(wid, 0)
                
                if active < capacity:
                    eligible.append(wid)
            
            if not eligible:
                print(f"[ROUTE] All workers at capacity for {step.syscall}")
                step.status =  StepStatus.READY
                
                with self._lock:
                    self._active_steps_per_process[process.pid] = max(0, self._active_steps_per_process[process.pid] -1)
                self.resource_manager.release(process.pid)
                return
            
            rr = self._rr_index.get(step.syscall, 0)
            
            scored = []
            
            for i, w in enumerate(eligible):
                load = worker_load.get(w,0)
                rr_offset = (i - rr) % len(eligible)
                scored.append((w, load, rr_offset))
            
            target_worker = min(scored, key=lambda x: (x[1], x[2]))[0]
            
            self._rr_index[step.syscall] = (rr + 1) % len(eligible)
            
            # Dispatch task to NATS (instead of local execution)
            payload = task_message(process, step, memory_inputs=json_safe_memory)
            
            print(f"[NATS-PUB] subject= axr.tasks.{target_worker} size= {len(payload)}")
            
            asyncio.run_coroutine_threadsafe(
                self.nats.publish(f"axr.tasks.{target_worker}",payload),
                self.loop,
            )
            
            
            print(f"[ROUTE] {step.syscall} -> {target_worker}")
            
            self.lease_manager.start_lease(process.pid, step.step_id, target_worker)
            self._lease_worker_map[step.step_id] = target_worker
            
            
        except PermissionError as e:
            step.fail(str(e))
            with self._lock:
                self._active_steps_per_process[process.pid] = max(0, self._active_steps_per_process[process.pid] -1)
            self.repo.save_step(step)
            self.repo.save_process(process)

            if step.failure_policy == "retry" and self.retry_manager.should_retry(step):
                self.retry_manager.apply_backoff(step)
                self.retry_manager.mark_retry(step, str(e))
                print(f"[RETRY] Retrying {step.syscall}")
                self.event_bus.publish(
                    Event(
                        event_type="STEP_RETRIED",
                        pid=process.pid,
                        step_id=step.step_id,
                        metadata={"attempt": step.retries},
                    )
                )
                return

            if step.failure_policy == "skip":
                step.status = StepStatus.SKIPPED
                print(f"[SKIP] {step.syscall} skipped")
                self.event_bus.publish(
                    Event(
                        event_type="STEP_SKIPPED",
                        pid=process.pid,
                        step_id=step.step_id,
                        metadata={"attempt": step.retries},
                    )
                )
                return

            process.fail("Security violation")
            print(f"[DENY] STEP={step.syscall}")
            self.event_bus.publish(
                Event(
                    event_type="STEP_FAILED",
                    pid=process.pid,
                    step_id=step.step_id,
                    metadata={"error": str(e)},
                )
            )
            self.transaction_manager.rollback_process(process, self.steps[process.pid])

        except Exception as e:
            step.fail(str(e))
            with self._lock:
                self._active_steps_per_process[process.pid] = max(0, self._active_steps_per_process[process.pid] -1)
            self.repo.save_step(step)
            self.repo.save_process(process)

            if step.failure_policy == "retry" and self.retry_manager.should_retry(step):
                self.retry_manager.apply_backoff(step)
                self.retry_manager.mark_retry(step, str(e))
                print(f"[RETRY] Retrying {step.syscall}")
                self.event_bus.publish(
                    Event(
                        event_type="STEP_RETRIED",
                        pid=process.pid,
                        step_id=step.step_id,
                        metadata={"attempt": step.retries},
                    )
                )
                return

            if step.failure_policy == "skip":
                step.status = StepStatus.SKIPPED
                print(f"[SKIP] {step.syscall} skipped")
                self.event_bus.publish(
                    Event(
                        event_type="STEP_SKIPPED",
                        pid=process.pid,
                        step_id=step.step_id,
                        metadata={"attempt": step.retries},
                    )
                )
                return

            process.fail(str(e))
            self.event_bus.publish(
                Event(
                    event_type="STEP_FAILED",
                    pid=process.pid,
                    step_id=step.step_id,
                    metadata={"error": str(e)},
                )
            )
            print(f"[FAIL] STEP={step.syscall} ERROR={e}")
            self.transaction_manager.rollback_process(process, self.steps[process.pid])
    
    
    # ---------------------------
    # Process completion check
    # ---------------------------

    def _finalize_processes(self) -> None:
        with self._lock:
            for pid, process in self.processes.items():

                # Skip already finalized processes
                if getattr(process, "finalized", False):
                    continue

                steps = self.steps.get(pid, [])

                if not steps:
                    continue

                all_done = all(
                    step.status in {StepStatus.SUCCESS, StepStatus.SKIPPED}
                    for step in steps
                )

                any_failed = any(step.status == StepStatus.FAILED for step in steps)

                # SUCCESS PATH
                if all_done:
                    self.event_bus.publish(
                        Event(
                            event_type="PROCESS_SUCCEEDED",
                            pid=process.pid,
                        )
                    )

                    process.terminate()
                    process.finalized = True  # prevent re-emission
                    self._active_steps_per_process.pop(process.pid, None)
                    self.repo.save_process(process)

                    print(f"[PROCESS] {process.pid} finalized as SUCCEEDED")

                # FAILURE PATH
                elif any_failed and process.state != ProcessState.FAILED:
                    self.event_bus.publish(
                        Event(
                            event_type="PROCESS_FAILED",
                            pid=process.pid,
                        )
                    )

                    process.fail("One or more steps failed")
                    process.finalized = True  # prevent re-emission
                    self._active_steps_per_process.pop(process.pid, None)
                    self.repo.save_process(process)

                    print(f"[PROCESS] {process.pid} finalized as FAILED")
                    
    
    def resume_process(self, process: AIProcess):
        print(f"[RESUME] Restoring process {process.pid}")
        
        steps = self.steps.get(process.pid)
        if not steps:
            return
        
        self.checkpoint_manager.restore_checkpoint(process, steps)
        
        process.state =  ProcessState.RUNNING
    
    
    async def _on_result(self, msg):
        import json
        
        data = json.loads(msg.data.decode())
        
        pid = UUID(data['pid'])
        step_id = UUID(data['step_id'])
        
        process = self.processes.get(pid)
        steps = self.steps.get(pid, [])
        
        step = next((s for s in steps if s.step_id == step_id), None)
        if not step:
            return
        
        self.lease_manager.complete_lease(step_id)
        self._lease_worker_map.pop(step_id, None)
        
        if pid in self._active_steps_per_process:
            self._active_steps_per_process[pid] = max(
                0, 
                self._active_steps_per_process.get(pid, 0) -1
            )

        if data['status'] == "success":
            step.succeed()
        
            if data.get("output"):
                self.memory_manager.write_output(pid, step_id, data["output"])
            
            
            self.event_bus.publish(
                Event(event_type="STEP_SUCCEEDED", pid=pid, step_id=step_id
                      )
            )
        
        else:
            step.fail(data.get("error", "Worker failure"))
            
            self.event_bus.publish(
                Event(
                    event_type="STEP_FAILED",
                    pid=pid,
                    step_id=step_id,
                    metadata={"error": data.get("error")},
                )
            )
        
        self.repo.save_step(step)
        self.repo.save_process(process)
        
        self.resource_manager.release(pid)
        print(f"[RESULT] RAW {msg.subject} {msg.data}")
        
    async def _handle_heartbeat(self, msg):
        import json
        
        data = json.loads(msg.data.decode())
        
        worker_id = data["worker_id"]
        tools = data["tools"]
        capacity = data.get("capacity", 1)
        
        self.worker_registry.register(worker_id, tools, capacity)
        
        print(f"[HB] Woker {worker_id} tools= {tools}")
        
        
        
    def _check_expired_leases(self):
        expired = self.lease_manager.get_expired()

        for pid, step_id in expired:
            print(f"[LEASE] Step {step_id} expired → requeue")

            steps = self.steps.get(pid, [])
            step = next((s for s in steps if s.step_id == step_id), None)

            if not step:
                continue

            # mark step back to READY
            step.status = StepStatus.READY
            step.retries += 1

            self.event_bus.publish(
                Event(
                    event_type="STEP_REQUEUED",
                    pid=pid,
                    step_id=step_id,
                    metadata={"reason": "lease_timeout", "retry": step.retries},
                )
            )

            # release resource slot
            self.resource_manager.release(pid)

            # remove old lease
            self.lease_manager.complete_lease(step_id)
            
            if pid in self._active_steps_per_process:
                self._active_steps_per_process[pid] = max(
                    0,
                    self._active_steps_per_process[pid] - 1
                )
       
    
    def _get_worker_load(self):
        load = {}
        
        for step_id, worker_id in self._lease_worker_map.items():
            load[worker_id] = load.get(worker_id, 0) + 1
        
        return load
    
    
    def run_once(self) -> None:
        """
        Run ad single scheduling cycle (for testing).
        """
        self._schedule_cycle()


    