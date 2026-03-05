class AgentSelector:

    def __init__(self, registry):

        self.registry = registry

    def select_agent(self, domain: str, capability: str):

        agents = [
            a for a in self.registry.get_agents_by_domain(domain)
            if capability in a.capabilities
        ]

        if not agents:
            raise Exception(
                f"No agents found for domain={domain} capability={capability}"
            )

        agents.sort(
            key=lambda a: (
                -a.rating,
                a.cost_per_run,
                a.avg_latency
            )
        )

        return agents[0]