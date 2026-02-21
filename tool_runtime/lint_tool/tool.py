import time
from tool_runtime.base_tool.tool import BaseTool


class LINTTool(BaseTool):
    def execute(self, process, step):
        print(f"[TOOL] lint executing for PID={process.pid}")
        time.sleep(0.5)
        return {"vulns_found": 0}