from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/workers")
def list_workers(request: Request):
    scheduler = request.app.state.scheduler

    workers = scheduler.worker_registry.get_live_workers()

    return {
        "count": len(workers),
        "workers": workers,
    }