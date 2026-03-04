# axr_core/agents/mock_agents.py
from __future__ import annotations
import time
import random
from typing import List, Dict, Optional
from uuid import uuid4
from .agent_registry import agent_registry

class MockAIAgent:
    """
    Mock AI agent for development and testing
    Can be easily replaced with real LLM agents later
    """
    
    def __init__(self, agent_id: str, name: str, role: str, model: str, capabilities: List[str]):
        self.agent_id = agent_id
        self.name = name
        self.role = role
        self.model = model
        self.capabilities = capabilities
        
    def create_plan(self, goal: str, context: Optional[Dict] = None) -> Dict:
        """
        Mock plan creation - Only the planner agent does this
        """
        # Simulate planning time
        planning_time = random.randint(100, 500)
        time.sleep(planning_time / 1000)
        
        # Simple plan for testing
        plan = {
            "steps": [
                {"tool": "git.clone", "priority": 1, "agent": "coder"},
                {"tool": "sast.scan", "priority": 2, "agent": "coder"},
                {"tool": "lint", "priority": 2, "agent": "coder"},
                {"tool": "deploy.service", "priority": 3, "agent": "deployer"},
            ]
        }
        
        # Record output
        agent_registry.record_agent_output(
            self.agent_id,
            {"type": "plan", "goal": goal, "plan": plan, "time_ms": planning_time}
        )
        
        return plan
    
    def execute_step(self, step: Dict, context: Optional[Dict] = None) -> Dict:
        """
        Mock step execution - For coder agents
        """
        execution_time = random.randint(50, 300)
        time.sleep(execution_time / 1000)
        
        # 90% success rate for mocks
        success = random.random() > 0.1
        
        result = {
            "status": "success" if success else "failed",
            "output": f"Executed {step.get('tool')} in {execution_time}ms",
            "execution_time_ms": execution_time,
            "tool": step.get('tool')
        }
        
        agent_registry.record_agent_output(
            self.agent_id,
            {"type": "execution", "step": step, "result": result}
        )
        
        return result
    
    def review_output(self, output: Dict, expected: Optional[Dict] = None) -> Dict:
        """
        Mock output review - For reviewer agents
        """
        review_time = random.randint(20, 100)
        time.sleep(review_time / 1000)
        
        # 85% pass rate
        passed = random.random() > 0.15
        
        review = {
            "passed": passed,
            "feedback": "✅ Output looks good" if passed else "❌ Output needs improvement",
            "suggestions": [] if passed else ["Check for errors", "Retry with fixes"],
            "review_time_ms": review_time
        }
        
        agent_registry.record_agent_output(
            self.agent_id,
            {"type": "review", "output": output, "review": review}
        )
        
        return review
    
    def deploy(self, artifacts: Dict, environment: str) -> Dict:
        """
        Mock deployment - For deployer agents
        """
        deploy_time = random.randint(200, 600)
        time.sleep(deploy_time / 1000)
        
        # 95% success rate for deployments
        success = random.random() > 0.05
        
        result = {
            "status": "success" if success else "failed",
            "environment": environment,
            "url": f"https://{environment}.axr.io/app" if success else None,
            "deploy_time_ms": deploy_time
        }
        
        agent_registry.record_agent_output(
            self.agent_id,
            {"type": "deploy", "artifacts": artifacts, "result": result}
        )
        
        return result


def initialize_mock_agents(count: int = 5, real_planner: bool = True):
    """
    Initialize mock AI agents for development
    
    Args:
        count: Number of mock agents to create
        real_planner: If True, first agent will be a real planner
                      (you'll replace its methods with real LLM calls)
    """
    agent_configs = [
        # Planner agent - This will be your real CodeLlama agent
        {
            "name": "Primary Planner",
            "role": "planner",
            "model": "codellama:7b-instruct-q4_0" if real_planner else "mock-planner",
            "capabilities": ["planning", "optimization", "dependency-analysis", "replanning"]
        },
        # Coder agents
        {
            "name": "Python Coder",
            "role": "coder",
            "model": "mock-coder",
            "capabilities": ["git", "scan", "lint", "build", "test"]
        },
        {
            "name": "DevOps Coder",
            "role": "coder",
            "model": "mock-coder",
            "capabilities": ["docker", "kubernetes", "deploy", "terraform"]
        },
        {
            "name": "Security Coder",
            "role": "coder",
            "model": "mock-coder",
            "capabilities": ["sast", "dast", "dependency-check", "security-scan"]
        },
        # Reviewer agents
        {
            "name": "Code Reviewer",
            "role": "reviewer",
            "model": "mock-reviewer",
            "capabilities": ["code-review", "quality-check", "best-practices"]
        },
        {
            "name": "Security Reviewer",
            "role": "reviewer",
            "model": "mock-reviewer",
            "capabilities": ["security-review", "vulnerability-analysis", "compliance"]
        },
        # Deployer agents
        {
            "name": "Production Deployer",
            "role": "deployer",
            "model": "mock-deployer",
            "capabilities": ["deploy", "rollback", "health-check", "monitoring"]
        },
        {
            "name": "Staging Deployer",
            "role": "deployer",
            "model": "mock-deployer",
            "capabilities": ["deploy", "test-environment", "canary"]
        }
    ]
    
    agents = []
    # Take only the requested number of agents
    for i in range(min(count, len(agent_configs))):
        config = agent_configs[i]
        agent_id = f"agent-{i+1}-{uuid4().hex[:8]}"
        
        # Register with agent registry
        agent_registry.register_agent(
            agent_id=agent_id,
            name=config["name"],
            role=config["role"],
            model=config["model"],
            capabilities=config["capabilities"],
            status="idle"
        )
        
        # Create mock agent instance
        agent = MockAIAgent(
            agent_id=agent_id,
            name=config["name"],
            role=config["role"],
            model=config["model"],
            capabilities=config["capabilities"]
        )
        
        # If this is the real planner and real_planner is True,
        # you'll later replace its methods with actual LLM calls
        if real_planner and i == 0:
            print(f"[AGENTS] 🤖 Agent 1 will be your REAL planner (CodeLlama)")
            # You can later do:
            # agent.create_plan = your_real_llm_planning_function
        
        agents.append(agent)
    
    # Print summary
    roles = [a.role for a in agents]
    print(f"[AGENTS] ✅ Initialized {len(agents)} AI agents")
    print(f"[AGENTS] 📋 Roles: {roles}")
    print(f"[AGENTS] 🎯 Planner: {'REAL' if real_planner else 'MOCK'} = Qwen2.5:3B")
    print(f"[AGENTS] 💻 Others: MOCK (ready for real LLMs)")
    
    return agents


def get_agent_team():
    """Get a balanced team of agents for a task"""
    planners = agent_registry.get_agents_by_role("planner")
    coders = agent_registry.get_agents_by_role("coder")
    reviewers = agent_registry.get_agents_by_role("reviewer")
    deployers = agent_registry.get_agents_by_role("deployer")
    
    return {
        "planners": planners,
        "coders": coders,
        "reviewers": reviewers,
        "deployers": deployers
    }