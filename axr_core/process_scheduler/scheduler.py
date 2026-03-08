from __future__ import annotations
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List, Optional
from uuid import UUID
import asyncio
import json
from datetime import datetime
import os
import functools

from axr_core.process_manager.process import AIProcess, ProcessState
from axr_core.process_graph.models import ProcessStep, StepStatus
from axr_core.process_graph.resolver import ProcessGraphResolver
from axr_core.security_module.evaluator import SecurityEvaluator
from axr_core.capabilities.issuer import CapabilityIssuer
from axr_core.capabilities.validator import CapabilityValidator
from axr_core.capabilities.models import Capability
from axr_core.syscalls.exec_handler import ExecHandler
from axr_core.process_memory.memory_manager import ProcessMemoryManager
from axr_core.transactions.transaction_manager import TransactionManager
from axr_core.checkpointing.checkpoint_manager import CheckpointManager
from axr_core.retry.retry_manager import RetryManager
from axr_core.events.event_bus import EventBus
from axr_core.events.event import Event, EventType
from axr_core.resource_manager.resource_manager import ResourceManager
from axr_core.resource_manager.resource_model import ProcessResources
from axr_core.persistence.repository import PersistenceRepository
from axr_core.distributed.nats_client import NATSClient
from axr_core.distributed.message import task_message
from axr_core.reliability.lease_manager import LeaseManager
from axr_core.distributed.worker_registry import worker_registry
from axr_core.event_scheduler.scheduler import EventDrivenScheduler
from axr_core.cluster.autoscaler import WorkerAutoScaler
from axr_core.artifacts.artifact_manager import artifact_manager
from opentelemetry import trace
from opentelemetry.context import get_current

# Telemetry imports with fallback
try:
    from axr_core.telemetry import (
        setup_telemetry as _setup_telemetry,
        get_tracer as _get_tracer,
        ENABLED as TELEMETRY_ENABLED
    )
    from axr_core.telemetry.metrics import (
        record_step_duration,
        record_worker_load,
        update_active_steps,
        update_process_state
    )
    from axr_core.telemetry.tracing import (
        trace_step,
        trace_async_step,
        trace_nats_message,
        trace_scheduler_cycle
    )
    
    TELEMETRY_AVAILABLE = True
except ImportError as e:
    print(f"[TELEMETRY] ⚠️ Telemetry not available: {e}")
    TELEMETRY_AVAILABLE = False
    TELEMETRY_ENABLED = False
    
    # Create dummy decorators
    def trace_step(func):
        return func
    def trace_async_step(func):
        return func
    def trace_nats_message(func):
        return func
    
    # Create dummy functions
    def _setup_telemetry(*args, **kwargs):
        return None
    def _get_tracer(*args, **kwargs):
        return None
    def record_step_duration(*args, **kwargs):
        pass
    def record_worker_load(*args, **kwargs):
        pass
    def update_active_steps(*args, **kwargs):
        pass
    def update_process_state(*args, **kwargs):
        pass

