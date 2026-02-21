from typing import Dict

from tool_runtime.git_tool.tool import GitTool
from tool_runtime.sast_tool.tool import SASTTool
from tool_runtime.lint_tool.tool import LINTTool
from tool_runtime.deploy_tool.tool import DEPLOYTool

class ToolRegistry:
    """
    Central registry for all available tools.
    Maps syscall name → tool instance.
    """

    def __init__(self):
        self._tools: Dict[str, object] = {}
        self._register_builtin_tools()

    # ---------------------------
    # Registration
    # ---------------------------

    def _register_builtin_tools(self):
        """
        Register core tools here.
        Later this will be dynamic via loader + manifests.
        """
        self._tools["git.clone"] = GitTool()
        self._tools["sast.scan"] = SASTTool()
        self._tools["lint"] = LINTTool()
        self._tools["deploy.service"] = DEPLOYTool()

    # ---------------------------
    # Public API
    # ---------------------------

    def get_tool(self, syscall: str):
        tool = self._tools.get(syscall)
        if not tool:
            raise NotImplementedError(f"No tool registered for syscall: {syscall}")
        return tool

    def list_tools(self):
        return list(self._tools.keys())