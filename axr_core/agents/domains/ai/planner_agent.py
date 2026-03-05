from axr_core.agents.base.agent import BaseAgent


class PlannerAgent(BaseAgent):

    name = "planner_agent"
    domain = "ai"
    capabilities = ["task_planning"]

    rating = 4.7
    cost_per_run = 0.002
    avg_latency = 120

    async def execute(self, task):

        goal = task.get("goal")

        return {
            "agent": self.name,
            "plan": [
                f"Analyze goal: {goal}",
                "Generate workflow",
                "Execute tasks"
            ]
        }