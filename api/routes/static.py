# api/routes/static/execute.py
from fastapi import APIRouter, Request, HTTPException
from uuid import UUID
import logging

from axr_core.process_manager.process import AIProcess
from tool_registry.registry import tool_registry
from axr_core.agents.planner.plan_to_steps import plan_to_steps
from axr_core.agents.planner.planner_agent import PlannerAgent
from axr_core.agents.llm_client import LLMClient

router = APIRouter(tags=["static execute"])
logger = logging.getLogger(__name__)

# Initialize LLM client with CodeLlama
llm_client = LLMClient(model="Qwen2.5:3B")

@router.post("/static/execute")
async def submit_task(request: Request):
    """Submit a new task with AI-generated plan"""
    scheduler = request.app.state.scheduler
    
    try:
        body = await request.json()
        goal = body.get("goal")
        
        if not goal:
            raise HTTPException(status_code=400, detail="Missing goal")
        
        logger.info(f"🎯 Creating plan for: {goal}")
        
        # Create process
        process = AIProcess(intent=goal, budget_limit=100)
        
        # Initialize planner with CodeLlama
        planner = PlannerAgent(llm_client)
        
        # Generate plan using CodeLlama
        logger.info("🤖 Calling CodeLlama...")
        plan = planner._fallback_plan(goal)
        logger.info(f"✅ Plan received: {plan}")
        
        # Convert plan to steps with dependencies
        steps = plan_to_steps(process.pid, plan)
        
        # Register in scheduler
        scheduler.register_process(process, steps)
        
        # Return response
        steps_info = []
        for i, step in enumerate(steps):
            steps_info.append({
                "step_id": str(step.step_id),
                "tool": step.syscall,
                "priority": step.priority,
                "depends_on": [str(dep) for dep in step.depends_on],
                "status": step.status.value,
            })
        
        return {
            "pid": str(process.pid),
            "goal": goal,
            "plan": plan,
            "steps": steps_info,
            "step_count": len(steps),
            "planner": "Qwen2.5:3B"  # Indicate which planner was used
        }
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))