from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/dashboard")
def dashboard(request: Request):
    scheduler = request.app.state.scheduler

    total_processes = len(scheduler.processes)
    workers = scheduler.worker_registry.get_live_workers()

    active_steps = {
        str(pid): count
        for pid, count in scheduler._active_steps_per_process.items()
    }

    return {
        "total_processes": total_processes,
        "active_steps_per_process": active_steps,
        "worker_count": len(workers),
        "workers": workers,
    }