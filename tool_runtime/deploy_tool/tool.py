import time
from tool_runtime.base_tool.tool import BaseTool


class DEPLOYTool(BaseTool):
    def execute(self, process, step, memory_manager=None):
        print(f"[TOOL] deploy.service executing for PID={process.pid}")
        time.sleep(0.5)
        return {"vulns_found": 0}