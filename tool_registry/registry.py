# tool_registry/registry.py
from typing import Dict, List
from tool_runtime.git_tool.tool import GitTool
from tool_runtime.sast_tool.tool import SASTTool
from tool_runtime.lint_tool.tool import LINTTool
from tool_runtime.deploy_tool.tool import DEPLOYTool
from tool_runtime.build_tool.tool import BuildTool
from tool_runtime.test_tool.tool import TestTool
from tool_runtime.scan_tool.tool import ScanTool


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

    def _register_builtin_tools(self):
        """Register all demo tools"""
        tools = [
            ("git.clone", "Clone a git repository", GitTool()),
            ("sast.scan", "Static application security testing", SASTTool()),
            ("lint", "Lint source code for style issues", LINTTool()),
            ("deploy.service", "Deploy application to environment", DEPLOYTool()),
            ("build", "Build application artifacts", BuildTool()),
            ("test.run", "Run unit/integration tests", TestTool()),
            ("dependency.check", "Check for vulnerable dependencies", ScanTool()),
        ]
        
        for name, description, runtime in tools:
            self.register(name, description, runtime)
        
        print(f"[REGISTRY] ✅ Registered {len(tools)} tools")

    def register(self, name: str, description: str, runtime):
        """Register a new tool"""
        self._meta[name] = ToolMeta(name, description)
        self._runtime[name] = runtime

    def list_tools(self) -> List[ToolMeta]:
        """Get all available tools for planner"""
        return list(self._meta.values())

    def get_tool(self, syscall: str):
        """Get tool instance for execution"""
        tool = self._runtime.get(syscall)
        if not tool:
            raise NotImplementedError(f"❌ No tool registered for syscall: {syscall}")
        return tool

    def get_tool_description(self, syscall: str) -> str:
        """Get tool description for planner"""
        meta = self._meta.get(syscall)
        return meta.description if meta else "Unknown tool"

# Global singleton instance
tool_registry = ToolRegistry()