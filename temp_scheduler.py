from uuid import uuid4
import time

from axr_core.process_manager.process import AIProcess
from axr_core.process_graph.models import ProcessStep
from axr_core.process_scheduler.scheduler import ProcessScheduler

# Create process
process = AIProcess(intent="secure repo", budget_limit=100)

# Create steps (clone -> scan -> lint parallel after clone)
step1 = ProcessStep(pid=process.pid, syscall="git.clone", cost_estimate=5)
step2 = ProcessStep(pid=process.pid, syscall="sast.scan", depends_on=[step1.step_id], cost_estimate=10)
step3 = ProcessStep(pid=process.pid, syscall="lint", depends_on=[step1.step_id], cost_estimate=3)
step4 = ProcessStep(pid=process.pid, syscall="deploy.service")

steps = [step1, step2, step3, step4]

scheduler = ProcessScheduler(max_workers=2)
scheduler.register_process(process, steps)

while process.is_active():
    scheduler.run_once()
    time.sleep(0.2)
    
print("\nProcess state: ", process.state)
for s in steps:
    print(s.syscall, s.status)