# tool_runtime/build_tool/tool.py
import time
import random
from tool_runtime.base_tool.tool import BaseTool

class BuildTool(BaseTool):
    name = "Build Tool"
    syscall = "build"
    description = "Build application artifacts"
    
    def execute(self, process, step, memory_manager=None):
        print(f"[TOOL] 🔨 build executing for PID={process.pid}")
        time.sleep(0.8)
        
        return {
            "status": "success",
            "artifacts": f"/tmp/build/output_{int(time.time())}.jar",
            "size_mb": random.randint(15, 45),
            "build_time_sec": 0.8,
            "docker_image": f"axr-demo/app:{random.randint(100, 999)}",
            "checksum": "sha256:abc123def456"
        }
    
    def rollback(self, process, step, memory_manager=None):
        print(f"[ROLLBACK] 🧹 build cleanup for PID={process.pid}")
        # rm -rf /tmp/build