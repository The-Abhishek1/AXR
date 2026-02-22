from api.deps.db import SessionLocal
from axr_core.persistence.models import ProceedDB, StepDB, EventDB


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
            )
            db.merge(db_step)
            db.commit()
        finally:
            db.close()
    
    
    def save_event(self, event):
        print(event)
        db = SessionLocal()
        try:
            db_event = EventDB(
                pid=event.pid,
                step_id=event.step_id,
                event_type=event.event_type,
                timestamp=event.timestamp,
                meta_data=event.metadata,
            )
            db.add(db_event)
            db.commit()
        finally:
            db.close()