# api/routes/hybrid_execution.py
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from uuid import UUID
import logging
import asyncio

from axr_core.process_scheduler.hybrid_scheduler import HybridScheduler

router = APIRouter(prefix="/hybrid", tags=["hybrid"])
logger = logging.getLogger(__name__)

# Global scheduler instance - will be set from app state
# We'll access it via request.app.state.hybrid_scheduler

# ==================== Request/Response Models ====================

class HybridExecutionRequest(BaseModel):
    goal: str
    user_id: str = "default"

class HybridExecutionResponse(BaseModel):
    process_id: str
    goal: str
    status: str
    result: Dict[str, Any]
    summary: str
    metrics: Dict[str, Any]
    artifacts: Dict[str, Any]

class ProcessControlRequest(BaseModel):
    process_id: str
    action: str  # pause, resume, cancel, status

class StepControlRequest(BaseModel):
    process_id: str
    step_id: str
    action: str  # pause, resume, cancel

class AddStepRequest(BaseModel):
    process_id: str
    tool: str
    priority: int = 1
    depends_on: List[str] = []
    params: Dict[str, Any] = {}
    cost_estimate: float = 1.0

class UpdateDependencyRequest(BaseModel):
    process_id: str
    step_id: str
    depends_on: List[str]

# ==================== Execution Endpoints ====================

