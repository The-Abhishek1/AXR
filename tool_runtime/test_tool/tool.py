# tool_runtime/test_tool/tool.py
import time
import random
from tool_runtime.base_tool.tool import BaseTool

class TestTool(BaseTool):
    def execute(self, process, step, memory_manager=None):
        print(f"[TOOL] 🧪 test.run executing for PID={process.pid}")
        time.sleep(1.2)
        
        # 90% success rate for demo
        passed = random.random() > 0.1
        total_tests = random.randint(30, 60)
        passed_count = int(total_tests * (0.95 if passed else 0.85))
        
        return {
            "status": "success" if passed else "failed",
            "tests_run": total_tests,
            "passed": passed_count,
            "failed": total_tests - passed_count,
            "skipped": random.randint(0, 3),
            "coverage": f"{random.randint(75, 95)}%",
            "duration_sec": 1.2,
            "report_path": f"/tmp/reports/test_{int(time.time())}.xml"
        }
    
    def rollback(self, process, step, memory_manager=None):
        print(f"[ROLLBACK] 🧹 test cleanup for PID={process.pid}")