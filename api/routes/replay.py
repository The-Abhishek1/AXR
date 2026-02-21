from fastapi import APIRouter, Request
from uuid import UUID

router = APIRouter()


@router.post("/{pid}")
def replay_process(pid: UUID, request: Request):
    scheduler = request.app.state.scheduler

    process = scheduler.processes.get(pid)
    if not process:
        return {"error": "Process not found"}

    scheduler.resume_process(process)

    return {"message": "Replay started", "pid": pid}