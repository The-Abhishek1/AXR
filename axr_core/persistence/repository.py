# axr_core/persistence/repository.py
from api.deps.db import SessionLocal
from axr_core.persistence.models import ProceedDB, StepDB, EventDB
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class PersistenceRepository:
    def save_process(self, process):
        db = SessionLocal()
        try:
            db_process = ProceedDB(
                pid=process.pid,
                state=str(process.state),
                intent=process.intent,
                budget_limit=process.budget_limit,
            )
            db.merge(db_process)
            db.commit()
        finally:
            db.close()
    
    def save_step(self, step):
        db = SessionLocal()
        try:
            db_step = StepDB(
                step_id=step.step_id,
                pid=step.pid,
                syscall=step.syscall,
                status=str(step.status),
                retries=step.retries,
                assigned_worker=step.assigned_worker
            )
            db.merge(db_step)
            db.commit()
        finally:
            db.close()
    
    def save_event(self, event):
        """Save event with backward compatibility for both old and new formats"""
        db = SessionLocal()
        try:
            # Handle both old and new event formats
            if hasattr(event, 'type'):
                # New format (with enum)
                event_type = event.type.value if hasattr(event.type, 'value') else str(event.type)
                pid = event.pid
                step_id = event.step_id
                timestamp = event.timestamp
                metadata = event.metadata
                logger.debug(f"New event format: {event_type}")
            else:
                # Old format (with event_type string)
                event_type = event.event_type
                pid = event.pid
                step_id = event.step_id
                timestamp = getattr(event, 'timestamp', datetime.utcnow())
                metadata = getattr(event, 'metadata', {})
                logger.debug(f"Old event format: {event_type}")
            
            db_event = EventDB(
                pid=pid,
                step_id=step_id,
                event_type=event_type,
                timestamp=timestamp,
                meta_data=metadata,
            )
            db.add(db_event)
            db.commit()
            logger.debug(f"Event saved: {event_type}")
        except Exception as e:
            logger.error(f"Failed to save event: {e}")
            db.rollback()
        finally:
            db.close()