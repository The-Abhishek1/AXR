from tool_registry.registry import tool_registry


class ToolRouter:

    def execute(self, syscall, process, step, memory_manager=None):

        tool = tool_registry.get_tool(syscall)

        result = tool.execute(process, step, memory_manager)

        return result