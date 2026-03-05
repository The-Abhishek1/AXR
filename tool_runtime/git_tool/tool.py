from tool_runtime.base_tool.tool import BaseTool
import time
import random


class GitTool(BaseTool):

    name = "Git Tool"
    syscall = "git.clone"
    description = "Clone a git repository"

    def execute(self, process, step, memory_manager=None):

        print(f"[TOOL] 🔧 git.clone executing for PID={process.pid}")

        time.sleep(0.5)

        return {
            "status": "success",
            "repo": f"/tmp/repo_{random.randint(1000,9999)}"
        }

    def rollback(self, process, step, memory_manager=None):

        print("[ROLLBACK] cleaning repo")