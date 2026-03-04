# api/routes/agents.py
from fastapi import APIRouter, HTTPException
from typing import Optional, List
from pydantic import BaseModel
from axr_core.agents.agent_registry import agent_registry
from axr_core.agents.planner.planner_agent import PlannerAgent
from axr_core.agents.llm_client import LLMClient
import time
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["agents"])

# Initialize LLM client
llm_client = LLMClient(model="Qwen2.5:3B")

class PlanRequest(BaseModel):
    goal: str
    agent_id: Optional[str] = None
    context: Optional[dict] = None  # Previous agent outputs to consider

class AgentHeartbeat(BaseModel):
    agent_id: str
    status: Optional[str] = None

class AgentMessage(BaseModel):
    from_agent: str
    to_agent: str
    message: str
    context: Optional[dict] = None

@router.get("/agents")
def list_agents():
    """List all registered AI agents"""
    agents = agent_registry.list_agents()
    
    # Add health status
    live_agents = agent_registry.get_live_agents()
    for agent in agents:
        agent["is_live"] = agent["agent_id"] in live_agents
    
    return {
        "count": len(agents),
        "agents": agents
    }

@router.get("/agents/role/{role}")
def get_agents_by_role(role: str):
    """Get agents by role (planner, coder, reviewer, deployer)"""
    agents = agent_registry.get_agents_by_role(role)
    return {
        "count": len(agents),
        "agents": agents
    }

@router.get("/agents/{agent_id}")
def get_agent(agent_id: str):
    """Get details of a specific agent"""
    agent = agent_registry.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Get agent's memory
    memory = {
        "context": agent_registry.get_agent_memory(agent_id, "context"),
        "conversation": agent_registry.get_agent_memory(agent_id, "conversation_history"),
        "observations": agent_registry.get_agent_memory(agent_id, "observations"),
    }
    
    # Get recent outputs
    outputs = agent_registry.get_agent_outputs(agent_id)
    
    agent["is_live"] = agent_id in agent_registry.get_live_agents()
    agent["memory"] = memory
    agent["recent_outputs"] = outputs
    
    return agent

@router.post("/agents/plan")
async def create_plan(request: PlanRequest):
    """
    Request a planner agent to create a workflow plan
    Can incorporate context from previous agent outputs
    """
    # Find an available planner agent
    agent_id = request.agent_id or agent_registry.get_available_agent(role="planner")
    
    if not agent_id:
        # Create a temporary planner if no agent available
        planner = PlannerAgent(llm_client)
        plan = planner.create_plan(request.goal, context=request.context)
        return {
            "plan": plan,
            "agent_id": "temp-planner",
            "planning_time_ms": 0,
            "using_fallback": True
        }
    
    # Update agent status
    agent_registry.update_agent_status(agent_id, "planning", goal=request.goal)
    
    try:
        start_time = time.time()
        
        # Get agent info
        agent_info = agent_registry.get_agent(agent_id)
        
        # Create planner instance
        planner = PlannerAgent(llm_client)
        
        # Generate plan with context
        plan = planner.create_plan(request.goal, context=request.context)
        
        planning_time = int((time.time() - start_time) * 1000)
        
        # Store the plan in agent's memory
        agent_registry.update_agent_memory(agent_id, "plans", plan)
        agent_registry.record_agent_output(agent_id, {
            "type": "plan",
            "goal": request.goal,
            "plan": plan,
            "timestamp": time.time()
        })
        
        # Update agent status back to idle
        agent_registry.update_agent_status(agent_id, "idle")
        
        return {
            "plan": plan,
            "agent_id": agent_id,
            "agent_name": agent_info["name"],
            "agent_role": agent_info["role"],
            "planning_time_ms": planning_time
        }
        
    except Exception as e:
        logger.error(f"Agent {agent_id} failed: {e}")
        agent_registry.update_agent_status(agent_id, "idle")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agents/execute")
async def execute_step(request: dict):
    """
    Request a coder agent to execute a step
    """
    step = request.get("step")
    context = request.get("context", {})
    
    # Find an available coder agent
    agent_id = agent_registry.get_available_agent(role="coder")
    
    if not agent_id:
        raise HTTPException(status_code=503, detail="No available coder agent")
    
    agent_registry.update_agent_status(agent_id, "executing")
    
    try:
        start_time = time.time()
        
        # Execute the step (this would call the actual tool)
        result = {"status": "success", "output": f"Executed {step}"}
        
        execution_time = int((time.time() - start_time) * 1000)
        
        # Store result in agent's memory
        agent_registry.record_agent_output(agent_id, {
            "type": "execution",
            "step": step,
            "result": result,
            "timestamp": time.time()
        })
        
        agent_registry.update_agent_status(agent_id, "idle")
        
        return {
            "result": result,
            "agent_id": agent_id,
            "execution_time_ms": execution_time
        }
        
    except Exception as e:
        agent_registry.update_agent_status(agent_id, "idle")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agents/review")
async def review_output(request: dict):
    """
    Request a reviewer agent to evaluate output
    """
    output = request.get("output")
    expected = request.get("expected")
    context = request.get("context", {})
    
    # Find an available reviewer agent
    agent_id = agent_registry.get_available_agent(role="reviewer")
    
    if not agent_id:
        raise HTTPException(status_code=503, detail="No available reviewer agent")
    
    agent_registry.update_agent_status(agent_id, "reviewing")
    
    try:
        # Review logic here
        passed = output.get("status") == "success"
        feedback = "Output looks good" if passed else "Output failed verification"
        
        review_result = {
            "passed": passed,
            "feedback": feedback,
            "suggestions": [] if passed else ["Retry with fixes"]
        }
        
        # Store review
        agent_registry.record_agent_output(agent_id, {
            "type": "review",
            "output_reviewed": output,
            "review": review_result,
            "timestamp": time.time()
        })
        
        agent_registry.update_agent_status(agent_id, "idle")
        
        return review_result
        
    except Exception as e:
        agent_registry.update_agent_status(agent_id, "idle")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/agents/message")
async def send_message(message: AgentMessage):
    """
    Send a message from one agent to another
    """
    # Store message in both agents' memories
    agent_registry.update_agent_memory(
        message.from_agent, 
        "conversation_history", 
        {"to": message.to_agent, "message": message.message}
    )
    agent_registry.update_agent_memory(
        message.to_agent,
        "conversation_history",
        {"from": message.from_agent, "message": message.message}
    )
    
    return {"status": "message sent"}

@router.post("/agents/heartbeat")
async def agent_heartbeat(heartbeat: AgentHeartbeat):
    """Agent heartbeat endpoint"""
    agent_registry.heartbeat(heartbeat.agent_id, heartbeat.status)
    return {"status": "ok"}

@router.post("/agents/{agent_id}/memory")
async def update_memory(agent_id: str, key: str, value: dict):
    """Update agent's memory"""
    agent_registry.update_agent_memory(agent_id, key, value)
    return {"status": "memory updated"}

@router.get("/agents/{agent_id}/memory/{key}")
async def get_memory(agent_id: str, key: str):
    """Get agent's memory"""
    memory = agent_registry.get_agent_memory(agent_id, key)
    return {"key": key, "value": memory}