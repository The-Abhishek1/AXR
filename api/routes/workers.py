# api/routes/workers.py
from fastapi import APIRouter, HTTPException
from axr_core.distributed.worker_registry import worker_registry

router = APIRouter(tags=["workers"])

@router.get("/workers")
def list_workers():
    """
    List all execution workers
    """
    workers = []
    for worker_id, meta in worker_registry.list_workers_with_health().items():
        workers.append({
            "worker_id": worker_id,
            "tools": meta.get("tools"),
            "capacity": meta.get("capacity"),
            "running": meta.get("running", 0),
            "last_seen": meta.get("last_seen"),
            "is_live": meta.get("is_live"),
            "latency_ms": meta.get("latency_ms"),
        })
    
    return {
        "count": len(workers),
        "workers": workers
    }

@router.get("/workers/{worker_id}")
def get_worker(worker_id: str):
    """
    Get details of a specific worker
    """
    workers = worker_registry.list_workers_with_health()
    if worker_id not in workers:
        raise HTTPException(status_code=404, detail="Worker not found")
    
    return workers[worker_id]