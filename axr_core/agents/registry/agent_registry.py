from typing import Dict, List
from axr_core.agents.base.agent import BaseAgent


class AgentRegistry:

    def __init__(self):

        self.agents: Dict[str, BaseAgent] = {}

    def register(self, agent: BaseAgent):

        self.agents[agent.name] = agent

    def get_agents_by_domain(self, domain: str):

        return [
            a for a in self.agents.values()
            if a.domain == domain
        ]

    def get_agents_by_capability(self, capability: str):

        return [
            a for a in self.agents.values()
            if capability in a.capabilities
        ]

    def get_all_agents(self):

        return list(self.agents.values())

agent_registry = AgentRegistry()