# tool_runtime/git_tool/tool.py
import time
import random
from tool_runtime.base_tool.tool import BaseTool

class GitTool(BaseTool):
    def execute(self, process, step, memory_manager=None):
        print(f"[TOOL] 🔧 git.clone executing for PID={process.pid}")
        time.sleep(0.5)
        
        # Simulate different repos
        repos = ["https://github.com/axr/demo-app.git", 
                 "https://github.com/axr/auth-service.git",
                 "https://github.com/axr/frontend.git"]
        
        return {
            "status": "success",
            "repo_path": f"/tmp/repo_{random.randint(1000, 9999)}",
            "branch": "main",
            "commit": "abc123def456",
            "repo_url": random.choice(repos)
        }
    
    def rollback(self, process, step, memory_manager=None):
        print(f"[ROLLBACK] 🧹 git.clone cleanup for PID={process.pid}")
        # In real life: rm -rf /tmp/repo