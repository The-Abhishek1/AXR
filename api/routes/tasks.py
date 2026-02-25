from fastapi import APIRouter, Request
from uuid import UUID

from axr_core.process_manager.process import AIProcess
from axr_core.process_graph.models import ProcessStep

router = APIRouter()


@router.post("/")
def submit_process(request: Request):
    scheduler = request.app.state.scheduler

    process = AIProcess(intent="demo", budget_limit=100)

    step1 = ProcessStep(
        pid=process.pid,
        syscall="git.clone",
        priority=1
    )

    step2 = ProcessStep(
        pid= process.pid,
        syscall="sast.scan",
        depends_on=[step1.step_id],
        priority =0
    )

    step3 = ProcessStep(
        pid=process.pid,
        syscall="lint",
        depends_on=[step1.step_id],
        priority = 1
    )

    step4 = ProcessStep(
        pid=process.pid,
        syscall="deploy.service",
        depends_on=[step2.step_id, step3.step_id],
        priority = 2
    )

    steps = [step1, step2, step3, step4]

    scheduler.register_process(process, steps)

    return {"pid": process.pid}


# -------------------------
# Get process status
# -------------------------

@router.get("/{pid}")
def get_process(pid: UUID, request: Request):
    scheduler = request.app.state.scheduler

    process = scheduler.processes.get(pid)
    if not process:
        return {"error": "Process not found"}

    steps = scheduler.steps.get(pid, [])

    return {
        "pid": pid,
        "state": process.state,
        "steps": [
            {
                "step_id": step.step_id,
                "syscall": step.syscall,
                "status": step.status,
                "retries": step.retries,
            }
            for step in steps
        ],
    }
    
