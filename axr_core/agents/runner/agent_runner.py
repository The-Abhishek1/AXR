# axr_core/agents/runner/agent_runner.py
import asyncio
import logging
from typing import Dict, Any, Optional
from uuid import uuid4

from axr_core.agents.registry import agent_registry
from axr_core.process_scheduler.dynamic_scheduler import DynamicScheduler
from axr_core.tools.router.tool_router import ToolRouter

logger = logging.getLogger(__name__)

class AgentRunner:
    """
    Main entry point for agent-driven execution
    """
    
    def __init__(self):
        self.tool_router = ToolRouter()
        self.scheduler = DynamicScheduler(self.tool_router)
        self.active_processes = {}
    
    async def execute_goal(self, 
                          goal: str, 
                          domain_hint: str = None,
                          initial_plan: list = None) -> Dict:
        """
        Execute a goal using dynamic agent collaboration
        
        Args:
            goal: The goal to achieve
            domain_hint: Optional domain hint for finding the right agents
            initial_plan: Optional initial plan (if None, planner generates it)
        """
        process_id = str(uuid4())
        
        logger.info(f"🚀 Starting process {process_id}: {goal}")
        
        # Get or create initial plan
        if not initial_plan:
            planner = self._get_planner_agent()
            if not planner:
                raise Exception("No planner agent available")
            
            context = self._create_context(process_id, goal)
            plan_result = await planner.execute({
                "action": "create_plan",
                "goal": goal,
                "context": context
            }, self.tool_router)
            
            initial_plan = plan_result.get("steps", [])
        
        # Execute with dynamic adaptation
        result = await self.scheduler.execute_process(
            process_id=process_id,
            goal=goal,
            initial_plan=initial_plan
        )
        
        self.active_processes[process_id] = result
        
        return result
    
    async def continue_process(self, process_id: str, new_goal: str = None) -> Dict:
        """Continue a previously paused/failed process"""
        if process_id not in self.active_processes:
            raise Exception(f"Process {process_id} not found")
        
        # Get process context from history
        context = self.active_processes[process_id].get("context")
        
        if new_goal:
            context.goal = new_goal
        
        # Continue execution
        return await self.scheduler._execute_with_adaptation(context)
    
    def _get_planner_agent(self):
        """Get the planner agent"""
        planners = agent_registry.get_agents_by_domain("planning")
        return planners[0] if planners else None
    
    def _create_context(self, process_id: str, goal: str):
        """Create execution context"""
        from axr_core.agents.base.agent import ExecutionContext
        return ExecutionContext(process_id, goal)