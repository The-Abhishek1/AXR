import time
from tool_runtime.base_tool.tool import BaseTool


class GitTool(BaseTool):
    def execute(self, process, step, memory_manager=None):
        print(f"[TOOL] git.clone executing for PID={process.pid}")
        time.sleep(0.5)
        return {"repo_path": "/tmp/repo"}
    
    def rollback(self, process, step, memory_manager=None):
        print(f"[ROLLBACK] git.clone cleanup for PID={process.pid}")