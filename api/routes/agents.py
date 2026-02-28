# api/routes/agents.py
from fastapi import APIRouter, HTTPException
from typing import Optional
from pydantic import BaseModel
from axr_core.agents.agent_registry import agent_registry
from axr_core.agents.mock_agents import MockAIAgent

# Remove the prefix here since we're adding it in app.py
router = APIRouter(tags=["agents"])

class PlanRequest(BaseModel):
    goal: str
    agent_id: Optional[str] = None

class AgentHeartbeat(BaseModel):
    agent_id: str
    status: Optional[str] = None

@router.get("/agents")  # This will be /agents
def list_agents():
    """
    List all registered AI planner agents
    """
    agents = agent_registry.list_agents()
    
    # Add health status
    live_agents = agent_registry.get_live_agents()
    for agent in agents:
        agent["is_live"] = agent["agent_id"] in live_agents
    
    return {
        "count": len(agents),
        "agents": agents
    }

@router.get("/agents/{agent_id}")  # This will be /agents/{agent_id}
def get_agent(agent_id: str):
    """
    Get details of a specific agent
    """
    agent = agent_registry.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent["is_live"] = agent_id in agent_registry.get_live_agents()
    return agent

@router.post("/agents/plan")  # This will be /agents/plan
async def create_plan(request: PlanRequest):
    """
    Request an AI agent to create a workflow plan
    """
    # Find an available agent
    agent_id = request.agent_id
    
    if not agent_id:
        agent_id = agent_registry.get_available_agent()
        
    if not agent_id:
        # Fallback to mock planning if no agent available
        from axr_core.process_manager.planner import PlannerAgent
        from openai import OpenAI
        
        planner = PlannerAgent(
            llm_client=OpenAI(api_key=""),
            tool_registry=None
        )
        plan = planner._mock_plan(request.goal)
        return {
            "plan": plan,
            "agent_id": "mock-planner",
            "planning_time_ms": 0
        }
    
    # Update agent status
    agent_registry.update_agent_status(agent_id, "planning")
    
    try:
        # Create mock agent instance
        agent_info = agent_registry.get_agent(agent_id)
        mock_agent = MockAIAgent(
            agent_id=agent_id,
            name=agent_info["name"],
            model=agent_info["model"],
            capabilities=agent_info["capabilities"]
        )
        
        # Generate plan
        import time
        start_time = time.time()
        plan = mock_agent.create_plan(request.goal)
        planning_time = int((time.time() - start_time) * 1000)
        
        # Update agent status back to idle
        agent_registry.update_agent_status(agent_id, "idle")
        
        return {
            "plan": plan,
            "agent_id": agent_id,
            "agent_name": agent_info["name"],
            "planning_time_ms": planning_time
        }
        
    except Exception as e:
        agent_registry.update_agent_status(agent_id, "idle")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agents/heartbeat")
async def agent_heartbeat(heartbeat: AgentHeartbeat):
    """
    Agent heartbeat endpoint
    """
    agent_registry.heartbeat(heartbeat.agent_id, heartbeat.status)
    return {"status": "ok"}

@router.post("/agents/{agent_id}/assign")
async def assign_agent(agent_id: str, task_id: str):
    """
    Assign an agent to a specific task
    """
    agent = agent_registry.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent_registry.update_agent_status(agent_id, "busy", task_id)
    return {"status": "assigned"}

@router.post("/agents/{agent_id}/release")
async def release_agent(agent_id: str):
    """
    Release an agent from its current task
    """
    agent = agent_registry.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    agent_registry.update_agent_status(agent_id, "idle")
    return {"status": "released"}