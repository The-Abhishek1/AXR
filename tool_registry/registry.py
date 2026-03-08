# tool_registry/registry.py
import os
import importlib
import inspect
from typing import Dict, List, Optional, Any
from datetime import datetime

from tool_runtime.base_tool.tool import BaseTool
from .models import ToolMeta, Tool, ToolExecution


class ToolMeta:

    def __init__(self, name, syscall, description):
        self.name = name
        self.syscall = syscall
        self.description = description


class ToolRegistry:

    def __init__(self):
        self._meta: Dict[str, ToolMeta] = {}
        self._runtime: Dict[str, Any] = {}
        self._tools: Dict[str, Tool] = {}  # For dynamic tools
        self._executions: List[ToolExecution] = []
        
        self._load_tools()

    def _load_tools(self):
        base_dir = os.path.dirname(os.path.dirname(__file__))
        runtime_dir = os.path.join(base_dir, "tool_runtime")

        for root, _, files in os.walk(runtime_dir):
            for file in files:
                if file != "tool.py":
                    continue

                file_path = os.path.join(root, file)
                module_path = self._build_module_path(file_path)

                try:
                    module = importlib.import_module(module_path)

                    for _, obj in inspect.getmembers(module, inspect.isclass):
                        if issubclass(obj, BaseTool) and obj != BaseTool:
                            tool = obj()
                            self.register(tool)
                            print(f"[REGISTRY] 🔧 Loaded tool: {tool.syscall}")
                except Exception as e:
                    print(f"[REGISTRY] ❌ Failed to load tool from {file_path}: {e}")

    def _build_module_path(self, file_path):
        rel = file_path.split("tool_runtime/")[-1]
        module = rel.replace("/", ".").replace(".py", "")
        return f"tool_runtime.{module}"

    def register(self, tool):
        """Register a tool from the tool_runtime directory"""
        meta = ToolMeta(tool.name, tool.syscall, tool.description)
        self._meta[tool.syscall] = meta
        self._runtime[tool.syscall] = tool
        
        # Also store as Tool object for consistency
        tool_obj = Tool(
            name=tool.name,
            description=tool.description,
            function=getattr(tool, 'execute', None),
            category="builtin",
            cost=getattr(tool, 'cost', 1.0),
            timeout=getattr(tool, 'timeout', 30),
            metadata={"syscall": tool.syscall}
        )
        self._tools[tool.syscall] = tool_obj

    def register_tool(self, tool: Tool):
        """Register a dynamically created tool"""
        # Create a compatible wrapper if needed
        self._tools[tool.name] = tool
        
        # Also create a meta entry
        meta = ToolMeta(tool.name, tool.name, tool.description)
        self._meta[tool.name] = meta
        
        print(f"[REGISTRY] 🔧 Registered dynamic tool: {tool.name}")

    def list_tools(self):
        """List all tools (both built-in and dynamic)"""
        return list(self._meta.values())

    def list_all_tools(self):
        """List all tools with full details"""
        tools = []
        for syscall, meta in self._meta.items():
            tools.append({
                "name": meta.name,
                "syscall": meta.syscall,
                "description": meta.description,
                "type": "dynamic" if syscall in self._tools else "builtin"
            })
        return tools

    def get_tool(self, syscall):
        """Get a tool by syscall/name"""
        # Try built-in first
        tool = self._runtime.get(syscall)
        if tool:
            return tool
        
        # Try dynamic tools
        tool_obj = self._tools.get(syscall)
        if tool_obj:
            return tool_obj
        
        raise KeyError(f"No tool registered: {syscall}")

    def execute_tool(self, syscall: str, **kwargs) -> Any:
        """Execute a tool"""
        tool = self.get_tool(syscall)
        
        # Record execution
        execution = ToolExecution(
            tool_name=syscall,
            process_id=kwargs.get('process_id', 'unknown'),
            step_id=kwargs.get('step_id', 'unknown'),
            start_time=datetime.now()
        )
        
        try:
            # Handle different tool types
            if hasattr(tool, 'execute'):
                result = tool.execute(**kwargs)
            elif callable(tool):
                result = tool(**kwargs)
            else:
                result = tool(**kwargs) if hasattr(tool, '__call__') else None
            
            execution.end_time = datetime.now()
            execution.status = "success"
            execution.result = result
            execution.duration_ms = (execution.end_time - execution.start_time).total_seconds() * 1000
            
            return result
            
        except Exception as e:
            execution.end_time = datetime.now()
            execution.status = "failed"
            execution.error = str(e)
            execution.duration_ms = (execution.end_time - execution.start_time).total_seconds() * 1000
            raise
        
        finally:
            self._executions.append(execution)
            # Keep only last 1000 executions
            if len(self._executions) > 1000:
                self._executions = self._executions[-1000:]

    def get_execution_history(self, tool_name: Optional[str] = None) -> List[Dict]:
        """Get execution history for tools"""
        if tool_name:
            executions = [e for e in self._executions if e.tool_name == tool_name]
        else:
            executions = self._executions
        
        return [
            {
                "tool_name": e.tool_name,
                "process_id": e.process_id,
                "status": e.status,
                "duration_ms": e.duration_ms,
                "start_time": e.start_time.isoformat() if e.start_time else None,
                "error": e.error
            }
            for e in executions[-50:]  # Last 50 executions
        ]


# Global instance
tool_registry = ToolRegistry()