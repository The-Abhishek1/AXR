from __future__ import annotations

import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List
from uuid import UUID

from axr_core.process_manager.process import AIProcess, ProcessState
from axr_core.process_graph.models import ProcessStep, StepStatus
from axr_core.process_graph.resolver import ProcessGraphResolver


class ProcessScheduler:
    """
    AXR Kernel Process Scheduler (in-memory MVP)

    Manages:
    - active processes
    - step resolution
    - parallel execution
    """

    def __init__(self, max_workers: int = 4, poll_interval: float = 1.0):
        self.processes: Dict[UUID, AIProcess] = {}
        self.steps: Dict[UUID, List[ProcessStep]] = {}

        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.poll_interval = poll_interval

        self._lock = threading.Lock()
        self._running = False

    # ---------------------------
    # Kernel registration methods
    # ---------------------------

    def register_process(self, process: AIProcess, steps: List[ProcessStep]) -> None:
        with self._lock:
            self.processes[process.pid] = process
            self.steps[process.pid] = steps

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
                p for p in self.processes.values() if p.is_active()
            ]

        futures = []

        for process in active_processes:
            print(f"[SCHED] Checking process {process.pid} state={process.state}")
            
            if process.state == ProcessState.READY:
                process.start()

            steps = self.steps.get(process.pid, [])
            resolver = ProcessGraphResolver(steps)
            runnable_steps = resolver.resolve()
            print(f"[RESOLVE] Runnable steps: {[s.syscall for s in runnable_steps]}")

            for step in runnable_steps:
                if step.status == StepStatus.READY:
                    print(f"[READY] {step.syscall}")
                    step.start()
                    process.current_step_id = step.step_id
                    process.mark_scheduled()

                    futures.append(
                        self.executor.submit(self._execute_step, process, step)
                    )

        # Wait for step execution to complete
        for future in as_completed(futures):
            pass

        # Check process completion
        self._finalize_processes()

    # ---------------------------
    # Step execution
    # ---------------------------

    def _execute_step(self, process: AIProcess, step: ProcessStep) -> None:
        try:
            if not self._security_allow(process, step):
                step.fail("Policy denied")
                process.fail("Security violation")
                print(f"[DENY] STEP={step.syscall}")
                return
                
            print(f"[EXEC] PID={process.pid} STEP={step.syscall}")
            # Simulate cost charge
            process.charge_budget(step.cost_estimate)

            # Simulated syscall execution (replace with real handler later)
            time.sleep(0.5)

            # Simulate success
            step.succeed()
            print(f"[DONE] STEP={step.syscall}")


        except Exception as e:
            step.fail(str(e))
            process.fail(str(e))
            print(f"[FAIL] STEP={step.syscall} ERROR={e}")

    # ---------------------------
    # Process completion check
    # ---------------------------

    def _finalize_processes(self) -> None:
        with self._lock:
            for pid, process in self.processes.items():
                steps = self.steps.get(pid, [])

                if not steps:
                    continue

                all_done = all(
                    step.status in {StepStatus.SUCCESS, StepStatus.SKIPPED}
                    for step in steps
                )

                any_failed = any(step.status == StepStatus.FAILED for step in steps)

                if all_done:
                    process.terminate()

                elif any_failed and process.state != ProcessState.FAILED:
                    process.fail("One or more steps failed")
                    
    
    
    def _security_allow(self, process: AIProcess, step: ProcessStep) -> bool:
        """
        Temporary security stub.
        Later this will call security_module.evaluator.
        """
        # Example rule: block 'deploy.service'
        if step.syscall == "deploy.service":
            return False
        return True

    def run_once(self) -> None:
        """
        Run ad single scheduling cycle (for testing).
        """
        self._schedule_cycle()