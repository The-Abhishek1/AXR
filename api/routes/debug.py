# api/routes/debug.py
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import inspect
import json

router = APIRouter(tags=["debug"])

@router.get("/debug/scheduler-state")
async def debug_scheduler_state(request: Request):
    """Debug scheduler state - find circular references"""
    scheduler = request.app.state.scheduler
    
    result = {
        "process_count": len(scheduler.processes),
        "step_count": sum(len(steps) for steps in scheduler.steps.values()),
        "process_ids": [str(pid) for pid in scheduler.processes.keys()],
    }
    
    # Check a sample process for issues
    if scheduler.processes:
        sample_pid = list(scheduler.processes.keys())[0]
        process = scheduler.processes[sample_pid]
        
        # Try to serialize safely
        try:
            from axr_core.utils.json_helpers import safe_serialize
            result["sample_process_safe"] = safe_serialize(process)
        except Exception as e:
            result["sample_process_error"] = str(e)
        
        # Check process attributes
        result["process_attrs"] = {}
        for attr in dir(process):
            if not attr.startswith('_'):
                try:
                    value = getattr(process, attr)
                    result["process_attrs"][attr] = str(type(value))
                except:
                    result["process_attrs"][attr] = "Error accessing"
    
    return JSONResponse(content=result)