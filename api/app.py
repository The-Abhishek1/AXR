# api/app.py - Update the imports section
from fastapi import FastAPI
import asyncio
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from axr_core.process_scheduler.scheduler import ProcessScheduler
from axr_core.process_scheduler.hybrid_scheduler import HybridScheduler  # Add this import
from axr_core.persistence.models import Base
from api.deps.db import engine
from axr_core.agents.llm_client import LLMClient
from axr_core.agents.service.dynamic_agent_loader import DynamicAgentLoader
from axr_core.agents.registry.agent_registry import agent_registry

# Import all routers - including the new hybrid router
from api.routes import (
    static, tools, policies, replay, events, 
    workers, dashboard, agents, processes,
    scheduler_control, agent_execution, dev_agents, debug,
    hybrid_execution  # Add this import
)

# Telemetry imports (with fallback)
try:
    from axr_core.telemetry import setup_telemetry, get_metrics, setup_metrics
    from axr_core.telemetry.metrics import update_process_state, update_active_steps
    TELEMETRY_AVAILABLE = True
except ImportError as e:
    TELEMETRY_AVAILABLE = False

# Scheduler instances
static_scheduler = None  # Keep original for backward compatibility
hybrid_scheduler = None  # New hybrid scheduler
scheduler_task = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global scheduler_task, static_scheduler, hybrid_scheduler
    
    if TELEMETRY_AVAILABLE and os.getenv("OTEL_ENABLED", "false").lower() == "true":
        tracer = setup_telemetry(service_name="axr-api")
        app.state.tracer = tracer
        setup_metrics("axr-api")
    
    # Initialize both schedulers
    static_scheduler = ProcessScheduler(max_workers=50)
    hybrid_scheduler = HybridScheduler(max_workers=50)
    
    # Initialize NATS for both
    await static_scheduler.init_nats()
    await hybrid_scheduler.init_nats()

    print("[STARTUP] Initializing AXR...")

    Base.metadata.create_all(bind=engine)

    # Start static scheduler
    scheduler_task = asyncio.create_task(static_scheduler.start())

    # Start hybrid scheduler
    asyncio.create_task(hybrid_scheduler.start())

    # Start event scheduler
    asyncio.create_task(static_scheduler.event_scheduler.start())

    # Start autoscaler
    asyncio.create_task(static_scheduler.autoscaler.start())

    # Load agents
    try:
        loader = DynamicAgentLoader(agent_registry)
        loader.load_agents()
    except Exception as e:
        print(f"[ERROR] Failed to load agents: {e}")

    static_scheduler.worker_registry.cleanup_invalid_workers()

    # Store in app state
    app.state.scheduler = static_scheduler  # For backward compatibility
    app.state.static_scheduler = static_scheduler
    app.state.hybrid_scheduler = hybrid_scheduler

    agents_count = len(agent_registry.get_all_agents())
    print(f"[STARTUP] 📊 Loaded {agents_count} agents")
    print("[STARTUP] ✅ System ready")

    yield

    print("[SHUTDOWN] Stopping AXR...")

    # Stop both schedulers
    if scheduler_task:
        scheduler_task.cancel()
        try:
            await scheduler_task
        except asyncio.CancelledError:
            pass

    await hybrid_scheduler.stop()
    static_scheduler.stop()
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
app.include_router(static.router)
app.include_router(tools.router)
app.include_router(policies.router)
app.include_router(replay.router)
app.include_router(events.router)
app.include_router(dashboard.router)
app.include_router(debug.router)
app.include_router(scheduler_control.router)
app.include_router(agent_execution.router)

# Register hybrid router (always available)
app.include_router(hybrid_execution.router)
print("[HYBRID] 🚀 Hybrid execution routes enabled at /hybrid/*")

# Register development routes (only in development mode)
if os.getenv("AXR_ENV", "development") == "development":
    app.include_router(dev_agents.router)
    print("[DEV] 🛠️ Development routes enabled at /dev/*")

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
async def health_check():
    return {
        "status": "healthy",
        "static_workers": len(static_scheduler.worker_registry.get_live_workers()) if static_scheduler else 0,
        "agents": len(agent_registry.get_all_agents()),
        "static_processes": len(static_scheduler.processes) if static_scheduler else 0,
        "hybrid_active": hybrid_scheduler is not None
    }

# Root endpoint
@app.get("/")
async def root():
    # Get all registered routes
    routes = []
    for route in app.routes:
        if hasattr(route, "path"):
            routes.append(route.path)
    
    return {
        "name": "AXR API",
        "version": "1.0.0",
        "environment": os.getenv("AXR_ENV", "development"),
        "endpoints": sorted(list(set(routes))),
        "agents_loaded": len(agent_registry.get_all_agents()),
        "schedulers": {
            "static": "/tasks, /processes",
            "enhanced": "/enhanced/execute",
            "hybrid": "/hybrid/execute"
        },
        "documentation": "/docs"
    }
    
