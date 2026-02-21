from fastapi import FastAPI
import threading
import time

from axr_core.process_scheduler.scheduler import ProcessScheduler

from api.routes import tasks, tools, policies, replay

app = FastAPI()

# Single scheduler instance
scheduler = ProcessScheduler(max_workers=4)

# Make scheduler accessible to routes
app.state.scheduler = scheduler

def scheduler_loop():
    while True:
        scheduler.run_once()
        time.sleep(0.2)
        
@app.on_event("startup")
def start_scheduler():
    thread = threading.Thread(target=scheduler_loop, daemon=True)
    thread.start()

# Register routers
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(tools.router, prefix="/tools", tags=["tools"])
app.include_router(policies.router, prefix="/policies", tags=["policies"])
app.include_router(replay.router, prefix="/replay", tags=["replay"])


