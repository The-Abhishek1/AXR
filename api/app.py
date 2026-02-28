# api/app.py
from fastapi import FastAPI
import threading
import time
from fastapi.middleware.cors import CORSMiddleware

from axr_core.process_scheduler.scheduler import ProcessScheduler
from axr_core.persistence.models import Base

# Import all routers
from api.routes import (
    tasks, tools, policies, replay, events, 
    workers, dashboard, agents, processes
)
from api.deps.db import engine
from openai import OpenAI
from axr_core.agents.llm_client import LLMClient
from axr_core.agents.mock_agents import initialize_mock_agents
from axr_core.agents.agent_registry import agent_registry

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Single scheduler instance
scheduler = ProcessScheduler(max_workers=50)
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
    
    # Initialize NATS for scheduler
    await scheduler.init_nats()
    
    # Start scheduler thread
    thread = threading.Thread(target=scheduler_loop, daemon=True)
    thread.start()
    
    # Clean up any invalid workers
    scheduler.worker_registry.cleanup_invalid_workers()
    
    # Initialize mock AI agents (for development)
    initialize_mock_agents(count=5)
    
    print(f"[STARTUP] Active workers: {scheduler.worker_registry.get_live_workers()}")
    print(f"[STARTUP] Active agents: {len(agent_registry.list_agents())}")

# Register all routers
app.include_router(agents.router)
app.include_router(workers.router)
app.include_router(processes.router)
app.include_router(tasks.router)
app.include_router(tools.router)
app.include_router(policies.router)
app.include_router(replay.router)
app.include_router(events.router)
app.include_router(dashboard.router)

# Health check
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "workers": len(scheduler.worker_registry.get_live_workers()),
        "agents": len(agent_registry.list_agents()),
        "processes": len(scheduler.processes)
    }