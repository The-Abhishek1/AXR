from axr_core.process_graph.models import StepStatus, ProcessStep
from uuid import uuid4

pid = uuid4()

step = ProcessStep(pid=pid, syscall="git.clone")

print(step.status)

step.mark_ready()
print(step.status)

step.start()
print(step.status)

step.succeed()
print(step.status)