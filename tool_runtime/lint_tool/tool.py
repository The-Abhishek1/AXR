import time
from tool_runtime.base_tool.tool import BaseTool


class LINTTool(BaseTool):
    def execute(self, process, step, memory_manager=None):
        print(f"[TOOL] lint executing for PID={process.pid}")
        time.sleep(0.5)
        return {"vulns_found": 0}
    
    def rollback(self, process, step, memory_manager=None):
        print(f"[ROLLBACK] lint cleanup for PID={process.pid}")