class ProcessScheduler:
    
    def __init__(self, max_workers: int = 50, poll_interval: float = 0.1):
        self.processes: Dict[UUID, AIProcess] = {}
        self.steps: Dict[UUID, List[ProcessStep]] = {}
        self._process_rr_index = 0
        self.global_max_parallel = max_workers
        self._global_active_steps = 0
        
        self.poll_interval = poll_interval

        self._lock = threading.RLock()
        self._running = False
        
        # Initialize security module
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
        self.worker_registry = worker_registry

        self._lease_worker_map: Dict[UUID, str] = {}
        
        self.max_parallel_per_process = 10
        self._active_steps_per_process: Dict[UUID, int] = {}
        
        self._retry_queue: Dict[UUID, float] = {}
        self.MAX_RETRIES = 3
        self.BASE_BACKOFF = 0.5
        self._rr_index: Dict[str, int] = {}
        
        # NATS client
        self.nats = None
        self.loop = None
        
        # Initialize telemetry
        self.tracer = None
        if TELEMETRY_AVAILABLE and os.getenv("OTEL_ENABLED", "false").lower() == "true":
            _setup_telemetry("axr-scheduler")
            self.tracer = _get_tracer("scheduler")
        else:
            print("[TELEMETRY] ⚠️ Telemetry disabled for scheduler")
            
        
        
        # Add after other initializations
        from axr_core.advanced_scheduler.scheduler import AdvancedScheduler

        self.advanced_scheduler = AdvancedScheduler()

        # Register default tenant
        self.advanced_scheduler.register_tenant(
            tenant_id="default",
            quota=None,  # Use default quota
            priority=1
        )
        
        self.tasks = set()  # Track async tasks
        self.max_concurrent_tasks = max_workers
        self._last_worker_for_tool = {} 
        self.semaphore = asyncio.Semaphore(max_workers)

        self.event_scheduler = EventDrivenScheduler(self)
        self.autoscaler = WorkerAutoScaler(self)
    
    #------------------------------
    # NATS Server
    # -----------------------------
    
    async def init_nats(self):
        self.nats = NATSClient()
        self.loop = asyncio.get_running_loop()
        
        await self.nats.connect()
        await self.nats.subscribe("axr.results", self._on_result)
        await self.nats.subscribe("axr.heartbeat", cb=self._handle_heartbeat)
        await self.nats.nc.flush()
    
    # ---------------------------
    # Debug methods
    # ---------------------------
    
    def _debug_resource_state(self, pid: UUID = None):
        with self._lock:
            if pid:
                active = self._active_steps_per_process.get(pid, 0)
                resource_active = self.resource_manager.get_active_steps(pid)
                print(f"[DEBUG] Process {pid}: active_steps={active}, "
                      f"resource_active={resource_active}, "
                      f"global_active={self._global_active_steps}")
            else:
                print(f"[DEBUG] Global active steps: {self._global_active_steps}")
                for pid, active in self._active_steps_per_process.items():
                    resource_active = self.resource_manager.get_active_steps(pid)
                    print(f"  Process {pid}: scheduler_active={active}, "
                          f"resource_active={resource_active}")
    
    # ---------------------------
    # Kernel registration methods
    # ---------------------------

    def register_process(self, process: AIProcess, steps: List[ProcessStep]) -> None:
        with self._lock:
            self.processes[process.pid] = process
            self.steps[process.pid] = steps

            self.resource_manager.register_process(
                process.pid,
                ProcessResources(
                    max_concurrent_steps=10,
                    max_budget=process.budget_limit
                ),
            )

            self.repo.save_process(process)
            for step in steps:
                self.repo.save_step(step)

            self._restore_process_state(process)

            tenant_id = getattr(process, "tenant_id", "default")
            self.advanced_scheduler.allocate_process(process.pid, tenant_id)

        # Trigger event scheduler
        asyncio.create_task(self.event_scheduler.enqueue(process))

        print(f"[SCHED] New process {str(process.pid)[:8]}")


    # ---------------------------
    # Kernel loop control
    # ---------------------------

    async def start(self) -> None:
        """Start the scheduler asynchronously"""
        self._running = True
        print("[SCHEDULER] ▶️ Started (async mode)")
        

    def stop(self) -> None:
        """Stop the scheduler"""
        self._running = False
        
        # Cancel all running tasks
        for task in self.tasks:
            task.cancel()
        
        # Clear tasks set
        self.tasks.clear()
        
        print("[SCHEDULER] ⏹️ Stopped")
    # ---------------------------
    # Core scheduling cycle
    # ---------------------------
    
    @trace_scheduler_cycle
    async def _schedule_cycle(self) -> None:
        """Async scheduling cycle with advanced policies"""
        
        
        cycle_start = time.time()
        
        # Process retries first (this can remain sync)
        now = time.time()
        ready_retry_steps = [
            sid for sid, ts in list(self._retry_queue.items()) if ts <= now
        ]
        
        for sid in ready_retry_steps:
            for pid, steps in list(self.steps.items()):
                step = next((s for s in steps if s.step_id == sid), None)
                if step and step.status == StepStatus.PENDING:
                    print(f"[RETRY-READY] {step.syscall}")
                    step.mark_ready()
                    self.repo.save_step(step)
            self._retry_queue.pop(sid, None)
        
        # Debug current resource state
        self._last_cycle_print = getattr(self, "_last_cycle_print", 0)

        if time.time() - self._last_cycle_print > 5:
            print(f"[SCHED-CYCLE] Active: {self._global_active_steps}")
            self._last_cycle_print = time.time()
        
        # Get active processes
        with self._lock:
            active_processes = [
                p for p in list(self.processes.values())
                if p.is_active()
                and p.state != ProcessState.PAUSED
                and not getattr(p, "finalized", False)
            ]
        
        if not active_processes:
            return
        
        # Use advanced scheduler to select next process
        context = {"cycle_start": cycle_start}
        selected_process = self.advanced_scheduler.select_next_process(
            active_processes, context
        )
        
        if TELEMETRY_ENABLED:
            span = trace.get_current_span()
            if span and span.is_recording():
                span.set_attribute("scheduler.selected_step", selected_step.syscall)

        if not selected_process:
            return
        
        # Handle process state
        process = selected_process
        if process.state == ProcessState.READY:
            process.start()
            self._active_steps_per_process[process.pid] = 0
            self.event_bus.publish(
                Event(type=EventType.PROCESS_STARTED, pid=process.pid)
            )
        
        # Get steps for this process
        steps = self.steps.get(process.pid, [])
        if not steps:
            return
        
        # Resolve runnable steps
        resolver = ProcessGraphResolver(steps)
        runnable_steps = resolver.resolve()
        
        # Mark PENDING steps as READY if dependencies satisfied
        for s in runnable_steps:
            if s.status == StepStatus.PENDING:
                s.mark_ready()
        
        # Filter to only READY steps
        ready_steps = [s for s in runnable_steps if s.status == StepStatus.READY]
        
        if ready_steps:
            print(f"[RESOLVE] Runnable steps: {[s.syscall for s in ready_steps]}")
        
        # Use advanced scheduler to select next step
        selected_step = self.advanced_scheduler.select_next_step(
            process, ready_steps, context
        )
        
        if TELEMETRY_ENABLED:
            span = trace.get_current_span()
            if span and span.is_recording():
                span.set_attribute("scheduler.selected_step", selected_step.syscall)
                        
        step = selected_step
        
        # Add trace attributes for selected step
        if TELEMETRY_ENABLED and self.tracer:
            span = trace.get_current_span()
            span.set_attribute("selected.step", step.syscall)
        
        # Check parallel limits
        active = self._active_steps_per_process.get(process.pid, 0)
        if active >= self.max_parallel_per_process:
            print(f"[FAIR] Process {process.pid} hit parallel limit (active={active})")
            return
        
        # Check if step can be scheduled
        if not self._can_schedule_step(process, step):
            return
        
        # Global parallel limit check
        if self._global_active_steps >= self.global_max_parallel:
            print("[GLOBAL-FAIR] Global parallel limit reached")
            return
        
        # Allocate resource
        if not self.resource_manager.allocate(process.pid):
            print(f"[ERROR] Failed to allocate resource for PID={process.pid}")
            return
        
        # Update counts
        with self._lock:
            self._active_steps_per_process[process.pid] = (
                self._active_steps_per_process.get(process.pid, 0) + 1
            )
            self._global_active_steps += 1
        
        # Publish READY event
        self.event_bus.publish(
            Event(
                type=EventType.STEP_READY,
                pid=process.pid,
                step_id=step.step_id,
                metadata={"syscall": step.syscall},
            )
        )
        
        # Mark step as started
        step.start()
        process.current_step_id = step.step_id
        process.mark_scheduled()
        
        print(f"[FAIR-DEBUG] pid={process.pid} active={self._active_steps_per_process[process.pid]}")
        
        # Submit for execution - NOW ASYNC WITH SEMAPHORE
        await self.semaphore.acquire()
        ctx = get_current()
        task = asyncio.create_task(
            self._execute_step(process, step),
            context=ctx
        )
        task.add_done_callback(lambda t: self.semaphore.release())
        self.tasks.add(task)
        task.add_done_callback(self.tasks.discard)
        
        # Finalize any completed processes
        self._finalize_processes()
        self._check_expired_leases()
        
        print("[SCHED] Active processes:", [str(p.pid)[:8] for p in active_processes])
        
    
    def _schedule_cycle_no_telemetry(self):
        """Schedule cycle without telemetry (original code)"""
        now = time.time()
        
        ready_retry_steps = [
            sid for sid, ts in list(self._retry_queue.items()) if ts <= now
        ]

        for sid in ready_retry_steps:
            for pid, steps in list(self.steps.items()):
                step = next((s for s in steps if s.step_id == sid), None)
                if step and step.status == StepStatus.PENDING:
                    print(f"[RETRY-READY] {step.syscall}")
                    step.mark_ready()
                    self.repo.save_step(step)
            self._retry_queue.pop(sid, None)
        
        print(f"\n[SCHED-CYCLE] Global active steps: {self._global_active_steps}")
        
        with self._lock:
            active_processes = [
                p for p in list(self.processes.values())
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
                
            print(f"[SCHED] Checking process {process.pid} STATE={process.state}")

            if process.state == ProcessState.READY:
                process.start()
                self._active_steps_per_process[process.pid] = 0
                self.event_bus.publish(
                    Event(type=EventType.PROCESS_STARTED, pid=process.pid)
                )

            steps = self.steps.get(process.pid, [])
            if not steps:
                continue
                
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
                    print(f"[FAIR] Process {process.pid} hit parallel limit (active={active})")
                    continue

                if not self.security_evaluator.allow(process, step):
                    print(f"[SECURITY] Blocked {step.syscall} for PID={process.pid}")
                    step.fail("Blocked by security policy")
                    self.repo.save_step(step)
                    self.event_bus.publish(
                        Event(
                            type=EventType.STEP_FAILED,
                            pid=process.pid,
                            step_id=step.step_id,
                            metadata={"reason": "security_policy"},
                        )
                    )
                    
                    self._finalize_processes()
                    # 🔑 trigger scheduler reevaluation
                    try:
                        asyncio.create_task(self.event_scheduler.enqueue(process))
                    except Exception:
                        pass

                    continue
                
                remaining_budget = process.remaining_budget()

                if not self.resource_manager.can_schedule(
                    process.pid, step.cost_estimate, remaining_budget
                ):
                    print(f"[RESOURCE] No slot for PID={process.pid}")
                    continue

                if self._global_active_steps >= self.global_max_parallel:
                    print("[GLOBAL-FAIR] Global parallel limit reached")
                    continue

                self.event_bus.publish(
                    Event(
                        type=EventType.STEP_READY,
                        pid=process.pid,
                        step_id=step.step_id,
                        metadata={"syscall": step.syscall},
                    )
                )
                
                step.start()
                process.current_step_id = step.step_id
                process.mark_scheduled()

                if not self.resource_manager.allocate(process.pid):
                    print(f"[ERROR] Failed to allocate resource for PID={process.pid}")
                    continue

                with self._lock:
                    self._active_steps_per_process[process.pid] = (
                        self._active_steps_per_process.get(process.pid, 0) + 1
                    )
                    self._global_active_steps += 1

                print(
                    f"[FAIR-DEBUG] pid={process.pid} active="
                    f"{self._active_steps_per_process[process.pid]}"
                )

                futures.append(self.executor.submit(self._execute_step, process, step))
                break

        for future in as_completed(futures):
            pass

        self._finalize_processes()
        self._check_expired_leases()
        self._process_rr_index = (start_index + 1) % count

    # ---------------------------
    # Step execution
    # ---------------------------
    
    @trace_async_step
    async def _execute_step(self, process: AIProcess, step: ProcessStep) -> None:
        """Execute a step with quota tracking (async version)"""
        
        # Update active steps metric
        if TELEMETRY_ENABLED:
            update_active_steps(str(process.pid), 
                self._active_steps_per_process.get(process.pid, 0))
        
        start_time = time.time()
        
        # Record step start in quota manager
        self.advanced_scheduler.record_step_start(process.pid)
        
        # Publish started event
        self.event_bus.publish(
            Event(
                type=EventType.STEP_STARTED,
                pid=process.pid,
                step_id=step.step_id,
                metadata={"syscall": step.syscall},
            )
        )
        
        try:
            print(f"[EXEC] PID={str(process.pid)[:8]} STEP={step.syscall}")
            
            # Charge budget
            process.charge_budget(step.cost_estimate)
            self.repo.save_process(process)
            
            # Try to acquire worker with improved method
            target_worker = await self._acquire_worker_for_step(step.syscall)
            
            if not target_worker:
                print(f"[EXEC] No worker available for {step.syscall}")
                
                # Schedule retry
                self._schedule_retry(process, step, "no_workers")
                
                # Record step completion in quota manager (failure)
                duration = time.time() - start_time
                self.advanced_scheduler.record_step_complete(
                    process.pid, duration, step.cost_estimate
                )
                
                # Release resources
                self.resource_manager.release(process.pid)
                self._decrement_active(process.pid)
                self._global_active_steps = max(0, self._global_active_steps - 1)
                self._debug_resource_state(process.pid)
                
                # Record metrics
                if TELEMETRY_ENABLED:
                    record_step_duration(step.syscall, duration, "failed")
                return
            
            # Issue capability
            cap = self.capability_issuer.issue(
                pid=process.pid,
                step_id=step.step_id,
                syscall=step.syscall,
                budget_limit=step.cost_estimate
            )
            
            print(f"[CAP] Issued cap_id={str(cap.cap_id)[:8]} syscall={cap.syscall}")
            
            # Get process memory
            process_memory = self.memory_manager.read_process_memory(process.pid)
            json_safe_memory = {str(k): v for k, v in process_memory.items()}
            
            # Prepare NATS message with trace headers
            from axr_core.telemetry.tracing import inject_trace_headers
            headers = inject_trace_headers()  # Creates dict with trace context
            payload = task_message(process, step, memory_inputs=json_safe_memory, capability=cap)
            
            # Update step state
            step.assigned_worker = target_worker
            step.status = StepStatus.RUNNING
            self.repo.save_step(step)
            
            print(f"[NATS-PUB] subject=axr.tasks.{target_worker[:8]} size={len(payload)}")
            
            # Check NATS connection
            if not self.nats or not self.nats.is_connected:
                print(f"[NATS] ❌ Not connected to NATS server")
                self.worker_registry.release_worker(target_worker)
                self._schedule_retry(process, step, "nats_disconnected")
                # Record failure metrics
                duration = time.time() - start_time
                self.resource_manager.release(process.pid)
                self._decrement_active(process.pid)
                self._global_active_steps = max(0, self._global_active_steps - 1)
                if TELEMETRY_ENABLED:
                    record_step_duration(step.syscall, duration, "failed")
                return
            
            # Publish to NATS with headers
            try:
                # Use await directly since we're in async context
                if TELEMETRY_ENABLED and self.tracer:
                    with self.tracer.start_as_current_span("nats.publish") as span:
                        span.set_attribute("worker.id", target_worker[:8])
                        span.set_attribute("step.syscall", step.syscall)
                        span.set_attribute("nats.subject", f"axr.tasks.{target_worker}")

                        await self.nats.publish(
                            f"axr.tasks.{target_worker}",
                            payload,
                            headers=headers
                        )
                else:
                    await self.nats.publish(
                        f"axr.tasks.{target_worker}",
                        payload,
                        headers=headers
                    )
                print(f"[ROUTE] ✅ {step.syscall} -> Worker_ID: {target_worker[:8]}")
                
                # Start lease tracking
                with self._lock:
                    self.lease_manager.start_lease(process.pid, step.step_id, target_worker)
                    self._lease_worker_map[step.step_id] = target_worker
                    
            except asyncio.TimeoutError:
                print(f"[NATS-ERROR] Timeout publishing to {target_worker[:8]}")
                self.worker_registry.release_worker(target_worker)
                self._schedule_retry(process, step, "nats_timeout")
                # Record failure metrics
                duration = time.time() - start_time
                self.advanced_scheduler.record_step_complete(process.pid, duration, step.cost_estimate)
                self.resource_manager.release(process.pid)
                self._decrement_active(process.pid)
                self._global_active_steps = max(0, self._global_active_steps - 1)
                if TELEMETRY_ENABLED:
                    record_step_duration(step.syscall, duration, "failed")
                return
                
            except Exception as e:
                error_msg = str(e) if str(e) else "Unknown NATS error"
                print(f"[NATS-ERROR] Failed to publish to {target_worker[:8]}: {error_msg}")
                self.worker_registry.release_worker(target_worker)
                self._schedule_retry(process, step, "nats_error")
                # Record failure metrics
                duration = time.time() - start_time
                self.advanced_scheduler.record_step_complete(process.pid, duration, step.cost_estimate)
                self.resource_manager.release(process.pid)
                self._decrement_active(process.pid)
                self._global_active_steps = max(0, self._global_active_steps - 1)
                if TELEMETRY_ENABLED:
                    record_step_duration(step.syscall, duration, "failed")
                return
            
        except Exception as e:
            print(f"[EXEC-ERROR] {e}")
            
            # Fail the step
            step.fail(str(e))
            self.event_bus.publish(
                Event(
                    type=EventType.STEP_FAILED,
                    pid=process.pid,
                    step_id=step.step_id,
                    metadata={"error": str(e)},
                )
            )
            
            # Fail the process
            process.fail(str(e))
            
            # Release worker if acquired
            if 'target_worker' in locals() and target_worker:
                self.worker_registry.release_worker(target_worker)
            
            # Clean up lease
            with self._lock:
                self.lease_manager.complete_lease(step.step_id)
                self._lease_worker_map.pop(step.step_id, None)
            
            # Record step completion in quota manager (failure)
            duration = time.time() - start_time
            self.advanced_scheduler.record_step_complete(
                process.pid, duration, step.cost_estimate
            )
            
            # Release resources
            self.resource_manager.release(process.pid)
            with self._lock:
                self._active_steps_per_process[process.pid] = max(
                    0, self._active_steps_per_process[process.pid] - 1
                )
            self._global_active_steps = max(0, self._global_active_steps - 1)
            
            self._debug_resource_state(process.pid)
            
            # Schedule retry if needed
            if step.failure_policy == "retry":
                self._schedule_retry(process, step, str(e))
            
            # Record metrics
            if TELEMETRY_ENABLED:
                record_step_duration(step.syscall, duration, "failed")
            return
        
        finally:
            # Save step and process state
            self.repo.save_step(step)
            self.repo.save_process(process)
            
            # If step succeeded, record completion
            if step.status == StepStatus.SUCCESS:
                duration = time.time() - start_time
                self.advanced_scheduler.record_step_complete(
                    process.pid, duration, step.cost_estimate
                )
                
                if TELEMETRY_ENABLED:
                    record_step_duration(step.syscall, duration, "success")
                    
    # ---------------------------
    # On Result
    # ---------------------------
    
    @trace_nats_message
    async def _on_result(self, msg):
            
        data = json.loads(msg.data.decode())

        pid = UUID(data["pid"])
        step_id = UUID(data["step_id"])
        
        if TELEMETRY_ENABLED:
            span = trace.get_current_span()

            span.set_attribute("process.id", str(pid)[:8])
            span.set_attribute("step.id", str(step_id)[:8])
            span.set_attribute("result.status", data.get("status"))

        process = self.processes.get(pid)
        steps = self.steps.get(pid, [])
        step = next((s for s in steps if s.step_id == step_id), None)

        if not process or not step:
            return
        
        if process and process.state == ProcessState.FAILED:
            print(f"[RESULT-IGNORED] Process {pid} already failed/cancelled")
            return

        worker_id = None
        with self._lock:
            worker_id = self._lease_worker_map.get(step_id)

        try:
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
                    issuer=cap_data.get("issuer", "axr-scheduler"),  # Add this
                )
                
                if not self.capability_validator.validate_strict(cap, process, step):
                    print(f"[CAP] Invalid capability for step {data['step_id']}")
                    step.fail("Invalid capability")
                    self.repo.save_step(step)
                    return
                else:
                    print(f"[CAP] Valid capability for step {data['step_id']}")
            else:
                print(f"[CAP-ERROR] Missing capability for step {step_id}")
                step.fail("Missing capability token")
                self.repo.save_step(step)
                self.repo.save_process(process)
                return

            if data["status"] == "success":
                step.succeed()
            
                await self.event_scheduler.enqueue(process)

                # Record step completion in quota manager
                duration = (datetime.now() - process.started_at).total_seconds() if process.started_at else 0
                self.advanced_scheduler.record_step_complete(
                    pid, 0, step.cost_estimate
                )

                if data.get("output"):
                    output = data["output"]
                    
                    self.memory_manager.write_output(pid, step_id, data["output"])
                    

                    artifacts = artifact_manager.handle_step_output(
                        pid,
                        step_id,
                        output
                    )
                    
                    if artifacts:
                        print(f"[ARTIFACT] Stored {len(artifacts)} artifacts")

                self.event_bus.publish(
                    Event(
                        type=EventType.STEP_SUCCEEDED,
                        pid=pid,
                        step_id=step_id,
                    )
                )

                self.checkpoint_manager.save_checkpoint(
                    process,
                    self.steps.get(pid, [])
                )
                
                print(f"✨ SUCCESS: {step.syscall} completed for process {str(pid)[:8]}\n")
                
            else:
                error_msg = data.get("error", "Worker failure")

                if step.failure_policy == "retry":
                    self._schedule_retry(process, step, error_msg)
                elif step.failure_policy == "skip":
                    step.status = StepStatus.SKIPPED
                    self.event_bus.publish(
                        Event(
                            type=EventType.STEP_SKIPPED,
                            pid=pid,
                            step_id=step_id,
                            metadata={"error": error_msg},
                        )
                    )
                else:
                    step.fail(error_msg)
                    self.event_bus.publish(
                        Event(
                            type=EventType.STEP_FAILED,
                            pid=pid,
                            step_id=step_id,
                            metadata={"error": error_msg},
                        )
                    )
        
        finally:
            with self._lock:
                self.lease_manager.complete_lease(step_id)
                self._lease_worker_map.pop(step_id, None)
                self.repo.save_step(step)
                
                if pid in self._active_steps_per_process:
                    self._active_steps_per_process[pid] = max(
                        0, self._active_steps_per_process[pid] - 1
                    )
                
                self._global_active_steps = max(0, self._global_active_steps - 1)
            
            if worker_id:
                self.worker_registry.release_worker(worker_id)
            
            self.resource_manager.release(pid)
            self._debug_resource_state(pid)
            self._finalize_processes()
    
    # ---------------------------
    # Heartbeat Handler
    # ---------------------------
    
    @trace_nats_message
    async def _handle_heartbeat(self, msg):
        """Handle worker heartbeat messages"""
        data = json.loads(msg.data.decode())
        
        # Add trace attributes
        if TELEMETRY_ENABLED and self.tracer:
            span = trace.get_current_span()
            span.set_attribute("worker.id", data.get("worker_id", "unknown")[:8])

        worker_id = data["worker_id"]
        
        tools = data.get("tools", [])
        capacity = data.get("capacity", 10)
        load = data.get("load", 0)

        if tools:
            self.worker_registry.register(worker_id, tools, capacity)

        self.worker_registry.heartbeat(worker_id, load)
        
        if TELEMETRY_ENABLED:
            record_worker_load(worker_id, load, tools)

        # wake scheduler when new worker appears
        for process in self.processes.values():
            if process.is_active():
                asyncio.create_task(self.event_scheduler.enqueue(process))

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
        to_remove = []
        
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
                
                if (any_failed or any_skipped) and not getattr(process, "finalized", False):
                    print(f"[PROCESS] {pid} transitioning to FAILED → triggering rollback")

                    process.fail("One or more steps failed/skipped")
                    process.finalized = True
                    self.repo.save_process(process)

                    try:
                        self.transaction_manager.rollback_process(process, steps)
                        self.checkpoint_manager.save_checkpoint(
                            process,
                            self.steps.get(pid, [])
                        )
                        
                    except Exception as e:
                        print(f"[TXN-ERROR] Rollback failed for PID={pid}: {e}")

                    self.event_bus.publish(
                        Event(type=EventType.PROCESS_FAILED, pid=pid)
                    )
                    
                    print(f"\n[PROCESS] {pid} finalized as FAILED\n")

                    self._active_steps_per_process.pop(pid, None)
                    
                    if TELEMETRY_ENABLED:
                        update_process_state(str(pid), "FAILED", process.intent)
                        
                    continue

                if all_success:
                    self.checkpoint_manager.save_checkpoint(process, steps)

                    self.event_bus.publish(
                        Event(type=EventType.PROCESS_COMPLETED, pid=pid)
                    )

                    print(f"\n[PROCESS] {pid} finalized as SUCCEEDED\n")

                    process.terminate()
                    process.finalized = True
                    self.repo.save_process(process)

                    self._active_steps_per_process.pop(pid, None)

                    if TELEMETRY_ENABLED:
                        update_process_state(str(pid), "COMPLETED", process.intent)
                        
                    to_remove.append(pid)
                    
            
            # ------ SAFE CLEANUP AFTER LOOP ------
            for pid in to_remove:
                self.processes.pop(pid, None)
                self.steps.pop(pid, None)
                self._active_steps_per_process.pop(pid, None)
                                       
    # -------------------------------
    # Worker Load
    # -------------------------------
    
    def _get_worker_load(self):
        return self.worker_registry.get_all_loads()
    
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

            worker_id = None
            with self._lock:
                worker_id = self._lease_worker_map.get(step_id)

            step.status = StepStatus.READY
            step.retries += 1
            step.assigned_worker = None
            self.repo.save_step(step)

            self.event_bus.publish(
                Event(
                    type=EventType.STEP_REQUED,
                    pid=pid,
                    step_id=step_id,
                    metadata={"reason": "lease_timeout", "retry": step.retries},
                )
            )

            if worker_id:
                self.worker_registry.release_worker(worker_id)
            
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

        process.fail("Cancelled by user")
        process.finalized = True
        self.repo.save_process(process)

        for step in steps:
            if step.status == StepStatus.RUNNING:
                step.fail("Cancelled")
                
                worker_id = None
                with self._lock:
                    worker_id = self._lease_worker_map.get(step.step_id)
                if worker_id:
                    self.worker_registry.release_worker(worker_id)

            self.lease_manager.complete_lease(step.step_id)
            self._lease_worker_map.pop(step.step_id, None)
            step.assigned_worker = None
            self.repo.save_step(step)

        self.resource_manager.release(pid)
        self._active_steps_per_process.pop(pid, None)

        self.event_bus.publish(
            Event(type=EventType.PROCESS_CANCELLED, pid=pid)
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
            Event(type=EventType.PROCESS_PAUSED, pid=pid)
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
            Event(type=EventType.PROCESS_RESUMED, pid=pid)
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
                    type=EventType.STEP_DEAD,
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
                type=EventType.STEP_RETRY_SCHEDULED,
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
        
        self.resource_manager.reset_usage(process.pid)
        self.checkpoint_manager.save_checkpoint(process, steps)
    
    def run_once(self) -> None:
        asyncio.run(self.start())
        
    def get_worker_status(self):
        return self.worker_registry.list_workers_with_health()
    
    
    
    def _can_schedule_step(self, process: AIProcess, step: ProcessStep) -> bool:
        """Check if a step can be scheduled (security, resources, quotas, workers)"""
        
        # 🔐 SECURITY CHECK
        if not self.security_evaluator.allow(process, step):
            print(f"[SECURITY] Blocked {step.syscall} for PID={process.pid}")
            step.fail("Blocked by security policy")
            self.repo.save_step(step)
            self.event_bus.publish(
                Event(
                    type=EventType.STEP_FAILED,
                    pid=process.pid,
                    step_id=step.step_id,
                    metadata={"reason": "security_policy"},
                )
            )
            
            self._finalize_processes()
            # 🔑 trigger scheduler reevaluation
            try:
                asyncio.create_task(self.event_scheduler.enqueue(process))
            except RuntimeError:
                pass

            return False
        
        # 🧠 RESOURCE CHECK (budget)
        remaining_budget = process.remaining_budget()
        if not self.resource_manager.can_schedule(
            process.pid, step.cost_estimate, remaining_budget
        ):
            print(f"[RESOURCE] No budget for PID={process.pid}")
            return False
        
        # 📊 QUOTA CHECK
        if not self.advanced_scheduler.quota_manager.can_schedule_step(
            process.pid, step.cost_estimate
        ):
            print(f"[QUOTA] Step {step.syscall} blocked by quota for PID={process.pid}")
            return False
        
        workers = self.worker_registry.get_workers_for_tool(step.syscall)
        
        # 👷 WORKER AVAILABILITY CHECK (new)
        if not workers:
            print(f"[AUTOSCALE] No worker for {step.syscall}")

            try:
                asyncio.create_task(
                    self.autoscaler.scale_up()
                )
            except RuntimeError:
                pass

            return False
        
        return True
    
    
    def _check_worker_availability(self, step_syscall: str) -> bool:
        """Check if a worker is available for this step type"""
        
        # Get all workers from registry
        workers = self.worker_registry.list_workers_with_health()
        
        if not workers:
            print(f"[WORKER] No workers registered at all")
            return False
        
        # Filter healthy workers that support this tool and have capacity
        available_workers = []
        for worker_id, info in workers.items():
            if not info.get("is_live", False):
                continue
                
            if step_syscall not in info.get("tools", []):
                continue
                
            running = info.get("running", 0)
            capacity = info.get("capacity", 1)
            
            if running < capacity:
                available_workers.append({
                    "id": worker_id[:8],
                    "load": running,
                    "capacity": capacity
                })
        
        if not available_workers:
            print(f"[WORKER] No available workers for {step_syscall}")
            # Log all workers for debugging
            for worker_id, info in workers.items():
                if info.get("is_live", False):
                    print(f"  Worker {worker_id[:8]}: tools={info.get('tools', [])}, "
                        f"load={info.get('running', 0)}/{info.get('capacity', 1)}")
            return False
        
        print(f"[WORKER] Available workers for {step_syscall}: {available_workers}")
        return True

    
    async def _acquire_worker_for_step(self, step_syscall: str) -> Optional[str]:
        """Acquire a worker for a step with load balancing"""
        
        if TELEMETRY_ENABLED and self.tracer:
            with self.tracer.start_as_current_span("worker.acquire") as span:
                span.set_attribute("step.syscall", step_syscall)
        else:
            span = None
        
        # Try to acquire worker with retry logic
        max_attempts = 3
        for attempt in range(max_attempts):
            worker_id = self.worker_registry.acquire_worker(step_syscall)
            if worker_id:
                load = self.worker_registry.get_worker_load(worker_id)
                print(f"[WORKER] ✅ Acquired {worker_id[:8]} for {step_syscall} (load: {load})")
                return worker_id
            
            if attempt < max_attempts - 1:
                print(f"[WORKER] Retry {attempt + 1}/{max_attempts} for {step_syscall}...")
                await asyncio.sleep(0.2)  # Small delay between retries
        
        print(f"[WORKER] ❌ Failed to acquire worker for {step_syscall} after {max_attempts} attempts")
        
        if span:
            span.set_attribute("worker.id",worker_id)
            span.end()
            
        return None
    
    async def wait_for_workers(self, timeout: int = 10) -> bool:
        """Wait for at least one worker to fully register (with tools)"""
        print(f"[WORKER] Waiting up to {timeout}s for workers to register...")
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            # Get all workers
            workers = self.worker_registry.list_workers()
            
            # Check if any worker has tools (fully registered)
            registered_workers = []
            for worker_id, info in workers.items():
                if info.get("tools") and len(info["tools"]) > 0:
                    registered_workers.append(worker_id)
            
            if registered_workers:
                print(f"[WORKER] ✅ {len(registered_workers)} workers registered: {[w[:8] for w in registered_workers]}")
                return True
            
            # Also check live workers as fallback
            live_workers = self.worker_registry.get_live_workers()
            if live_workers:
                print(f"[WORKER] ✅ {len(live_workers)} live workers found")
                return True
            
            await asyncio.sleep(0.5)
        
        print(f"[WORKER] ⚠️ No workers registered after {timeout}s")
        return False
    
    
    async def schedule_process(self, process: AIProcess):

        steps = self.steps.get(process.pid, [])
        if not steps:
            return

        resolver = ProcessGraphResolver(steps)
        runnable = resolver.resolve()

        # IMPORTANT: convert PENDING → READY
        for s in runnable:
            if s.status == StepStatus.PENDING:
                s.mark_ready()
                self.repo.save_step(s)

        ready_steps = [s for s in runnable if s.status == StepStatus.READY]

        if not ready_steps:
            return

        print(f"[SCHED] Runnable: {[s.syscall for s in ready_steps]}")

        for step in ready_steps:

            if self._global_active_steps >= self.global_max_parallel:
                break

            if not self._can_schedule_step(process, step):
                continue

            if not self.resource_manager.allocate(process.pid):
                continue

            with self._lock:
                self._active_steps_per_process[process.pid] = \
                    self._active_steps_per_process.get(process.pid, 0) + 1
                self._global_active_steps += 1

            step.start()

            print(f"[SCHED] Dispatch {step.syscall}")

            task = asyncio.create_task(self._execute_step(process, step))
            self.tasks.add(task)
            task.add_done_callback(self.tasks.discard)
            
            self._finalize_processes()