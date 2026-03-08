# axr_core/agents/domains/testing/mock_agents.py
from typing import Dict, List, Any, Optional
from axr_core.agents.base.agent import BaseAgent, TaskContext, TaskType
import asyncio
import random

class MockAgent(BaseAgent):
    """Base mock agent for testing"""
    name = "mock_agent"
    domain = "testing"
    task_types = [TaskType.EXECUTION]
    capabilities = ["mock_execution"]
    rating = 3.0
    cost_per_run = 0.001
    avg_latency = 10
    
    async def execute(self, task: Dict, context: TaskContext = None) -> Dict:
        """Mock execution - simulates work without actual computation"""
        # Simulate processing time
        delay = task.get("mock_delay", 0.1)
        await asyncio.sleep(delay)
        
        # Simulate success/failure based on config
        success_rate = task.get("success_rate", 0.9)
        success = random.random() < success_rate
        
        if success:
            return {
                "success": True,
                "agent": self.name,
                "mock_output": f"Executed {task.get('step', {}).get('tool', 'unknown')}",
                "execution_time_ms": delay * 1000
            }
        else:
            return {
                "success": False,
                "error": "Mock failure for testing",
                "agent": self.name
            }

class MockCodeGenerator(MockAgent):
    name = "mock_code_generator"
    domain = "coding"
    task_types = [TaskType.CODE_GENERATION]
    capabilities = ["code_generation"]
    
    async def execute(self, task: Dict, context: TaskContext = None) -> Dict:
        await asyncio.sleep(0.2)  # Simulate code generation time
        return {
            "success": True,
            "code": "# Mock generated code\nprint('Hello World')",
            "language": "python",
            "agent": self.name
        }

class MockSecurityScanner(MockAgent):
    name = "mock_security_scanner"
    domain = "security"
    task_types = [TaskType.SECURITY]
    capabilities = ["vulnerability_scan"]
    
    async def execute(self, task: Dict, context: TaskContext = None) -> Dict:
        await asyncio.sleep(0.3)
        return {
            "success": True,
            "findings": [],
            "scan_summary": "No vulnerabilities found",
            "agent": self.name
        }

class MockCommunicator(MockAgent):
    name = "mock_communicator"
    domain = "communication"
    task_types = [TaskType.COMMUNICATION, TaskType.EMAIL, TaskType.MESSAGE]
    capabilities = ["send_message", "send_email"]
    
    async def execute(self, task: Dict, context: TaskContext = None) -> Dict:
        await asyncio.sleep(0.1)
        print(f"📧 [MOCK] Would send: {task.get('message', 'No message')}")
        return {
            "success": True,
            "sent": True,
            "recipient": task.get("to", "unknown"),
            "agent": self.name
        }