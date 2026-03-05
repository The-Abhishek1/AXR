import os
import importlib
import inspect
from tool_runtime.base_tool.tool import BaseTool


class ToolMeta:

    def __init__(self, name, syscall, description):
        self.name = name
        self.syscall = syscall
        self.description = description


class ToolRegistry:

    def __init__(self):

        self._meta = {}
        self._runtime = {}

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

                module = importlib.import_module(module_path)

                for _, obj in inspect.getmembers(module, inspect.isclass):

                    if issubclass(obj, BaseTool) and obj != BaseTool:

                        tool = obj()

                        self.register(tool)

                        print(f"[REGISTRY] 🔧 Loaded tool: {tool.syscall}")

    def _build_module_path(self, file_path):

        rel = file_path.split("tool_runtime/")[-1]

        module = rel.replace("/", ".").replace(".py", "")

        return f"tool_runtime.{module}"

    def register(self, tool):

        meta = ToolMeta(tool.name, tool.syscall, tool.description)

        self._meta[tool.syscall] = meta
        self._runtime[tool.syscall] = tool

    def list_tools(self):
        return list(self._meta.values())

    def get_tool(self, syscall):

        tool = self._runtime.get(syscall)

        if not tool:
            raise NotImplementedError(f"No tool registered: {syscall}")

        return tool


tool_registry = ToolRegistry()