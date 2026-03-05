from axr_core.agents.base.agent import BaseAgent


class CodeGeneratorAgent(BaseAgent):

    name = "code_generator_agent"
    domain = "coding"

    capabilities = [
        "code_generation"
    ]

    rating = 4.4
    cost_per_run = 0.002
    avg_latency = 100

    async def execute(self, task):

        prompt = task.get("prompt")

        return {
            "code": f"# generated code for {prompt}"
        }