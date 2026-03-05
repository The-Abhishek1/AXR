from axr_core.agents.base.agent import BaseAgent


class ReconAgent(BaseAgent):

    name = "recon_agent"
    domain = "cybersecurity"
    capabilities = ["recon"]

    rating = 4.6
    cost_per_run = 0.002
    avg_latency = 150

    async def execute(self, task):

        domain = task.get("domain")

        return {
            "subdomains": [
                f"api.{domain}",
                f"dev.{domain}"
            ]
        }