# api/routes/tasks.py
from fastapi import APIRouter, Request, HTTPException
from uuid import UUID

from axr_core.process_manager.process import AIProcess
from tool_registry.registry import tool_registry
from axr_core.agents.planner.plan_to_steps import plan_to_steps
from axr_core.agents.planner.planner_agent import PlannerAgent

# ✅ FIX: tags should be a list, not a string
router = APIRouter(tags=["tasks"])


# -------------------------
# Submit process
# -------------------------
@router.post("/tasks")
async def submit_task(request: Request):
    """Submit a new task/process"""
    scheduler = request.app.state.scheduler
    llm = request.app.state.llm

    body = await request.json()
    goal = body.get("goal")

    if not goal:
        raise HTTPException(status_code=400, detail="Missing goal")

    # 1️⃣ Create process
    process = AIProcess(intent=goal, budget_limit=100)

    # 2️⃣ Run planner
    planner = PlannerAgent(llm, tool_registry)
    plan = planner.create_plan(goal)

    # 3️⃣ Convert plan → steps
    steps = plan_to_steps(process.pid, plan)

    # 4️⃣ Register in scheduler
    scheduler.register_process(process, steps)

    return {
        "pid": str(process.pid),
        "plan": plan,
        "step_count": len(steps),
    }


# -------------------------
# Get task status
# -------------------------
@router.get("/tasks/{pid}")
def get_task(pid: UUID, request: Request):
    """Get task/process status"""
    scheduler = request.app.state.scheduler

    process = scheduler.processes.get(pid)
    if not process:
        raise HTTPException(status_code=404, detail="Process not found")

    steps = scheduler.steps.get(pid, [])

    return {
        "pid": str(pid),
        "state": process.state.value if hasattr(process.state, 'value') else str(process.state),
        "steps": [
            {
                "step_id": str(step.step_id),
                "syscall": step.syscall,
                "status": step.status.value if hasattr(step.status, 'value') else str(step.status),
                "retries": step.retries,
                "depends_on": [str(dep) for dep in step.depends_on],
                "priority": step.priority,
            }
            for step in steps
        ],
    }