@router.post("/execute", response_model=HybridExecutionResponse)
async def hybrid_execute(request: HybridExecutionRequest, req: Request):
    """
    Execute a goal with full enterprise infrastructure + agent collaboration
    """
    try:
        scheduler: HybridScheduler = req.app.state.hybrid_scheduler
        logger.info(f"🎯 Hybrid execution: {request.goal}")
        
        result = await scheduler.execute_goal(
            goal=request.goal,
            user_id=request.user_id
        )
        return result
    except Exception as e:
        logger.error(f"Hybrid execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== Process Control Endpoints ====================

@router.post("/process/control")
async def control_process(request: ProcessControlRequest, req: Request):
    """Control a process (pause, resume, cancel, status)"""
    try:
        scheduler: HybridScheduler = req.app.state.hybrid_scheduler
        process_id = UUID(request.process_id)
        
        if request.action == "pause":
            success = await scheduler.pause_process(process_id)
            return {"success": success, "message": "Process paused"}
            
        elif request.action == "resume":
            success = await scheduler.resume_process(process_id)
            return {"success": success, "message": "Process resumed"}
            
        elif request.action == "cancel":
            success = await scheduler.cancel_process(process_id)
            return {"success": success, "message": "Process cancelled"}
            
        elif request.action == "status":
            metrics = await scheduler._get_process_metrics(process_id)
            return {"success": True, "status": metrics}
            
        else:
            raise HTTPException(status_code=400, detail=f"Invalid action: {request.action}")
            
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    except Exception as e:
        logger.error(f"Process control failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/process/{process_id}")
async def get_process(process_id: str, req: Request):
    """Get detailed process information"""
    try:
        scheduler: HybridScheduler = req.app.state.hybrid_scheduler
        pid = UUID(process_id)
        process = scheduler.processes.get(pid)
        
        if not process:
            raise HTTPException(status_code=404, detail="Process not found")
        
        steps = scheduler.steps.get(pid, [])
        metrics = await scheduler._get_process_metrics(pid)
        
        return {
            "process_id": str(pid),
            "goal": process.intent,
            "state": process.state.value if hasattr(process, 'state') else "unknown",
            "created_at": process.created_at.isoformat() if process.created_at else None,
            "started_at": process.started_at.isoformat() if process.started_at else None,
            "metrics": metrics,
            "steps": [
                {
                    "step_id": str(s.step_id),
                    "syscall": s.syscall,
                    "status": s.status.value if hasattr(s, 'status') else "unknown",
                    "priority": s.priority,
                    "retries": s.retries,
                    "assigned_worker": s.assigned_worker,
                    "depends_on": [str(d) for d in s.depends_on]
                }
                for s in steps
            ]
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")

@router.get("/processes")
async def list_processes(req: Request):
    """List all processes"""
    scheduler: HybridScheduler = req.app.state.hybrid_scheduler
    processes = []
    
    for pid, process in scheduler.processes.items():
        if not getattr(process, 'finalized', False):
            metrics = await scheduler._get_process_metrics(pid)
            processes.append({
                "process_id": str(pid),
                "goal": process.intent,
                "state": process.state.value if hasattr(process, 'state') else "unknown",
                "metrics": metrics
            })
    
    return {
        "total": len(processes),
        "processes": processes
    }

# ==================== Step Control Endpoints ====================

@router.post("/step/control")
async def control_step(request: StepControlRequest, req: Request):
    """Control a step (pause, resume, cancel)"""
    try:
        scheduler: HybridScheduler = req.app.state.hybrid_scheduler
        process_id = UUID(request.process_id)
        step_id = UUID(request.step_id)
        
        if request.action == "pause":
            success = await scheduler.pause_step(process_id, step_id)
            return {"success": success, "message": "Step paused"}
            
        elif request.action == "resume":
            success = await scheduler.resume_step(process_id, step_id)
            return {"success": success, "message": "Step resumed"}
            
        elif request.action == "cancel":
            success = await scheduler.cancel_step(process_id, step_id)
            return {"success": success, "message": "Step cancelled"}
            
        else:
            raise HTTPException(status_code=400, detail=f"Invalid action: {request.action}")
            
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    except Exception as e:
        logger.error(f"Step control failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/step/{step_id}")
async def get_step(step_id: str, req: Request):
    """Get detailed step information"""
    try:
        scheduler: HybridScheduler = req.app.state.hybrid_scheduler
        sid = UUID(step_id)
        step = scheduler.step_map.get(sid)
        
        if not step:
            raise HTTPException(status_code=404, detail="Step not found")
        
        # Find process for this step
        process_id = None
        for pid, steps in scheduler.steps.items():
            if sid in [s.step_id for s in steps]:
                process_id = pid
                break
        
        return {
            "step_id": str(sid),
            "process_id": str(process_id) if process_id else None,
            "syscall": step.syscall,
            "status": step.status.value if hasattr(step, 'status') else "unknown",
            "priority": step.priority,
            "retries": step.retries,
            "assigned_worker": step.assigned_worker,
            "depends_on": [str(d) for d in step.depends_on],
            "cost_estimate": step.cost_estimate,
            "started_at": step.started_at.isoformat() if step.started_at else None,
            "completed_at": step.completed_at.isoformat() if step.completed_at else None,
            "error": step.error if step.error else None
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")

# ==================== DAG Mutation Endpoints ====================

@router.post("/dag/add-step")
async def add_step(request: AddStepRequest, req: Request):
    """Add a new step to an existing process"""
    try:
        scheduler: HybridScheduler = req.app.state.hybrid_scheduler
        process_id = UUID(request.process_id)
        
        # Create new step
        from axr_core.process_graph.models import ProcessStep
        step = ProcessStep(
            pid=process_id,
            syscall=request.tool,
            cost_estimate=request.cost_estimate,
            priority=request.priority
        )
        step.params = request.params
        
        # Convert dependency strings to UUIDs
        depends_on = [UUID(d) for d in request.depends_on]
        step.depends_on = depends_on
        
        # Add to scheduler
        success = await scheduler.add_step(process_id, step)
        
        if success:
            return {
                "success": True,
                "step_id": str(step.step_id),
                "message": f"Step {request.tool} added to process"
            }
        else:
            raise HTTPException(status_code=404, detail="Process not found")
            
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    except Exception as e:
        logger.error(f"Add step failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/dag/remove-step/{process_id}/{step_id}")
async def remove_step(process_id: str, step_id: str, req: Request):
    """Remove a step from a process"""
    try:
        scheduler: HybridScheduler = req.app.state.hybrid_scheduler
        pid = UUID(process_id)
        sid = UUID(step_id)
        
        success = await scheduler.remove_step(pid, sid)
        
        if success:
            return {"success": True, "message": "Step removed"}
        else:
            raise HTTPException(status_code=404, detail="Step or process not found")
            
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")

@router.post("/dag/update-dependencies")
async def update_dependencies(request: UpdateDependencyRequest, req: Request):
    """Update dependencies for a step"""
    try:
        scheduler: HybridScheduler = req.app.state.hybrid_scheduler
        process_id = UUID(request.process_id)
        step_id = UUID(request.step_id)
        depends_on = [UUID(d) for d in request.depends_on]
        
        success = await scheduler.update_dependency(process_id, step_id, depends_on)
        
        if success:
            return {"success": True, "message": "Dependencies updated"}
        else:
            raise HTTPException(status_code=404, detail="Step or process not found")
            
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")

# ==================== Agent Info Endpoints ====================

@router.get("/agents")
async def list_agents(req: Request):
    """List all available agents"""
    from axr_core.agents.registry.agent_registry import agent_registry
    
    agents = []
    for agent in agent_registry.get_all_agents():
        agents.append({
            "name": agent.name,
            "domain": agent.domain,
            "capabilities": agent.capabilities,
            "rating": getattr(agent, 'rating', 0.0),
            "tasks_completed": getattr(agent, 'tasks_completed', 0),
            "success_rate": getattr(agent, 'success_rate', 100.0)
        })
    
    return {
        "total": len(agents),
        "agents": agents
    }

@router.get("/agents/{agent_name}")
async def get_agent(agent_name: str, req: Request):
    """Get agent details"""
    from axr_core.agents.registry.agent_registry import agent_registry
    
    for agent in agent_registry.get_all_agents():
        if agent.name == agent_name:
            return {
                "name": agent.name,
                "domain": agent.domain,
                "capabilities": agent.capabilities,
                "rating": getattr(agent, 'rating', 0.0),
                "tasks_completed": getattr(agent, 'tasks_completed', 0),
                "success_rate": getattr(agent, 'success_rate', 100.0)
            }
    
    raise HTTPException(status_code=404, detail="Agent not found")

# ==================== Worker Info Endpoints ====================

@router.get("/workers")
async def list_workers(req: Request):
    """List all workers"""
    scheduler: HybridScheduler = req.app.state.hybrid_scheduler
    workers = scheduler.worker_registry.list_workers_with_health()
    return {
        "total": len(workers),
        "workers": workers
    }

@router.get("/metrics")
async def get_system_metrics(req: Request):
    """Get system-wide metrics"""
    scheduler: HybridScheduler = req.app.state.hybrid_scheduler
    return {
        "global_active_steps": scheduler._global_active_steps,
        "global_max_parallel": scheduler.global_max_parallel,
        "total_processes": len(scheduler.processes),
        "total_steps": len(scheduler.step_map),
        "active_processes": len([p for p in scheduler.processes.values() if not getattr(p, 'finalized', False)]),
        "workers": len(scheduler.worker_registry.get_live_workers()),
        "paused_processes": len(scheduler.paused_processes),
        "cancelled_processes": len(scheduler.cancelled_processes),
        "pending_retries": len(scheduler._retry_queue)
    }