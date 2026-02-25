from axr_core.capabilities.validator import CapabilityValidator
from tool_registry.registry import tool_registry


class BaseHandler:
    """
    Kernel syscall bridge:
    - validates capability
    - resolves tool from registry
    - executes tool
    """

    def __init__(self):
        self.validator = CapabilityValidator()
        self.registry = tool_registry

    def execute_tool(self, process, step, capability, memory_manager=None):
        # Validate capability
        if not self.validator.validate(capability):
            raise PermissionError("Invalid or expired capability")

        # Get tool from registry
        tool = self.registry.get_tool(step.syscall)

        # Execute tool
        return tool.execute(process, step, memory_manager)