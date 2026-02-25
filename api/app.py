from fastapi import FastAPI
import threading
import time

from axr_core.process_scheduler.scheduler import ProcessScheduler
from axr_core.persistence.models import Base

from api.routes import tasks, tools, policies, replay, events, processes, workers, events_ui, dashboard
from api.deps.db import engine
from openai import OpenAI
from axr_core.agents.llm_client import LLMClient


app = FastAPI()

# Single scheduler instance
scheduler = ProcessScheduler(max_workers=4)

# Make scheduler accessible to routes
app.state.scheduler = scheduler

# LLM client for planner
app.state.llm = LLMClient(OpenAI(api_key=""))

def scheduler_loop():
    while True:
        scheduler.run_once()
        time.sleep(0.2)
        
@app.on_event("startup")
async def start_scheduler():
    Base.metadata.create_all(bind=engine)
    
    # init NATS for scheduler
    await scheduler.init_nats()
    
    thread = threading.Thread(target=scheduler_loop, daemon=True)
    thread.start()

# Register routers
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(tools.router, prefix="/tools", tags=["tools"])
app.include_router(policies.router, prefix="/policies", tags=["policies"])
app.include_router(replay.router, prefix="/replay", tags=["replay"])
app.include_router(events.router, prefix="/events", tags=["events"])


app.include_router(processes.router)
app.include_router(workers.router)
app.include_router(events_ui.router)
app.include_router(dashboard.router)