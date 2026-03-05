from axr_core.tools.router.tool_router import ToolRouter


class AgentRunner:

    def __init__(self, selector):

        self.selector = selector
        self.tool_router = ToolRouter()

    async def run(self, domain, capability, task):

        agent = self.selector.select_agent(domain, capability)

        result = await agent.execute(task, self.tool_router)

        return {
            "agent": agent.name,
            "domain": agent.domain,
            "capability": capability,
            "result": result
        }