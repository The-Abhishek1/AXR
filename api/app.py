from fastapi import FastAPI
import asyncio  # Add this
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from axr_core.process_scheduler.scheduler import ProcessScheduler
from axr_core.persistence.models import Base
from api.deps.db import engine
from axr_core.agents.llm_client import LLMClient
from axr_core.agents.mock_agents import initialize_mock_agents
from axr_core.agents.agent_registry import agent_registry

# Import all routers
from api.routes import (
    tasks, tools, policies, replay, events, 
    workers, dashboard, agents, processes,
    debug, scheduler_control
)

# Telemetry imports (with fallback)
try:
    print("🔍 Attempting to import telemetry...")
    from axr_core.telemetry import setup_telemetry, get_metrics, setup_metrics
    from axr_core.telemetry.metrics import update_process_state, update_active_steps
    TELEMETRY_AVAILABLE = True
    print("✅ Telemetry imported successfully")
except ImportError as e:
    TELEMETRY_AVAILABLE = False
    print(f"❌ Telemetry import failed: {e}")
    # Create dummy functions
    def setup_telemetry(*args, **kwargs): return None
    def get_metrics(): return b""
    def setup_metrics(*args): return None
    def update_process_state(*args): pass
    def update_active_steps(*args): pass

# Single scheduler instance
scheduler = ProcessScheduler(max_workers=50)

# Variable to store scheduler task
scheduler_task = None

@asynccontextmanager
async def lifespan(app: FastAPI):

    global scheduler_task

    print("[STARTUP] Initializing AXR...")

    if TELEMETRY_AVAILABLE and os.getenv("OTEL_ENABLED", "false").lower() == "true":
        tracer = setup_telemetry(service_name="axr-api")
        app.state.tracer = tracer
        setup_metrics("axr-api")
        print("🔍 Telemetry initialized")

    Base.metadata.create_all(bind=engine)

    # Initialize NATS
    await scheduler.init_nats()

    # Start core scheduler
    scheduler_task = asyncio.create_task(scheduler.start())

    # Start event scheduler
    asyncio.create_task(scheduler.event_scheduler.start())

    # Start autoscaler
    asyncio.create_task(scheduler.autoscaler.start())

    initialize_mock_agents()

    scheduler.worker_registry.cleanup_invalid_workers()

    app.state.scheduler = scheduler

    print(f"[STARTUP] Active agents: {len(agent_registry.list_agents())}")
    print(f"[STARTUP] Agent roles: {[a['role'] for a in agent_registry.list_agents()]}")
    print("[STARTUP] ✅ System ready")

    yield

    print("[SHUTDOWN] Stopping AXR...")

    if scheduler_task:
        scheduler_task.cancel()
        try:
            await scheduler_task
        except asyncio.CancelledError:
            pass

    scheduler.stop()

    print("[SHUTDOWN] ✅ System stopped")

# Create FastAPI app with lifespan
app = FastAPI(
    title="AXR API",
    description="Autonomous Execution Runtime API",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
app.include_router(debug.router)
app.include_router(scheduler_control.router)

# Metrics endpoint (only if telemetry available)
if TELEMETRY_AVAILABLE:
    @app.get("/metrics")
    async def metrics():
        """Prometheus metrics endpoint"""
        from fastapi.responses import Response
        metrics_data = get_metrics()
        return Response(content=metrics_data, media_type="text/plain")

# Health check endpoint
@app.get("/health")
async def health_check():  # Make this async
    return {
        "status": "healthy",
        "workers": len(scheduler.worker_registry.get_live_workers()),
        "agents": len(agent_registry.list_agents()),
        "processes": len(scheduler.processes)
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "name": "AXR API",
        "version": "1.0.0",
        "endpoints": [
            "/agents",
            "/workers", 
            "/processes",
            "/tasks",
            "/tools",
            "/policies",
            "/replay",
            "/events",
            "/dashboard",
            "/debug",
            "/health",
            "/metrics"
        ]
    }
    
    
