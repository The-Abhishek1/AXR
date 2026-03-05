from axr_core.agents.registry.agent_registry import AgentRegistry
from axr_core.agents.service.dynamic_agent_loader import DynamicAgentLoader
from axr_core.agents.selector.agent_selector import AgentSelector
from axr_core.agents.runtime.agent_runner import AgentRunner


def initialize_agent_system():

    registry = AgentRegistry()

    loader = DynamicAgentLoader(registry)
    loader.load_agents()

    selector = AgentSelector(registry)

    runner = AgentRunner(selector)

    return runner