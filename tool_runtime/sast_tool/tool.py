import time
from tool_runtime.base_tool.tool import BaseTool


class SASTTool(BaseTool):
    def execute(self, process, step, memory_manager=None):
        print(f"[TOOL] sast.scan executing for PID= {process.pid}")
        
        previous_outputs = memory_manager.read_process_memory(process.pid)
        
        print(f"[MEMORY] Available inputs: {previous_outputs}")
        time.sleep(0.5)
        return {"vulns_found": 0}

    def rollback(self, process, step, memory_manager=None):
        print(f"[ROLLBACK] sast.scan cleanup for PID={process.pid}")