from fastapi import APIRouter, Request
from uuid import UUID

from axr_core.process_manager.process import AIProcess
from tool_registry.registry import tool_registry
from axr_core.agents.planner.plan_to_steps import plan_to_steps
from axr_core.agents.planner.planner_agent import PlannerAgent

router = APIRouter()


# -------------------------
# Submit process
# -------------------------
@router.post("/")
async def submit_process(request: Request):
    scheduler = request.app.state.scheduler
    llm = request.app.state.llm

    body = await request.json()
    goal = body.get("goal")

    if not goal:
        return {"error": "Missing goal"}

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
        "pid": process.pid,
        "plan": plan,
        "step_count": len(steps),
    }


# -------------------------
# Get process status
# -------------------------
@router.get("/{pid}")
def get_process(pid: UUID, request: Request):
    scheduler = request.app.state.scheduler

    process = scheduler.processes.get(pid)
    if not process:
        return {"error": "Process not found"}

    steps = scheduler.steps.get(pid, [])

    return {
        "pid": pid,
        "state": process.state,
        "steps": [
            {
                "step_id": step.step_id,
                "syscall": step.syscall,
                "status": step.status,
                "retries": step.retries,
                "depends_on": step.depends_on,
                "priority": step.priority,
            }
            for step in steps
        ],
    }