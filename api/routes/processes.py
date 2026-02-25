from fastapi import APIRouter, Request
from uuid import UUID

router = APIRouter()


@router.get("/processes")
def list_processes(request: Request):
    scheduler = request.app.state.scheduler

    response = []

    for pid, process in scheduler.processes.items():
        steps = scheduler.steps.get(pid, [])

        response.append(
            {
                "pid": str(pid),
                "state": process.state.value,
                "budget_used": process.budget_used,
                "budget_limit": process.budget_limit,
                "steps": [
                    {
                        "step_id": str(step.step_id),
                        "syscall": step.syscall,
                        "status": step.status.value,
                        "priority": step.priority,
                    }
                    for step in steps
                ],
            }
        )

    return {
        "count": len(response),
        "processes": response,
    }


@router.get("/processes/{pid}")
def get_process_detail(pid: str, request: Request):
    scheduler = request.app.state.scheduler

    try:
        pid_uuid = UUID(pid)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid PID")

    process = scheduler.processes.get(pid_uuid)
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")

    steps = scheduler.steps.get(pid_uuid, [])

    step_details = []

    for step in steps:
        worker = scheduler._lease_worker_map.get(step.step_id)

        step_details.append(
            {
                "step_id": str(step.step_id),
                "syscall": step.syscall,
                "status": step.status.value,
                "priority": step.priority,
                "retries": step.retries,
                "cost_estimate": step.cost_estimate,
                "worker": worker,
            }
        )

    return {
        "pid": str(pid_uuid),
        "state": process.state.value,
        "budget_used": process.budget_used,
        "budget_limit": process.budget_limit,
        "remaining_budget": process.remaining_budget(),
        "current_step": str(process.current_step_id)
        if process.current_step_id
        else None,
        "steps": step_details,
    }