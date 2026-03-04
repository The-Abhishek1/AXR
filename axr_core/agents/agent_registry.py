# axr_core/agents/agent_registry.py
import time
import threading
from typing import Dict, List, Optional, Any
from uuid import uuid4

class AgentRegistry:
    """
    Registry for AI agents with different roles (planner, coder, reviewer, deployer)
    Each agent has its own memory and capabilities
    """
    
    def __init__(self, ttl_seconds: int = 60):
        self.ttl = ttl_seconds
        self._agents: Dict[str, Dict] = {}
        self._agent_memory: Dict[str, Dict] = {}
        self._agent_outputs: Dict[str, List[Dict]] = {}
        self._lock = threading.RLock()
    
    def register_agent(self, 
                      agent_id: str,
                      name: str,
                      role: str,  # ✅ Required: planner, coder, reviewer, deployer
                      model: str,
                      capabilities: List[str],
                      status: str = "idle") -> str:
        """
        Register an AI agent with specific role
        """
        with self._lock:
            self._agents[agent_id] = {
                "agent_id": agent_id,
                "name": name,
                "role": role,
                "model": model,
                "capabilities": capabilities,
                "status": status,
                "tasks_completed": 0,
                "success_rate": 100.0,
                "avg_response_time": 0,
                "last_seen": time.time(),
                "registered_at": time.time(),
                "current_task": None,
                "current_goal": None,
            }
            
            # Initialize agent memory
            self._agent_memory[agent_id] = {
                "context": {},
                "conversation_history": [],
                "observations": [],
                "plans": [],
            }
            
            self._agent_outputs[agent_id] = []
            
            print(f"[AGENT-REG] Registered {name} ({agent_id}) as {role}")
            
            return agent_id
    
    def update_agent_status(self, agent_id: str, status: str, task_id: Optional[str] = None, goal: Optional[str] = None):
        """Update agent status and current task"""
        with self._lock:
            if agent_id in self._agents:
                self._agents[agent_id]["status"] = status
                self._agents[agent_id]["current_task"] = task_id
                if goal:
                    self._agents[agent_id]["current_goal"] = goal
                self._agents[agent_id]["last_seen"] = time.time()
                
                if status == "idle":
                    self._agents[agent_id]["tasks_completed"] += 1
    
    def record_agent_output(self, agent_id: str, output: Dict):
        """Record an agent's output for other agents to read"""
        with self._lock:
            if agent_id not in self._agent_outputs:
                self._agent_outputs[agent_id] = []
            
            self._agent_outputs[agent_id].append({
                "timestamp": time.time(),
                "output": output
            })
            
            # Keep only last 100 outputs
            if len(self._agent_outputs[agent_id]) > 100:
                self._agent_outputs[agent_id] = self._agent_outputs[agent_id][-100:]
    
    def get_agent_outputs(self, agent_id: str, limit: int = 10) -> List[Dict]:
        """Get recent outputs from an agent"""
        with self._lock:
            outputs = self._agent_outputs.get(agent_id, [])
            return outputs[-limit:]
    
    def update_agent_memory(self, agent_id: str, key: str, value: Any):
        """Update an agent's working memory"""
        with self._lock:
            if agent_id not in self._agent_memory:
                self._agent_memory[agent_id] = {}
            
            if key not in self._agent_memory[agent_id]:
                self._agent_memory[agent_id][key] = []
            
            if isinstance(self._agent_memory[agent_id][key], list):
                self._agent_memory[agent_id][key].append({
                    "timestamp": time.time(),
                    "value": value
                })
            else:
                self._agent_memory[agent_id][key] = value
    
    def get_agent_memory(self, agent_id: str, key: str) -> Any:
        """Get value from agent's memory"""
        with self._lock:
            return self._agent_memory.get(agent_id, {}).get(key)
    
    def get_agents_by_role(self, role: str) -> List[Dict]:
        """Get all agents with specific role"""
        with self._lock:
            return [
                agent.copy() 
                for agent in self._agents.values() 
                if agent["role"] == role
            ]
    
    def get_available_agent(self, role: Optional[str] = None, capability: Optional[str] = None) -> Optional[str]:
        """Get an available agent by role or capability"""
        with self._lock:
            now = time.time()
            available = []
            
            for agent_id, data in self._agents.items():
                # Check if agent is live
                if now - data["last_seen"] > self.ttl:
                    continue
                
                # Check if agent is idle
                if data["status"] != "idle":
                    continue
                
                # Filter by role if specified
                if role and data["role"] != role:
                    continue
                
                # Filter by capability if specified
                if capability and capability not in data["capabilities"]:
                    continue
                
                available.append((agent_id, data["tasks_completed"]))
            
            if not available:
                return None
            
            # Load balance: pick agent with fewest tasks completed
            available.sort(key=lambda x: x[1])
            return available[0][0]
    
    def get_live_agents(self) -> Dict[str, Dict]:
        """Get all live agents"""
        now = time.time()
        with self._lock:
            return {
                agent_id: data.copy()
                for agent_id, data in self._agents.items()
                if now - data["last_seen"] <= self.ttl
            }
    
    def get_agent(self, agent_id: str) -> Optional[Dict]:
        """Get agent details"""
        with self._lock:
            agent = self._agents.get(agent_id)
            return agent.copy() if agent else None
    
    def list_agents(self) -> List[Dict]:
        """List all registered agents"""
        with self._lock:
            return [data.copy() for data in self._agents.values()]
    
    def heartbeat(self, agent_id: str, status: Optional[str] = None):
        """Agent heartbeat"""
        with self._lock:
            if agent_id in self._agents:
                self._agents[agent_id]["last_seen"] = time.time()
                if status:
                    self._agents[agent_id]["status"] = status


# Global singleton instance
agent_registry = AgentRegistry()