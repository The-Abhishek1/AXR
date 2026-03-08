# api/routes/dev_agents.py
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import logging
import random

from axr_core.agents.registry.agent_registry import agent_registry
from axr_core.agents.base.agent import TaskType

router = APIRouter(prefix="/dev/agents", tags=["development"])
logger = logging.getLogger(__name__)

class DevExecutionRequest(BaseModel):
    goal: str
    mock_mode: bool = True
    mock_delay: float = 0.1
    success_rate: float = 0.9

class AgentInfo(BaseModel):
    name: str
    domain: str
    capabilities: List[str]
    rating: float
    cost: float

@router.post("/test")
async def test_execution(request: DevExecutionRequest):
    """
    Test agent execution in mock mode (no actual computation)
    """
    try:
        logger.info(f"🧪 Test execution: {request.goal} (mock={request.mock_mode})")
        
        # Find suitable agents without executing
        suitable_agents = []
        for agent in agent_registry.get_all_agents():
            matches = []
            for capability in agent.capabilities:
                # Simple matching - any word in goal matches any part of capability
                goal_words = set(request.goal.lower().split())
                cap_words = set(capability.lower().split('_'))
                if goal_words & cap_words:  # Intersection not empty
                    matches.append(capability)
            
            if matches:
                suitable_agents.append({
                    "name": agent.name,
                    "domain": agent.domain,
                    "capabilities": matches[:3],  # Top 3 matching capabilities
                    "match_score": len(matches) / len(agent.capabilities) if agent.capabilities else 0
                })
        
        # Sort by match score
        suitable_agents.sort(key=lambda x: x["match_score"], reverse=True)
        
        # Simulate execution time
        await asyncio.sleep(request.mock_delay)
        
        # Simulate success/failure
        success = random.random() < request.success_rate
        
        return {
            "success": True,
            "goal": request.goal,
            "mode": "mock" if request.mock_mode else "real",
            "suitable_agents": suitable_agents[:5],  # Top 5 agents
            "simulated_result": {
                "status": "success" if success else "failed",
                "steps_completed": random.randint(1, 5) if success else random.randint(0, 2),
                "agents_involved": [a["name"] for a in suitable_agents[:3]] if success else []
            }
        }
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/lightweight", response_model=Dict[str, Any])
async def get_lightweight_agents():
    """
    Get agent information without heavy processing
    """
    agents = []
    for agent in agent_registry.get_all_agents():
        agents.append({
            "name": agent.name,
            "domain": agent.domain,
            "capabilities": agent.capabilities[:5],  # Limit capabilities
            "rating": getattr(agent, 'rating', 0.0),
            "cost": getattr(agent, 'cost_per_run', 0.0),
            "tasks_completed": getattr(agent, 'tasks_completed', 0),
            "success_rate": getattr(agent, 'success_rate', 100.0)
        })
    
    # Group by domain
    by_domain = {}
    for agent in agents:
        domain = agent["domain"]
        if domain not in by_domain:
            by_domain[domain] = []
        by_domain[domain].append(agent["name"])
    
    return {
        "total": len(agents),
        "agents": agents,
        "by_domain": by_domain
    }

@router.get("/capabilities/search")
async def search_capabilities(query: str = ""):
    """
    Search for agents with specific capabilities
    """
    if not query:
        return {"error": "Query parameter is required"}
    
    results = []
    for agent in agent_registry.get_all_agents():
        matches = []
        for capability in agent.capabilities:
            if query.lower() in capability.lower():
                matches.append(capability)
        
        if matches:
            results.append({
                "agent": agent.name,
                "domain": agent.domain,
                "matching_capabilities": matches,
                "all_capabilities": agent.capabilities
            })
    
    return {
        "query": query,
        "matches": len(results),
        "agents": results
    }

@router.get("/domains")
async def list_domains():
    """
    List all domains and their agents
    """
    domains = {}
    for agent in agent_registry.get_all_agents():
        if agent.domain not in domains:
            domains[agent.domain] = []
        domains[agent.domain].append({
            "name": agent.name,
            "capabilities": agent.capabilities[:3]  # Top 3 capabilities
        })
    
    return {
        "total_domains": len(domains),
        "domains": domains
    }

@router.get("/stats")
async def get_agent_stats():
    """
    Get statistics about the agent system
    """
    agents = agent_registry.get_all_agents()
    
    total_agents = len(agents)
    total_capabilities = sum(len(a.capabilities) for a in agents)
    
    # Most common capabilities
    capability_count = {}
    for agent in agents:
        for cap in agent.capabilities:
            capability_count[cap] = capability_count.get(cap, 0) + 1
    
    top_capabilities = sorted(capability_count.items(), key=lambda x: x[1], reverse=True)[:10]
    
    return {
        "total_agents": total_agents,
        "total_capabilities": total_capabilities,
        "avg_capabilities_per_agent": total_capabilities / total_agents if total_agents else 0,
        "top_capabilities": [{"capability": k, "count": v} for k, v in top_capabilities],
        "domains": len(set(a.domain for a in agents))
    }