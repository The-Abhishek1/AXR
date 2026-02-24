from fastapi import APIRouter
from uuid import UUID
from fastapi.responses import StreamingResponse
import time
import json

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

def event_stream(pid):
    db = SessionLocal()
    last_id = None
    
    try:
        while True:
            query = db.query(EventDB).filter(EventDB.pid == pid)
            
            if last_id:
                query = query.filter(EventDB.id > last_id)
            
            rows = query.order_by(EventDB.timestamp).all()

            for r in rows:
                last_id = r.id
                
                yield f"data: {json.dumps({'event_type': r.event_type,'step_id': str(r.step_id) if r.step_id else None,'timestamp': r.timestamp.isoformat(),'metadata': r.meta_data,})}\n\n"
            
            time.sleep(0.5)
    finally:
        db.close()
        
@router.get("/stream/{pid}")
def stream_events(pid: UUID):
    return StreamingResponse(
        event_stream(pid),
        media_type="text/event-stream",
    )