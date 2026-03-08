# api/routes/agent_execution.py (or enhanced_execution.py)
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging

from axr_core.agents.registry.agent_registry import agent_registry

router = APIRouter(prefix="/enhanced", tags=["enhanced"])
logger = logging.getLogger(__name__)

class EnhancedExecutionRequest(BaseModel):
    goal: str
    user_id: Optional[str] = "default"
    initial_plan: Optional[List[Dict]] = None
    pause_on_failure: bool = False
    notify_on_completion: bool = False

class StepResult(BaseModel):
    step_index: int
    tool: str
    status: str
    result: Optional[Dict] = None
    error: Optional[str] = None
    agent: Optional[str] = None

class ExecutionMetrics(BaseModel):
    duration_seconds: float
    steps_completed: int
    steps_failed: int
    steps_modified: int
    tools_created: List[str]
    agents_involved: List[str]
    messages_exchanged: int

class LearningData(BaseModel):
    agents_updated: List[str]
    new_knowledge: int

class EnhancedExecutionResponse(BaseModel):
    process_id: str
    goal: str
    status: str
    result: Dict[str, Any]
    summary: str
    metrics: ExecutionMetrics
    artifacts: Dict[str, Any] = {}  # Make artifacts optional with default

@router.post("/execute", response_model=EnhancedExecutionResponse)
async def enhanced_execute(request: EnhancedExecutionRequest, background_tasks: BackgroundTasks):
    """
    Execute a goal with full agent collaboration, tool creation, and learning
    """
    try:
        logger.info(f"🎯 Enhanced execution: {request.goal}")
        
        # Import here to avoid circular imports
        from axr_core.agents.runner.enhanced_agent_runner import EnhancedAgentRunner
        enhanced_runner = EnhancedAgentRunner()
        
        # Execute the goal
        result = await enhanced_runner.execute_goal(
            goal=request.goal,
            user_id=request.user_id,
            initial_plan=request.initial_plan,
            pause_on_failure=request.pause_on_failure
        )
        
        # Format the response to match the model
        formatted_result = {
            "process_id": result["process_id"],
            "goal": result["goal"],
            "status": result["status"],
            "result": result.get("result", {}),
            "summary": result.get("summary", ""),
            "metrics": {
                "duration_seconds": result.get("metrics", {}).get("duration_seconds", 0),
                "steps_completed": result.get("metrics", {}).get("steps_completed", 0),
                "steps_failed": result.get("metrics", {}).get("steps_failed", 0),
                "steps_modified": result.get("metrics", {}).get("modifications", 0),
                "tools_created": result.get("metrics", {}).get("tools_created", []),  # Default to empty list
                "agents_involved": result.get("metrics", {}).get("agents_involved", []),
                "messages_exchanged": result.get("metrics", {}).get("messages_exchanged", 0)
            },
            "artifacts": result.get("artifacts", {})
        }
        
        # Send notification if requested
        if request.notify_on_completion:
            background_tasks.add_task(
                send_completion_notification,
                result
            )
        
        return EnhancedExecutionResponse(**formatted_result)
        
    except Exception as e:
        logger.error(f"Enhanced execution failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))