# axr_core/agents/agent_registry.py
from __future__ import annotations
import time
import threading
from typing import Dict, List, Optional
from uuid import UUID, uuid4

class AgentRegistry:
    """
    Registry for AI Planner Agents
    Agents are responsible for planning workflows, not executing tasks
    """
    
    def __init__(self, ttl_seconds: int = 60):
        self.ttl = ttl_seconds
        self._agents: Dict[str, Dict] = {}
        self._lock = threading.RLock()
    
    def register_agent(self, 
                      agent_id: str, 
                      name: str,
                      model: str,
                      capabilities: List[str],
                      status: str = "idle") -> str:
        """
        Register an AI planner agent
        """
        with self._lock:
            self._agents[agent_id] = {
                "agent_id": agent_id,
                "name": name,
                "model": model,
                "capabilities": capabilities,
                "status": status,  # idle, planning, busy
                "plans_created": 0,
                "success_rate": 100.0,
                "avg_planning_time": 0,
                "last_seen": time.time(),
                "registered_at": time.time(),
                "current_task": None,
            }
            return agent_id
    
    def update_agent_status(self, agent_id: str, status: str, task_id: Optional[str] = None):
        with self._lock:
            if agent_id in self._agents:
                self._agents[agent_id]["status"] = status
                self._agents[agent_id]["current_task"] = task_id
                self._agents[agent_id]["last_seen"] = time.time()
    
    def record_plan_created(self, agent_id: str, planning_time_ms: int, success: bool = True):
        with self._lock:
            if agent_id in self._agents:
                agent = self._agents[agent_id]
                agent["plans_created"] += 1
                
                # Update success rate
                if success:
                    current_success = agent["success_rate"]
                    # Moving average
                    agent["success_rate"] = (current_success * 0.95) + 100 * 0.05
                else:
                    current_success = agent["success_rate"]
                    agent["success_rate"] = (current_success * 0.95) + 0 * 0.05
                
                # Update avg planning time
                current_avg = agent["avg_planning_time"]
                if current_avg == 0:
                    agent["avg_planning_time"] = planning_time_ms
                else:
                    agent["avg_planning_time"] = (current_avg * 0.9) + (planning_time_ms * 0.1)
    
    def get_live_agents(self) -> Dict[str, Dict]:
        now = time.time()
        with self._lock:
            return {
                agent_id: data.copy()
                for agent_id, data in self._agents.items()
                if now - data["last_seen"] <= self.ttl
            }
    
    def get_agent(self, agent_id: str) -> Optional[Dict]:
        with self._lock:
            return self._agents.get(agent_id, {}).copy()
    
    def list_agents(self) -> List[Dict]:
        with self._lock:
            return [data.copy() for data in self._agents.values()]
    
    def get_available_agent(self, capability: Optional[str] = None) -> Optional[str]:
        """
        Get an available agent with optional capability filter
        """
        with self._lock:
            now = time.time()
            available = []
            
            for agent_id, data in self._agents.items():
                if now - data["last_seen"] > self.ttl:
                    continue
                    
                if data["status"] == "idle":
                    if capability is None or capability in data["capabilities"]:
                        available.append((agent_id, data["plans_created"]))
            
            if not available:
                return None
            
            # Load balance: pick agent with fewest plans created
            available.sort(key=lambda x: x[1])
            return available[0][0]
    
    def heartbeat(self, agent_id: str, status: Optional[str] = None):
        with self._lock:
            if agent_id in self._agents:
                self._agents[agent_id]["last_seen"] = time.time()
                if status:
                    self._agents[agent_id]["status"] = status


# Global singleton instance
agent_registry = AgentRegistry()