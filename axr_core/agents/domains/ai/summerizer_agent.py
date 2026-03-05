from axr_core.agents.base.agent import BaseAgent


class SummarizerAgent(BaseAgent):

    name = "summarizer_agent"
    domain = "ai"

    capabilities = [
        "text_summary"
    ]

    rating = 4.5
    cost_per_run = 0.001
    avg_latency = 80

    async def execute(self, task):

        text = task.get("text")

        return {
            "summary": text[:120]
        }