from fastapi import APIRouter
from uuid import UUID
from api.deps.db import SessionLocal
from axr_core.persistence.models import EventDB

router = APIRouter()

@router.get("/{pid}")
def get_events(pid: UUID):
    db = SessionLocal()
    try:
        rows = (
            db.query(EventDB)
            .filter(EventDB.pid == pid)
            .order_by(EventDB.timestamp)
            .all()
        )
        
        return[
            {
                "event_type": r.event_type,
                "step_id": r.step_id,
                "timestamp": r.timestamp,
                "metadata": r.meta_data,
            }
            for r in rows
        ]
    
    finally:
        db.close()