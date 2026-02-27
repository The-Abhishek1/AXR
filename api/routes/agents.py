from fastapi import APIRouter
from axr_core.distributed.worker_registry import worker_registry

router = APIRouter()

@router.get("/agents")
def list_agents():
    agents = []

    for agent_id, meta in worker_registry.list_workers_with_health().items():
        agents.append({
            "agent_id": agent_id,
            "tools": meta.get("tools"),
            "capacity": meta.get("capacity"),
            "last_seen": meta.get("last_seen"),
            "is_live": meta.get("is_live"),
            "latency_ms": meta.get("latency_ms"),
        })

    return {"count": len(agents), "agents": agents}


@router.post("/agents/heartbeat/{agent_id}")
def heartbeat(agent_id: str):
    worker_registry.heartbeat(agent_id)
    return {"status": "ok"}