from uuid import uuid4
from axr_core.process_graph.models import ProcessStep,StepStatus
from axr_core.process_graph.resolver import ProcessGraphResolver

pid = uuid4()

step1 = ProcessStep(pid=pid, syscall="git.clone")
step2 = ProcessStep(pid=pid, syscall="sast.scan", depends_on=[step1.step_id])
step3 = ProcessStep(pid=pid, syscall="lint", depends_on=[step1.step_id])

steps = [step1, step2, step3]

resolver = ProcessGraphResolver(steps)

runnable = resolver.resolve()
print([s.syscall for s in runnable])

step1.succeed()

runnable = resolver.resolve()
print(sorted([s.syscall for s in runnable]))