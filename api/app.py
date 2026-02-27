from fastapi import FastAPI
import threading
import time
from fastapi.middleware.cors import CORSMiddleware

from axr_core.process_scheduler.scheduler import ProcessScheduler
from axr_core.persistence.models import Base

from api.routes import tasks, tools, policies, replay, events, processes, workers, events_ui, dashboard, agents
from api.deps.db import engine
from openai import OpenAI
from axr_core.agents.llm_client import LLMClient


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
app.include_router(agents.router)


from axr_core.distributed.worker_registry import worker_registry
from tool_registry.registry import ToolRegistry

registry = ToolRegistry()

# Agents Registration

for i in range(1, 11):
    worker_registry.register(
        worker_id=f"agent-{i}",
        tools=registry.list_tools(),
        capacity=2,
    )