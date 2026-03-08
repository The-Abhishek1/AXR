# axr_core/process_scheduler/dynamic_scheduler.py
import asyncio
import logging
from typing import Dict, List, Optional
from datetime import datetime
from uuid import uuid4

from axr_core.agents.base.agent import BaseAgent, ExecutionContext, StepStatus
from axr_core.agents.registry import agent_registry
from axr_core.tools.router.tool_router import ToolRouter

logger = logging.getLogger(__name__)

class DynamicScheduler:
    """
    Scheduler that dynamically adapts execution based on agent feedback
    """
    
    def __init__(self, tool_router: ToolRouter):
        self.tool_router = tool_router
        self.active_processes = {}
        self.execution_history = {}
        
    async def execute_process(self, 
                             process_id: str,
                             goal: str,
                             initial_plan: List[Dict]) -> Dict:
        """
        Execute a process with dynamic adaptation
        """
        context = ExecutionContext(process_id, goal)
        context.steps = initial_plan
        
        self.active_processes[process_id] = {
            "context": context,
            "status": "running",
            "start_time": datetime.now()
        }
        
        try:
            # Phase 1: Agent-based plan optimization
            await self._optimize_plan_with_agents(context)
            
            # Phase 2: Execute with dynamic adaptation
            result = await self._execute_with_adaptation(context)
            
            self.active_processes[process_id]["status"] = "completed"
            self.active_processes[process_id]["end_time"] = datetime.now()
            
            return {
                "process_id": process_id,
                "status": "success",
                "result": result,
                "modifications": context.modifications,
                "execution_time": (datetime.now() - self.active_processes[process_id]["start_time"]).total_seconds()
            }
            
        except Exception as e:
            logger.error(f"Process {process_id} failed: {e}")
            self.active_processes[process_id]["status"] = "failed"
            self.active_processes[process_id]["error"] = str(e)
            
            # Try recovery with agents
            recovery_result = await self._attempt_recovery(context, e)
            if recovery_result:
                return recovery_result
            
            raise
    
    async def _optimize_plan_with_agents(self, context: ExecutionContext):
        """Let agents optimize the plan before execution"""
        optimization_tasks = []
        
        for domain in self._get_unique_domains(context.steps):
            agents = agent_registry.get_agents_by_domain(domain)
            for agent in agents:
                task = agent.optimize_plan(context.steps, context)
                optimization_tasks.append(task)
        
        if optimization_tasks:
            optimized_versions = await asyncio.gather(*optimization_tasks, return_exceptions=True)
            
            # Merge optimizations (simplified - in reality you'd need conflict resolution)
            for opt_plan in optimized_versions:
                if isinstance(opt_plan, list) and opt_plan:
                    context.steps = self._merge_plans(context.steps, opt_plan)
        
        # Get parallelization suggestions
        parallel_groups = []
        for agent in agent_registry.get_all_agents():
            try:
                groups = await agent.suggest_parallelization(context.steps, context)
                if groups:
                    parallel_groups.extend(groups)
            except:
                continue
        
        # Store parallelization info in context
        context.context_data["parallel_groups"] = parallel_groups
    
    async def _execute_with_adaptation(self, context: ExecutionContext) -> Dict:
        """Execute steps with dynamic adaptation on failures"""
        
        # Group steps by priority/parallelization
        execution_groups = self._group_steps_for_execution(context)
        
        results = {}
        
        for group in execution_groups:
            # Execute steps in this group in parallel
            group_tasks = []
            for step_idx in group:
                step = context.steps[step_idx]
                task = self._execute_step_with_recovery(step, step_idx, context)
                group_tasks.append(task)
            
            group_results = await asyncio.gather(*group_tasks, return_exceptions=True)
            
            # Process results
            for step_idx, result in zip(group, group_results):
                if isinstance(result, Exception):
                    # Step failed and couldn't recover
                    logger.error(f"Step {step_idx} failed permanently: {result}")
                    context.failed_steps.append({
                        "step": context.steps[step_idx],
                        "error": str(result)
                    })
                    
                    # Check if process can continue
                    if not await self._can_continue_after_failure(context, step_idx):
                        raise Exception(f"Critical step failed: {result}")
                else:
                    # Step succeeded
                    results[f"step_{step_idx}"] = result
                    context.step_results[step_idx] = result
        
        return results
    
    async def _execute_step_with_recovery(self, step: Dict, step_idx: int, context: ExecutionContext):
        """Execute a step with automatic recovery on failure"""
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                # Find appropriate agent for this step
                agent = await self._find_agent_for_step(step, context)
                
                # Execute the step
                result = await self.tool_router.execute_tool(
                    tool_name=step["tool"],
                    params=step.get("params", {}),
                    context=context.context_data
                )
                
                # Record success
                logger.info(f"✅ Step {step_idx} completed successfully")
                return result
                
            except Exception as e:
                retry_count += 1
                logger.warning(f"Step {step_idx} failed (attempt {retry_count}): {e}")
                
                if retry_count >= max_retries:
                    # Step failed all retries, try to get replacement steps
                    replacement_steps = await self._get_replacement_steps(step, e, context)
                    
                    if replacement_steps:
                        # Insert replacement steps and retry first one
                        logger.info(f"🔄 Got {len(replacement_steps)} replacement steps")
                        context.modifications.append({
                            "original_step": step,
                            "replacement_steps": replacement_steps,
                            "error": str(e)
                        })
                        
                        # Replace current step with first replacement
                        if replacement_steps:
                            step.update(replacement_steps[0])
                            retry_count = 0  # Reset retry count for new step
                            continue
                    
                    # No recovery possible
                    raise
                
                # Wait before retry
                await asyncio.sleep(2 ** retry_count)  # Exponential backoff
        
        raise Exception(f"Step failed after {max_retries} attempts")
    
    async def _get_replacement_steps(self, failed_step: Dict, error: Exception, context: ExecutionContext) -> List[Dict]:
        """Get replacement steps from appropriate agent"""
        
        # Find agent that can handle this step
        for agent in agent_registry.get_all_agents():
            if await agent.can_handle_step(failed_step, context):
                try:
                    replacement = await agent.on_step_failed(failed_step, str(error), context)
                    if replacement:
                        return replacement
                except:
                    continue
        
        # If no domain agent, try planner
        planner = self._get_planner_agent()
        if planner:
            try:
                return await planner.on_step_failed(failed_step, str(error), context)
            except:
                pass
        
        return []
    
    async def _find_agent_for_step(self, step: Dict, context: ExecutionContext) -> Optional[BaseAgent]:
        """Find the most suitable agent for a step"""
        for agent in agent_registry.get_all_agents():
            if await agent.can_handle_step(step, context):
                return agent
        return None
    
    async def _can_continue_after_failure(self, context: ExecutionContext, failed_step_idx: int) -> bool:
        """Determine if process can continue after a step failure"""
        # Check if any remaining steps depend on failed step
        for i, step in enumerate(context.steps[failed_step_idx + 1:]):
            actual_idx = failed_step_idx + 1 + i
            deps = step.get("depends_on", [])
            
            if failed_step_idx in deps:
                # This step depends on failed step
                # Check if it's optional or can be skipped
                if step.get("optional", False):
                    continue
                else:
                    return False
        
        return True
    
    def _group_steps_for_execution(self, context: ExecutionContext) -> List[List[int]]:
        """Group steps into parallel execution batches"""
        # Simple grouping by priority
        steps_by_priority = {}
        for i, step in enumerate(context.steps):
            priority = step.get("priority", 1)
            if priority not in steps_by_priority:
                steps_by_priority[priority] = []
            steps_by_priority[priority].append(i)
        
        # Sort by priority and return groups
        return [steps_by_priority[p] for p in sorted(steps_by_priority.keys())]
    
    def _get_planner_agent(self) -> Optional[BaseAgent]:
        """Get the planner agent"""
        planners = agent_registry.get_agents_by_domain("planning")
        return planners[0] if planners else None
    
    def _get_unique_domains(self, steps: List[Dict]) -> List[str]:
        """Get unique domains from steps"""
        domains = set()
        for step in steps:
            # This assumes steps have domain info - you might need to infer it
            domain = step.get("domain", "general")
            domains.add(domain)
        return list(domains)
    
    def _merge_plans(self, original: List[Dict], optimized: List[Dict]) -> List[Dict]:
        """Merge original and optimized plans (simplified)"""
        # In reality, you'd need sophisticated conflict resolution
        return optimized or original
    
    async def _attempt_recovery(self, context: ExecutionContext, error: Exception) -> Optional[Dict]:
        """Attempt to recover a failed process"""
        logger.info("🔄 Attempting process recovery with agents")
        
        # Get all agents to suggest recovery plans
        recovery_plans = []
        for agent in agent_registry.get_all_agents():
            try:
                # Create a special recovery task for the agent
                recovery_step = {
                    "tool": "recovery",
                    "error": str(error),
                    "context": context.context_data
                }
                
                if await agent.can_handle_step(recovery_step, context):
                    plan = await agent.on_step_failed(recovery_step, str(error), context)
                    if plan:
                        recovery_plans.extend(plan)
            except:
                continue
        
        if recovery_plans:
            # Add recovery steps to context
            context.steps.extend(recovery_plans)
            # Retry execution
            return await self._execute_with_adaptation(context)
        
        return None