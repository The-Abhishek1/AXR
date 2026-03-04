import asyncio
import subprocess

class WorkerAutoScaler:

    def __init__(self, scheduler, min_workers=1, max_workers=20):
        self.scheduler = scheduler
        self.min_workers = min_workers
        self.max_workers = max_workers
        self.last_state = None
        self.idle_counter = 0
        self.worker_processes = []

    async def start(self):

        print("[AUTOSCALER] 🚀 Worker autoscaler started")

        while True:

            workers = len(self.scheduler.worker_registry.get_live_workers())

            # ---- calculate queue FIRST ----
            queue = 0
            for steps in self.scheduler.steps.values():
                for s in steps:
                    if s.status.name in ["READY", "PENDING"]:
                        queue += 1

            # ---- logging only when changed ----
            state = (queue, workers)

            if state != self.last_state:
                print(f"[AUTOSCALE] queue={queue} workers={workers}")
                self.last_state = state

            # ---- scale up ----
            if queue > workers * 2 and workers < self.max_workers:
                await self.scale_up()

            # ---- idle tracking ----
            if queue == 0:
                self.idle_counter += 1
            else:
                self.idle_counter = 0

            # ---- scale down after idle ----
            if self.idle_counter > 6 and workers > self.min_workers:
                await self.scale_down()

            await asyncio.sleep(5)

    async def scale_up(self):

        print("[AUTOSCALE] Launching worker")

        proc = subprocess.Popen(
            ["python3", "-m", "workers.worker"]
        )

        self.worker_processes.append(proc)

    async def scale_down(self):

        if not self.worker_processes:
            return

        proc = self.worker_processes.pop()

        print(f"[AUTOSCALE] Terminating worker {proc.pid}")

        proc.terminate()