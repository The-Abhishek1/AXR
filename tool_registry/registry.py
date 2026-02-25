from typing import Dict, List

from tool_runtime.git_tool.tool import GitTool
from tool_runtime.sast_tool.tool import SASTTool
from tool_runtime.lint_tool.tool import LINTTool
from tool_runtime.deploy_tool.tool import DEPLOYTool

class ToolMeta:
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

class ToolRegistry:
    """
    Central registry for all available tools.
    Maps syscall name → tool instance.
    """

    def __init__(self):
        self._meta: Dict[str, ToolMeta] = {}
        self._runtime: Dict[str, object] = {}
        self._register_builtin_tools()
        

    # ---------------------------
    # Registration
    # ---------------------------

    def _register_builtin_tools(self):
        """
        Register core tools here.
        Later this will be dynamic via loader + manifests.
        """
        self.register(
            "git.clone",
            "Clone a a git repository",
            GitTool(),   
        )
        self.register(
            "sast.scan",
            "Run static security scan",
            SASTTool(),   
        )
        self.register(
            "lint",
            "Lint the source code",
            LINTTool(),   
        )
        self.register(
            "deploy.service",
            "Deploy the application",
            DEPLOYTool(),   
        )
        
    def register(self, name: str, description: str, runtime):
        self._meta[name] = ToolMeta(name, description)
        self._runtime[name] = runtime

    # ---------------------------
    # Planner API
    # ---------------------------
    
    def list_tools(self) -> List[ToolMeta]:
        return list(self._meta.values())
    
    
    # ---------------------------
    # Executor API
    # ---------------------------

    def get_tool(self, syscall: str):
        tool = self._runtime.get(syscall)
        if not tool:
            raise NotImplementedError(f"No tool registered for syscall: {syscall}")
        return tool

tool_registry = ToolRegistry()