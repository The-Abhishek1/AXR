POST /tasks
      ↓
register_process
      ↓
event_scheduler.enqueue
      ↓
schedule_process
      ↓
_execute_step
      ↓
worker
      ↓
_on_result
      ↓
event_scheduler.enqueue
      ↓
schedule next steps