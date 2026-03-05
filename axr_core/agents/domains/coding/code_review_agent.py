from axr_core.agents.base.agent import BaseAgent


class CodeReviewAgent(BaseAgent):

    name = "code_review_agent"
    domain = "coding"

    capabilities = ["code_review"]

    rating = 4.5
    cost_per_run = 0.001
    avg_latency = 100

    async def execute(self, task, tool_router):

        process = type("Process", (), {"pid": "AXR-002"})
        step = type("Step", (), {"params": task})

        result = tool_router.execute(
            "lint",
            process,
            step
        )

        return {
            "lint_result": result
        }