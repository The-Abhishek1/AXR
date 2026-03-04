import asyncio
from typing import Dict, List
from uuid import UUID

from axr_core.process_manager.process import AIProcess
from axr_core.process_graph.models import ProcessStep, StepStatus
from axr_core.process_graph.resolver import ProcessGraphResolver


class EventDrivenScheduler:

    def __init__(self, core_scheduler):
        self.core = core_scheduler
        self.queue = asyncio.Queue()
        self.running = False

    async def start(self):
        self.running = True
        print("[EVENT-SCHED] 🚀 Event scheduler started")

        while self.running:
            process = await self.queue.get()
            try:
                await self.schedule_process(process)
            finally:
                self.queue.task_done()

    async def stop(self):
        self.running = False

    async def enqueue(self, process: AIProcess):
        """Push process to scheduling queue"""
        await self.queue.put(process)

    async def schedule_process(self, process: AIProcess):
        """Schedule all runnable steps for a process"""

        steps: List[ProcessStep] = self.core.steps.get(process.pid, [])
        if not steps:
            return

        resolver = ProcessGraphResolver(steps)
        runnable = resolver.resolve()

        ready_steps = [s for s in runnable if s.status == StepStatus.READY]

        if not ready_steps:
            return

        print(f"[EVENT-SCHED] {process.pid} ready steps: {[s.syscall for s in ready_steps]}")

        for step in ready_steps:

            if self.core._global_active_steps >= self.core.global_max_parallel:
                break

            if not self.core._can_schedule_step(process, step):
                continue

            if not self.core.resource_manager.allocate(process.pid):
                continue

            with self.core._lock:
                self.core._active_steps_per_process[process.pid] = \
                    self.core._active_steps_per_process.get(process.pid, 0) + 1

                self.core._global_active_steps += 1

            step.start()

            print(
                f"[EVENT-SCHED] dispatch "
                f"{step.syscall} → PID {str(process.pid)[:8]}"
            )

            task = asyncio.create_task(
                self.core._execute_step(process, step)
            )

            self.core.tasks.add(task)
            task.add_done_callback(self.core.tasks.discard)