from fastapi import APIRouter, Request, HTTPException
from uuid import UUID
from axr_core.process_scheduler.scheduler import ProcessScheduler
from axr_core.process_graph.models import StepStatus

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
    
    
    
@router.get("/steps/{step_id}")
def get_step_detail(step_id: str, request: Request):
    scheduler = request.app.state.scheduler

    try:
        step_uuid = UUID(step_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid step_id")

    # 🔍 find step across all processes
    target_step = None
    target_pid = None

    for pid, steps in scheduler.steps.items():
        for step in steps:
            if step.step_id == step_uuid:
                target_step = step
                target_pid = pid
                break
        if target_step:
            break

    if not target_step:
        raise HTTPException(status_code=404, detail="Step not found")

    worker = scheduler._lease_worker_map.get(step_uuid)

    # memory output
    
    process_memory = scheduler.memory_manager.read_process_memory(target_pid)
    memory_output = (
        process_memory.get(str(step_uuid))
        or process_memory.get(step_uuid)
    )

    return {
        "step_id": str(step_uuid),
        "pid": str(target_pid),
        "syscall": target_step.syscall,
        "status": target_step.status.value,
        "priority": target_step.priority,
        "retries": target_step.retries,
        "cost_estimate": target_step.cost_estimate,
        "failure_policy": target_step.failure_policy,
        "worker": worker,
        "lease_active": worker is not None,
        "output": memory_output,
    }
    

@router.get("/steps/{step_id}/retry")
def retry_step(step_id: str, request: Request):
    scheduler = request.app.state.scheduler
    step_uuid = UUID(step_id)

    # find step
    target_step = None
    target_pid = None

    for pid, steps in scheduler.steps.items():
        for s in steps:
            if s.step_id == step_uuid:
                target_step = s
                target_pid = pid
                break

    if not target_step:
        raise HTTPException(status_code=404, detail="Step not found")

    if target_step.status != StepStatus.FAILED:
        raise HTTPException(
            status_code=400,
            detail=f"Step not in FAILED state (current={target_step.status})",
        )

    # reset step
    target_step.status = StepStatus.READY
    target_step.retries += 1

    scheduler.repo.save_step(target_step)

    return {
        "message": "Step requeued",
        "step_id": step_id,
        "retries": target_step.retries,
        "pid": str(target_pid),
    }


@router.get("/processes/{pid}/cancel")
def cancel_process(pid: UUID, request: Request):
    scheduler = request.app.state.scheduler
    ok = scheduler.cancel_process(pid)
    if not ok:
        raise HTTPException(status_code=404, detail="Process not found")

    return {"status": "cancelled", "pid": str(pid)}

@router.get("/processes/{pid}/pause")
def pause_process(pid: UUID, request: Request):
    scheduler = request.app.state.scheduler

    process = scheduler.processes.get(pid)
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")

    if getattr(process, "finalized", False):
        raise HTTPException(status_code=400, detail="Process already finalized")

    ok = scheduler.pause_process(pid)

    if not ok:
        raise HTTPException(status_code=400, detail="Pause failed")

    return {"status": "paused", "pid": str(pid)}


@router.get("/processes/{pid}/resume")
def resume_process(pid: UUID, request: Request):
    scheduler = request.app.state.scheduler

    process = scheduler.processes.get(pid)
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")

    if process.state == "FAILED":
        raise HTTPException(status_code=400, detail="Cannot resume failed process")

    if getattr(process, "finalized", False):
        raise HTTPException(status_code=400, detail="Process already finalized")

    ok = scheduler.resume_process(pid)

    if not ok:
        raise HTTPException(status_code=400, detail="Resume failed")

    return {"status": "resumed", "pid": str(pid)}