import time
from tool_runtime.base_tool.tool import BaseTool


class SASTTool(BaseTool):
    def execute(self, process, inputs, memory_manager=None):
        print(f"[TOOL] sast.scan executing for PID= {process.pid}")
        
        if inputs:
            previous_outputs = inputs
        
        elif memory_manager:
            previous_outputs = memory_manager.read_process_memory(process.pid)
        else:
            previous_outputs = {}
        
        
        print(f"[MEMORY] Available inputs: {previous_outputs}")
        time.sleep(0.5)
        return {"vulns_found": 0}

    def rollback(self, process, step, memory_manager=None):
        print(f"[ROLLBACK] sast.scan cleanup for PID={process.pid}")