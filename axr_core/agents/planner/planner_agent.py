# axr_core/agents/planner/planner_agent.py
import json
import logging
from typing import Dict, List, Optional, Any
from axr_core.agents.base.agent import BaseAgent, TaskContext, ExecutionContext
from axr_core.agents.llm_client import LLMClient
from tool_registry.registry import tool_registry
from axr_core.telemetry.custom import trace_agent_decision

logger = logging.getLogger(__name__)

class PlannerAgent(BaseAgent):
    name = "planner_agent"
    domain = "planning"
    task_types = []  # Add appropriate task types
    capabilities = ["task_planning", "workflow_optimization", "replanning"]
    rating = 4.8
    cost_per_run = 0.003
    avg_latency = 150
    
    def __init__(self, llm_client: LLMClient = None):
        super().__init__()
        # Initialize LLM client if not provided
        if llm_client is None:
            from axr_core.agents.llm_client import LLMClient
            self.llm = LLMClient()
        else:
            self.llm = llm_client
        self.active_plans = {}  # Track active plans per process
    
    

    async def execute(self, task: Dict, context: Optional[TaskContext] = None) -> Dict:
        """Execute planning task - fixed signature"""
        goal = task.get("goal")
        
        if task.get("action") == "replan":
            failed_step = task.get("failed_step")
            error = task.get("error")
            return await self._replan_after_failure(failed_step, error, context)
        else:
            return await self.create_plan(goal, context)
      
        
    async def can_handle_step(self, step: Dict, context: ExecutionContext) -> bool:
        """Planner can handle any step that needs replanning"""
        # Planner can handle steps that are marked for replanning or any step if no domain agent exists
        return step.get("needs_replanning", False) or step.get("tool") in ["planning", "replan"]
    
    async def on_step_failed(self, failed_step: Dict, error: str, context: ExecutionContext) -> List[Dict]:
        """Handle step failure by creating alternative plan"""
        logger.info(f"🔄 Planner handling failure: {failed_step.get('tool', 'unknown')} - {error}")
        
        # Try to find a domain agent first
        domain_agent = await self._get_domain_agent_for_step(failed_step, context)
        
        if domain_agent and hasattr(domain_agent, 'can_handle_step') and await domain_agent.can_handle_step(failed_step, context):
            # Let domain agent handle it first
            return await domain_agent.on_step_failed(failed_step, error, context)
        
        # If no domain agent can handle, create alternative plan
        return await self._create_alternative_plan(failed_step, error, context)
    
    async def optimize_plan(self, original_plan: List[Dict], context: ExecutionContext) -> List[Dict]:
        """Optimize the entire plan using LLM"""
        if not original_plan:
            return original_plan
            
        system_prompt = """You are an expert workflow optimizer. Optimize the given plan for:
1. Parallel execution opportunities
2. Dependency optimization
3. Resource utilization
4. Failure recovery paths

Return optimized plan with same structure."""
        
        try:
            plan_json = json.dumps({"steps": original_plan}, indent=2)
            prompt = f"Optimize this plan:\n{plan_json}\nGoal: {context.goal}"
            
            optimized = self.llm.generate_json(prompt, system_prompt)
            return optimized.get("steps", original_plan)
        except Exception as e:
            logger.warning(f"Plan optimization failed: {e}, using original")
            return original_plan
    
    async def suggest_parallelization(self, steps: List[Dict], context: ExecutionContext) -> List[List[int]]:
        """Suggest which steps can run in parallel based on priorities"""
        if not steps:
            return []
            
        # Group steps by priority
        priority_groups = {}
        for i, step in enumerate(steps):
            priority = step.get("priority", 1)
            if priority not in priority_groups:
                priority_groups[priority] = []
            priority_groups[priority].append(i)
        
        # Return groups that can run in parallel
        return list(priority_groups.values())
    
    @trace_agent_decision("planner")
    async def create_plan(self, goal: str, context: ExecutionContext = None) -> Dict:
        """Create initial plan"""
        try:
            # Get tool descriptions
            tools = tool_registry.list_tools()
            tool_descriptions = "\n".join([
                f"- {t.syscall}: {t.description}" for t in tools
            ])
            
            system_prompt = f"""You are an expert workflow planner.
AVAILABLE TOOLS:
{tool_descriptions}

Create a plan with steps that can be dynamically adjusted during execution.
Consider alternative approaches for each step.

RESPONSE FORMAT:
{{
    "steps": [
        {{
            "tool": "tool.name",
            "priority": 1,
            "params": {{}}
        }}
    ]
}}"""

            prompt = f"Create an execution plan for: {goal}"
            
            plan = self.llm.generate_json(prompt, system_prompt)
            
            # Validate plan has steps
            if "steps" not in plan:
                plan = {"steps": []}
            
            # Store plan for this process
            if context and hasattr(context, 'process_id'):
                self.active_plans[context.process_id] = plan
            
            return plan
            
        except Exception as e:
            logger.error(f"Plan creation failed: {e}, using fallback")
            return self._fallback_plan(goal)
    
    async def _replan_after_failure(self, failed_step: Dict, error: str, context: ExecutionContext) -> Dict:
        """Create new plan segment after failure"""
        system_prompt = """The current step failed. Create alternative steps to achieve the same goal.
Consider:
1. Different tools that can do the same job
2. Breaking the step into smaller substeps
3. Skipping if optional
4. Using fallback methods

Return ONLY a JSON object with 'steps' array."""
        
        try:
            prompt = f"""Failed step: {json.dumps(failed_step)}
Error: {error}
Goal: {context.goal if context else 'unknown'}
Completed steps: {len(context.step_results) if context else 0}
Create replacement steps:"""
            
            return self.llm.generate_json(prompt, system_prompt)
        except:
            return {"steps": []}
    
    async def _create_alternative_plan(self, failed_step: Dict, error: str, context: ExecutionContext) -> List[Dict]:
        """Create alternative steps for the failed one"""
        # Simple fallback: try different tool based on error type
        tool_name = failed_step.get("tool", "")
        
        # Common tool alternatives
        alternatives = {
            "git.clone": [
                {"tool": "git.clone_ssh", "priority": failed_step.get("priority", 1), 
                 "params": {"fallback": True, "original": tool_name}}
            ],
            "sast.scan": [
                {"tool": "sast.scan_light", "priority": failed_step.get("priority", 1),
                 "params": {"mode": "quick", "original": tool_name}}
            ],
            "test.run": [
                {"tool": "test.run_quick", "priority": failed_step.get("priority", 1),
                 "params": {"parallel": True, "original": tool_name}}
            ],
        }
        
        if tool_name in alternatives:
            return alternatives[tool_name]
        
        # Default: return a logging step
        return [{
            "tool": "log.error",
            "priority": failed_step.get("priority", 1),
            "params": {
                "message": f"Cannot recover from {tool_name} failure: {error}",
                "original_tool": tool_name
            }
        }]
    
    async def _get_domain_agent_for_step(self, step: Dict, context: ExecutionContext):
        """Find appropriate domain agent for a step"""
        # This would use your agent registry to find agents by domain
        from axr_core.agents.registry.agent_registry import agent_registry
        
        # Try to infer domain from tool name
        tool = step.get("tool", "")
        domain_map = {
            "git.": "vcs",
            "sast.": "security",
            "test.": "testing",
            "deploy.": "deployment",
            "docker.": "container",
        }
        
        domain = "general"
        for prefix, d in domain_map.items():
            if tool.startswith(prefix):
                domain = d
                break
        
        agents = agent_registry.get_agents_by_domain(domain)
        
        for agent in agents:
            if hasattr(agent, 'can_handle_step'):
                if await agent.can_handle_step(step, context):
                    return agent
        
        return None
    
    def _fallback_plan(self, goal: str) -> Dict:
        """Simple fallback plan when LLM fails"""
        goal_lower = goal.lower()
        steps = []
        
        # Always add a clone step
        steps.append({"tool": "git.clone", "priority": 1, "params": {}})
        clone_idx = 0
        
        # Security scan
        if any(word in goal_lower for word in ['scan', 'security', 'sast']):
            steps.append({
                "tool": "sast.scan", 
                "priority": 2, 
                "params": {"deps": [clone_idx]}
            })
        
        # Lint
        if any(word in goal_lower for word in ['lint', 'style']):
            steps.append({
                "tool": "lint", 
                "priority": 2, 
                "params": {"deps": [clone_idx]}
            })
        
        # Build
        if any(word in goal_lower for word in ['build', 'compile']):
            steps.append({
                "tool": "build", 
                "priority": 2, 
                "params": {"deps": [clone_idx]}
            })
        
        # Test
        if any(word in goal_lower for word in ['test']):
            steps.append({
                "tool": "test.run", 
                "priority": 3, 
                "params": {}
            })
        
        # Deploy
        if any(word in goal_lower for word in ['deploy', 'staging', 'production']):
            steps.append({
                "tool": "deploy.service", 
                "priority": 4, 
                "params": {}
            })
        
        return {"steps": steps}