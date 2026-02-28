# axr_core/agents/mock_agents.py
from __future__ import annotations
import time
import random
from typing import List, Dict
from uuid import uuid4
from .agent_registry import agent_registry

class MockAIAgent:
    """
    Mock AI agent for development and testing
    """
    
    def __init__(self, agent_id: str, name: str, model: str, capabilities: List[str]):
        self.agent_id = agent_id
        self.name = name
        self.model = model
        self.capabilities = capabilities
        
    def create_plan(self, goal: str) -> Dict:
        """
        Mock plan creation
        """
        # Simulate planning time
        planning_time = random.randint(100, 500)
        time.sleep(planning_time / 1000)  # Simulate work
        
        # Simple plan for testing
        plan = {
            "steps": [
                {"tool": "git.clone", "priority": 1},
                {"tool": "sast.scan", "priority": 2},
                {"tool": "lint", "priority": 2},
                {"tool": "deploy.service", "priority": 3},
            ]
        }
        
        # Record success
        agent_registry.record_plan_created(
            self.agent_id, 
            planning_time, 
            success=True
        )
        
        return plan


def initialize_mock_agents(count: int = 3):
    """
    Initialize mock AI agents for development
    """
    agent_configs = [
        {
            "name": "DevSecOps Agent",
            "model": "gpt-4o",
            "capabilities": ["security", "ci/cd", "deployment"]
        },
        {
            "name": "Data Pipeline Agent",
            "model": "gpt-4o-mini",
            "capabilities": ["etl", "data-processing", "analytics"]
        },
        {
            "name": "Infrastructure Agent",
            "model": "claude-3",
            "capabilities": ["terraform", "kubernetes", "cloud"]
        },
        {
            "name": "Testing Agent",
            "model": "gpt-3.5",
            "capabilities": ["unit-test", "integration-test", "e2e"]
        },
        {
            "name": "Security Agent",
            "model": "gpt-4",
            "capabilities": ["vulnerability-scan", "compliance", "audit"]
        }
    ]
    
    agents = []
    for i in range(min(count, len(agent_configs))):
        config = agent_configs[i]
        agent_id = f"agent-{i+1}-{uuid4().hex[:8]}"
        
        agent_registry.register_agent(
            agent_id=agent_id,
            name=config["name"],
            model=config["model"],
            capabilities=config["capabilities"]
        )
        
        agents.append(MockAIAgent(
            agent_id=agent_id,
            name=config["name"],
            model=config["model"],
            capabilities=config["capabilities"]
        ))
    
    print(f"[AGENTS] Initialized {len(agents)} mock AI agents")
    return agents