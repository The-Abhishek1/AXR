"""API endpoints to control scheduling policies and quotas"""

from fastapi import APIRouter, Request, HTTPException, Query
from typing import Optional, Dict, Any
from pydantic import BaseModel
from uuid import UUID
from axr_core.process_graph.models import StepStatus

router = APIRouter(prefix="/scheduler",tags=["scheduler"])

# ========== Request/Response Models ==========

class PolicyUpdate(BaseModel):
    policy: str  # priority, fair_share, deadline, cost_aware

class QuotaUpdate(BaseModel):
    tenant_id: str
    cpu_cores: Optional[float] = None
    memory_mb: Optional[int] = None
    max_processes: Optional[int] = None
    max_concurrent_steps: Optional[int] = None
    priority: Optional[int] = None

class ProcessPriorityUpdate(BaseModel):
    process_id: UUID
    priority: int
    tenant_id: Optional[str] = None

# ========== Policy Control ==========

@router.get("/policies")
def get_policies(request: Request):
    """Get available scheduling policies"""
    scheduler = request.app.state.scheduler
    advanced = scheduler.advanced_scheduler
    
    return {
        "active": advanced.active_policy,
        "available": list(advanced.policies.keys()),
        "descriptions": {
            "priority": "📊 Priority-based: Higher priority processes run first",
            "fair_share": "⚖️ Fair Share: Balances resources across tenants",
            "deadline": "⏰ Deadline-aware: Earliest deadline first",
            "cost_aware": "💰 Cost-aware: Optimizes for budget constraints"
        }
    }

@router.post("/policies")
def set_policy(policy: PolicyUpdate, request: Request):
    """Set active scheduling policy"""
    scheduler = request.app.state.scheduler
    
    if scheduler.advanced_scheduler.set_policy(policy.policy):
        log.success(f"Scheduling policy changed to {policy.policy}")
        return {"status": "success", "policy": policy.policy}
    
    raise HTTPException(
        status_code=400, 
        detail=f"Invalid policy. Choose from: priority, fair_share, deadline, cost_aware"
    )

# ========== Tenant/Quota Control ==========

@router.post("/tenants/{tenant_id}")
def create_tenant(tenant_id: str, request: Request, quota: Optional[QuotaUpdate] = None):
    """Register a new tenant with optional quota"""
    scheduler = request.app.state.scheduler
    
    # Convert quota to ResourceQuota object if provided
    quota_obj = None
    if quota:
        from axr_core.scheduling.quota.models import ResourceQuota
        quota_obj = ResourceQuota(
            cpu_cores=quota.cpu_cores or 1.0,
            memory_mb=quota.memory_mb or 1024,
            max_processes=quota.max_processes or 5,
            max_concurrent_steps=quota.max_concurrent_steps or 10,
        )
    
    scheduler.advanced_scheduler.register_tenant(
        tenant_id=tenant_id,
        quota=quota_obj,
        priority=quota.priority if quota else 1
    )
    
    log.info(f"Tenant registered", tenant=tenant_id)
    return {"status": "success", "tenant_id": tenant_id}

@router.get("/tenants/{tenant_id}")
def get_tenant_usage(tenant_id: str, request: Request):
    """Get quota usage for a tenant"""
    scheduler = request.app.state.scheduler
    usage = scheduler.advanced_scheduler.quota_manager.get_tenant_usage(tenant_id)
    
    if not usage:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    return usage

@router.get("/quotas/process/{process_id}")
def get_process_quota(process_id: UUID, request: Request):
    """Get quota usage for a specific process"""
    scheduler = request.app.state.scheduler
    usage = scheduler.advanced_scheduler.quota_manager.get_process_usage(process_id)
    
    if not usage:
        raise HTTPException(status_code=404, detail="Process not found")
    
    return {
        "process_id": str(process_id),
        "steps_completed": usage.steps_completed,
        "steps_running": usage.steps_running,
        "cpu_time_used_seconds": usage.cpu_time_used_seconds,
        "cost_incurred": usage.cost_incurred,
        "started_at": usage.started_at.isoformat() if usage.started_at else None
    }

# ========== Process Priority Control ==========

@router.post("/processes/priority")
def set_process_priority(update: ProcessPriorityUpdate, request: Request):
    """Set priority for a process (affects scheduling)"""
    scheduler = request.app.state.scheduler
    
    process = scheduler.processes.get(update.process_id)
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")
    
    # Add priority attribute to process
    process.priority = update.priority
    if update.tenant_id:
        process.tenant_id = update.tenant_id
    
    log.info(f"Process priority updated", 
             process=str(update.process_id)[:8], 
             priority=update.priority)
    
    return {"status": "success", "process_id": str(update.process_id), "priority": update.priority}

# ========== Queue Management ==========

@router.get("/queue")
def get_queue_status(request: Request):
    """Get current scheduling queue status"""
    scheduler = request.app.state.scheduler
    
    # Get all active processes
    active = []
    for pid, process in scheduler.processes.items():
        if process.is_active() and not getattr(process, "finalized", False):
            steps = scheduler.steps.get(pid, [])
            pending = sum(1 for s in steps if s.status == StepStatus.PENDING)
            running = sum(1 for s in steps if s.status == StepStatus.RUNNING)
            
            active.append({
                "process_id": str(pid),
                "intent": process.intent[:50],
                "priority": getattr(process, "priority", 1),
                "tenant": getattr(process, "tenant_id", "default"),
                "steps": {"pending": pending, "running": running},
                "created_at": process.created_at.isoformat() if process.created_at else None
            })
    
    # Sort by priority (highest first)
    active.sort(key=lambda x: x["priority"], reverse=True)
    
    return {
        "queue_length": len(active),
        "active_processes": active,
        "policy": scheduler.advanced_scheduler.active_policy
    }

@router.delete("/queue/{process_id}")
def remove_from_queue(process_id: UUID, request: Request):
    """Cancel and remove a process from queue"""
    scheduler = request.app.state.scheduler
    
    if scheduler.cancel_process(process_id):
        log.info(f"Process cancelled and removed from queue", process=str(process_id)[:8])
        return {"status": "success", "message": "Process cancelled"}
    
    raise HTTPException(status_code=404, detail="Process not found")