import time
from tool_runtime.base_tool.tool import BaseTool


class GitTool(BaseTool):
    def execute(self, process, step):
        print(f"[TOOL] git.clone executing for PID={process.pid}")
        time.sleep(0.5)
        return {"repo_path": "/tmp/repo"}