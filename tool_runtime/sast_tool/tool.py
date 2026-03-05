# tool_runtime/sast_tool/tool.py
import time
import random
from tool_runtime.base_tool.tool import BaseTool

class SASTTool(BaseTool):
    
    name = "SAST Tool"
    syscall = "sast.scan"
    description = "Static application security testing"
    
    def execute(self, process, step, memory_manager=None):
        print(f"[TOOL] 🔒 sast.scan executing for PID={process.pid}")
        time.sleep(1.0)
        
        # Simulate scan results
        vuln_count = random.randint(0, 8)
        critical = random.randint(0, 2) if vuln_count > 0 else 0
        
        return {
            "status": "success",
            "vulnerabilities_found": vuln_count,
            "critical": critical,
            "high": random.randint(0, 3) if vuln_count > 0 else 0,
            "medium": random.randint(0, 3) if vuln_count > 0 else 0,
            "low": random.randint(0, 3) if vuln_count > 0 else 0,
            "scan_time_sec": 1.0,
            "report_path": f"/tmp/reports/sast_{int(time.time())}.json"
        }
    
    def rollback(self, process, step, memory_manager=None):
        print(f"[ROLLBACK] 🧹 sast.scan cleanup for PID={process.pid}")