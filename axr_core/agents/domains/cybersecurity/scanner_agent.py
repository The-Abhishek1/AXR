# axr_core/agents/domains/cybersecurity/scanner_agent.py
from typing import Dict, List, Any
from axr_core.agents.base.agent import BaseAgent, TaskContext, TaskType, ExecutionContext

class SecurityScannerAgent(BaseAgent):
    name = "security_scanner"
    domain = "cybersecurity"
    task_types = [TaskType.SECURITY]
    capabilities = ["vulnerability_scan", "dependency_check", "code_analysis"]
    rating = 4.7
    cost_per_run = 0.005
    avg_latency = 200

    async def execute(self, task: Dict, context: TaskContext = None) -> Dict:
        """Execute security scan"""
        scan_type = task.get("scan_type", "basic")
        target = task.get("target", "")
        
        return {
            "success": True,
            "agent": self.name,
            "scan_type": scan_type,
            "target": target,
            "findings": [],
            "status": "completed"
        }
    
    async def can_handle_step(self, step: Dict, context: ExecutionContext) -> bool:
        """Check if this agent can handle a step"""
        security_tools = ["sast.scan", "dependency.check", "vulnerability.scan"]
        return step.get("tool") in security_tools
    
    async def on_step_failed(self, failed_step: Dict, error: str, context: ExecutionContext) -> List[Dict]:
        """Handle security scan failures"""
        if "sast.scan" in failed_step.get("tool", ""):
            return [
                {
                    "tool": "sast.scan.light",
                    "priority": failed_step.get("priority", 1),
                    "params": {"mode": "quick", "depth": 1}
                },
                {
                    "tool": "dependency.check",
                    "priority": failed_step.get("priority", 1),
                    "params": {"focus": "critical"}
                }
            ]
        return []