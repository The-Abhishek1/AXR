import time
from tool_runtime.base_tool.tool import BaseTool


class SASTTool(BaseTool):
    def execute(self, process, step):
        print(f"[TOOL] sast.scan executing for PID={process.pid}")
        time.sleep(0.5)
        return {"vulns_found": 0}