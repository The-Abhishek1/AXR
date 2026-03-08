# axr_core/agents/runner/enhanced_agent_runner.py
import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from uuid import uuid4
import json
import random

from axr_core.agents.base.agent import BaseAgent, TaskContext, TaskType, AgentMessage
from axr_core.agents.registry.agent_registry import agent_registry
from axr_core.process_scheduler.dynamic_scheduler import DynamicScheduler
from axr_core.tools.router.tool_router import ToolRouter
from axr_core.agents.llm_client import LLMClient
from axr_core.process_manager.process import AIProcess
from axr_core.process_graph.models import ProcessStep, StepStatus

logger = logging.getLogger(__name__)

class EnhancedAgentRunner:
    """
    Enhanced agent runner with full collaboration, memory, and tool creation
    """
    
    def __init__(self):
        self.tool_router = ToolRouter()
        self.scheduler = None  # We'll use our own execution logic
        self.active_processes: Dict[str, TaskContext] = {}
        self.llm_client = LLMClient()
        self.agent_memory = {}  # Long-term memory store
        
    async def execute_goal(self, 
                          goal: str,
                          user_id: str = "default",
                          initial_plan: Optional[List[Dict]] = None,
                          pause_on_failure: bool = False,
                          max_retries: int = 3) -> Dict:
        """
        Execute a goal with full agent collaboration and autonomous recovery
        """
        process_id = str(uuid4())
        context = TaskContext(process_id, goal, user_id)
        
        logger.info(f"🚀 Starting autonomous process {process_id[:8]}: {goal}")
        logger.info(f"📋 Available agents: {len(agent_registry.get_all_agents())}")
        
        self.active_processes[process_id] = context
        
        try:
            # Step 1: Planning Phase - Let agents create the initial plan
            if initial_plan:
                context.steps = initial_plan
                logger.info(f"📋 Using provided initial plan with {len(initial_plan)} steps")
            else:
                logger.info("🤔 Planning phase: Agents collaborating to create plan...")
                plan = await self._collaborative_planning(goal, context)
                context.steps = plan.get("steps", [])
                logger.info(f"📋 Created plan with {len(context.steps)} steps")
            
            if not context.steps:
                logger.warning("⚠️ No steps generated, using fallback")
                context.steps = self._fallback_plan(goal)
            
            # Step 2: Execution Phase - Execute with autonomous recovery
            logger.info("⚙️ Execution phase: Starting step execution...")
            result = await self._autonomous_execution(context, max_retries, pause_on_failure)
            
            # Step 3: Summary Generation
            logger.info("📝 Generating execution summary...")
            summary = await self._generate_comprehensive_summary(context, result)
            
            # Step 4: Learning Phase - Agents learn from this execution
            logger.info("🧠 Learning phase: Agents updating knowledge...")
            await self._collaborative_learning(context, result)
            
            context.end_time = datetime.now()
            
            # Final result
            final_result = {
                "process_id": process_id,
                "goal": goal,
                "status": "success" if result.get("success") else "failed",
                "result": result,
                "summary": summary,
                "metrics": {
                "duration_seconds": (context.end_time - context.start_time).total_seconds(),
                "steps_completed": len(context.step_results),
                "steps_failed": len(context.failed_steps),
                "steps_modified": len(context.modifications),
                "tools_created": context.created_tools if context.created_tools else [],  # Ensure it's always a list
                "agents_involved": list(set([m.from_agent for m in context.messages if hasattr(m, 'from_agent')])),
                "messages_exchanged": len(context.messages)
                },
                "learning": {
                    "agents_updated": [agent.name for agent in agent_registry.get_all_agents() 
                                     if getattr(agent, 'tasks_completed', 0) > 0],
                    "new_knowledge": len(context.episodic_memory)
                }
            }
            
            logger.info(f"✅ Process {process_id[:8]} completed successfully!")
            return final_result
            
        except Exception as e:
            logger.error(f"❌ Process {process_id[:8]} failed: {e}")
            context.end_time = datetime.now()
            
            return {
                "process_id": process_id,
                "goal": goal,
                "status": "failed",
                "error": str(e),
                "summary": await self._generate_failure_summary(context, e),
                "metrics": {
                    "duration_seconds": (context.end_time - context.start_time).total_seconds(),
                    "steps_completed": len(context.step_results),
                    "steps_failed": len(context.failed_steps)
                },
                "learning": {}
            }
    
    async def _collaborative_planning(self, goal: str, context: TaskContext) -> Dict:
        """Agents collaborate to create a plan"""
        all_agents = agent_registry.get_all_agents()
        planning_agents = []
        
        # Find agents that can help with planning
        for agent in all_agents:
            if "planning" in agent.capabilities or "task_planning" in agent.capabilities:
                planning_agents.append(agent)
        
        if not planning_agents:
            logger.warning("No planning agents found, using LLM")
            return await self._llm_plan(goal, context)
        
        # Collect plans from multiple agents
        plans = []
        for agent in planning_agents[:3]:  # Use top 3 planning agents
            try:
                logger.info(f"🤖 Agent {agent.name} creating plan...")
                plan = await agent.execute({
                    "action": "create_plan",
                    "goal": goal
                }, context)
                if plan and plan.get("steps"):
                    plans.append(plan)
                    logger.info(f"  ✅ {agent.name} created {len(plan['steps'])} steps")
            except Exception as e:
                logger.warning(f"  ⚠️ {agent.name} planning failed: {e}")
        
        # Merge the best plan
        if plans:
            # Choose plan with most steps (or could use voting)
            best_plan = max(plans, key=lambda p: len(p.get("steps", [])))
            logger.info(f"🎯 Selected best plan with {len(best_plan['steps'])} steps")
            return best_plan
        
        return {"steps": []}
    
    async def _autonomous_execution(self, context: TaskContext, max_retries: int, pause_on_failure: bool) -> Dict:
        """Execute steps with autonomous recovery"""
        results = {}
        step_index = 0
        
        while step_index < len(context.steps):
            # Check if paused
            if context.short_term_memory.get("paused_at"):
                logger.info(f"⏸️ Process {context.process_id[:8]} paused at step {step_index}")
                break
            
            step = context.steps[step_index]
            logger.info(f"▶️ Executing step {step_index + 1}/{len(context.steps)}: {step.get('tool', 'unknown')}")
            
            # Find best agent for this step
            agent = await self._find_best_agent_for_step(step, context)
            
            if not agent:
                logger.warning(f"⚠️ No agent found for step {step.get('tool')}")
                # Try to create a tool dynamically
                if await self._try_create_tool(step, context):
                    agent = await self._find_best_agent_for_step(step, context)
            
            if not agent:
                logger.error(f"❌ Cannot execute step {step.get('tool')} - no agent available")
                context.failed_steps.append({
                    "step": step,
                    "error": "No agent available",
                    "step_index": step_index
                })
                if pause_on_failure:
                    break
                step_index += 1
                continue
            
            # Execute with retries
            success = False
            retry_count = 0
            step_error = None
            
            while not success and retry_count < max_retries:
                try:
                    logger.info(f"  🤖 Agent {agent.name} executing (attempt {retry_count + 1})...")
                    
                    result = await agent.execute(step, context)
                    
                    if result.get("success", False):
                        success = True
                        results[f"step_{step_index}"] = result
                        context.step_results[step_index] = result
                        logger.info(f"  ✅ Step {step_index + 1} completed successfully")
                        
                        # Notify other agents of success
                        await self._broadcast_success(agent, step, result, context)
                    else:
                        step_error = result.get("error", "Unknown error")
                        logger.warning(f"  ⚠️ Step failed: {step_error}")
                        
                        # Ask other agents for help
                        help_response = await self._request_help(agent, step, step_error, context)
                        
                        if help_response and help_response.get("suggestion"):
                            # Modify step based on suggestion
                            modified_step = await self._apply_suggestion(step, help_response, context)
                            if modified_step:
                                step = modified_step
                                context.steps[step_index] = modified_step
                                context.modifications.append({
                                    "step_index": step_index,
                                    "original": step,
                                    "modified": modified_step,
                                    "reason": help_response.get("reason", "agent_suggestion")
                                })
                                logger.info(f"  🔄 Step modified based on agent suggestion")
                        
                        retry_count += 1
                        
                except Exception as e:
                    step_error = str(e)
                    logger.error(f"  ❌ Execution error: {step_error}")
                    retry_count += 1
                    
                    # Wait before retry
                    if retry_count < max_retries:
                        wait_time = 2 ** retry_count  # Exponential backoff
                        logger.info(f"  ⏳ Waiting {wait_time}s before retry...")
                        await asyncio.sleep(wait_time)
            
            if not success:
                logger.error(f"❌ Step {step_index + 1} failed after {max_retries} attempts")
                context.failed_steps.append({
                    "step": step,
                    "error": step_error or "Max retries exceeded",
                    "step_index": step_index,
                    "agent": agent.name
                })
                
                if pause_on_failure:
                    break
            
            step_index += 1
        
        # Determine overall success
        success = len(results) == len(context.steps) - len(context.failed_steps)
        
        return {
            "success": success,
            "results": results,
            "failed_steps": context.failed_steps,
            "modifications": context.modifications
        }
    
    async def _find_best_agent_for_step(self, step: Dict, context: TaskContext) -> Optional[BaseAgent]:
        """Find the best agent for a step using multiple criteria"""
        best_agent = None
        best_score = 0
        
        for agent in agent_registry.get_all_agents():
            score = 0
            step_tool = step.get("tool", "").lower()
            
            # Check exact capability match
            if step_tool in agent.capabilities:
                score += 10
            
            # Check partial capability matches
            for capability in agent.capabilities:
                if step_tool in capability or capability in step_tool:
                    score += 5
            
            # Check domain match
            if hasattr(agent, 'domain') and agent.domain in step_tool:
                score += 3
            
            # Prefer agents with higher success rate
            if hasattr(agent, 'success_rate'):
                score += agent.success_rate / 20  # Add up to 5 points
            
            # Prefer agents that have done similar tasks
            similar_tasks = getattr(agent, 'tasks_completed', 0)
            score += min(similar_tasks, 5)  # Max 5 points for experience
            
            if score > best_score:
                best_score = score
                best_agent = agent
        
        if best_agent:
            logger.debug(f"  Selected {best_agent.name} (score: {best_score}) for {step_tool}")
        
        return best_agent if best_score > 0 else None
    
    async def _try_create_tool(self, step: Dict, context: TaskContext) -> bool:
        """Try to create a tool dynamically"""
        logger.info(f"🔧 Attempting to create tool for: {step.get('tool')}")
        
        # Find code generator agents
        code_agents = []
        for agent in agent_registry.get_all_agents():
            if "tool_creation" in agent.capabilities or "code_generation" in agent.capabilities:
                code_agents.append(agent)
        
        if not code_agents:
            logger.warning("No code generation agents available")
            return False
        
        # Ask code agent to create the tool
        try:
            result = await code_agents[0].execute({
                "task_type": "tool_creation",
                "tool_name": step.get("tool"),
                "description": step.get("description", f"Tool for {step.get('tool')}"),
                "functionality": step.get("functionality", "")
            }, context)
            
            if result.get("success"):
                logger.info(f"✅ Tool {step.get('tool')} created successfully")
                context.created_tools.append(step.get("tool"))
                return True
            else:
                logger.warning(f"❌ Tool creation failed: {result.get('error')}")
                return False
                
        except Exception as e:
            logger.error(f"Tool creation error: {e}")
            return False
    
    async def _request_help(self, agent: BaseAgent, step: Dict, error: str, context: TaskContext) -> Optional[Dict]:
        """Request help from other agents when a step fails"""
        help_message = AgentMessage(
            from_agent=agent.name,
            to_agent="all",
            message_type="request_help",
            content={
                "step": step,
                "error": error,
                "context": context.short_term_memory
            }
        )
        
        responses = []
        for other_agent in agent_registry.get_all_agents():
            if other_agent.name != agent.name:
                try:
                    response = await other_agent.collaborate(help_message, context)
                    if response:
                        responses.append((other_agent, response))
                except Exception as e:
                    logger.debug(f"  {other_agent.name} couldn't help: {e}")
        
        if responses:
            # Return the best response (simplified - take first for now)
            return responses[0][1]
        
        return None
    
    async def _apply_suggestion(self, step: Dict, suggestion: Dict, context: TaskContext) -> Optional[Dict]:
        """Apply a suggestion to modify a step"""
        modified_step = step.copy()
        
        if "new_tool" in suggestion:
            modified_step["tool"] = suggestion["new_tool"]
        
        if "modified_params" in suggestion:
            modified_step["params"] = suggestion["modified_params"]
        
        if "additional_steps" in suggestion:
            # Insert additional steps after current one
            for additional in suggestion["additional_steps"]:
                context.steps.insert(context.steps.index(step) + 1, additional)
        
        return modified_step
    
    async def _broadcast_success(self, agent: BaseAgent, step: Dict, result: Dict, context: TaskContext):
        """Broadcast success to other agents for learning"""
        success_message = AgentMessage(
            from_agent=agent.name,
            to_agent="all",
            message_type="step_succeeded",
            content={
                "step": step,
                "result": result,
                "context": context.short_term_memory
            }
        )
        
        for other_agent in agent_registry.get_all_agents():
            if other_agent.name != agent.name:
                try:
                    await other_agent.collaborate(success_message, context)
                except:
                    pass
    
    async def _collaborative_learning(self, context: TaskContext, result: Dict):
        """All agents learn from this execution"""
        learning_data = {
            "goal": context.goal,
            "steps": context.steps,
            "result": result,
            "success": result.get("success", False),
            "modifications": context.modifications,
            "tools_created": context.created_tools,
            "timestamp": datetime.now()
        }
        
        # Let each agent learn
        for agent in agent_registry.get_all_agents():
            try:
                if hasattr(agent, 'learn_from_task'):
                    await agent.learn_from_task(learning_data, context)
            except Exception as e:
                logger.debug(f"  {agent.name} learning failed: {e}")
    
    async def _generate_comprehensive_summary(self, context: TaskContext, result: Dict) -> str:
        """Generate a comprehensive summary using communication agents"""
        # Find communication agents
        comm_agents = []
        for agent in agent_registry.get_all_agents():
            if "create_report" in agent.capabilities or "text_summary" in agent.capabilities:
                comm_agents.append(agent)
        
        if comm_agents:
            try:
                summary_result = await comm_agents[0].execute({
                    "task_type": "report",
                    "title": f"Execution Summary: {context.goal[:50]}",
                    "data": {
                        "goal": context.goal,
                        "steps_completed": len(context.step_results),
                        "steps_failed": len(context.failed_steps),
                        "modifications": len(context.modifications),
                        "tools_created": context.created_tools,
                        "agents_involved": list(set([m.from_agent for m in context.messages if hasattr(m, 'from_agent')])),
                        "step_results": {str(k): str(v)[:100] for k, v in context.step_results.items()}
                    },
                    "format": "markdown"
                }, context)
                
                if summary_result.get("success"):
                    return summary_result.get("report", "")
            except Exception as e:
                logger.warning(f"Summary generation failed: {e}")
        
        # Fallback summary
        return self._generate_fallback_summary(context, result)
    
    def _generate_fallback_summary(self, context: TaskContext, result: Dict) -> str:
        """Generate a simple fallback summary"""
        success_count = len(context.step_results)
        fail_count = len(context.failed_steps)
        total = success_count + fail_count
        
        summary = f"""
## Execution Summary

**Goal:** {context.goal}

**Status:** {'✅ Success' if result.get('success') else '❌ Failed'}

**Steps:**
- Total: {total}
- Completed: {success_count}
- Failed: {fail_count}
- Modified: {len(context.modifications)}

**Tools Created:** {len(context.created_tools)}

**Agents Involved:** {len(set([m.from_agent for m in context.messages if hasattr(m, 'from_agent')]))}

**Duration:** {result.get('metrics', {}).get('duration_seconds', 0):.2f} seconds
"""
        return summary
    
    async def _generate_failure_summary(self, context: TaskContext, error: Exception) -> str:
        """Generate failure summary"""
        return f"""
## Execution Failed

**Goal:** {context.goal}
**Error:** {str(error)}

**Steps Completed:** {len(context.step_results)}
**Failed Steps:** {len(context.failed_steps)}

**Failure Details:**
{json.dumps(context.failed_steps, indent=2) if context.failed_steps else 'No details available'}
        """
    
    async def _llm_plan(self, goal: str, context: TaskContext) -> Dict:
        """Fallback to LLM planning"""
        try:
            from axr_core.agents.planner.planner_agent import PlannerAgent
            planner = PlannerAgent(self.llm_client)
            # Convert TaskContext to ExecutionContext for planner
            exec_context = type('ExecutionContext', (), {
                'process_id': context.process_id,
                'goal': context.goal,
                'steps': context.steps,
                'step_results': context.step_results
            })()
            return await planner.create_plan(goal, exec_context)
        except Exception as e:
            logger.error(f"LLM planning failed: {e}")
            return {"steps": self._fallback_plan(goal)}
    
    def _fallback_plan(self, goal: str) -> List[Dict]:
        """Simple fallback plan when everything fails"""
        goal_lower = goal.lower()
        steps = []
        
        # Basic steps based on keywords
        if "code" in goal_lower or "generate" in goal_lower:
            steps.append({"tool": "code_generation", "priority": 1, "params": {}})
        
        if "scan" in goal_lower or "security" in goal_lower:
            steps.append({"tool": "security_scan", "priority": 2, "params": {}})
        
        if "report" in goal_lower or "summary" in goal_lower:
            steps.append({"tool": "report_generation", "priority": 3, "params": {}})
        
        if "email" in goal_lower or "send" in goal_lower:
            steps.append({"tool": "send_email", "priority": 4, "params": {}})
        
        if not steps:
            steps.append({"tool": "default_execution", "priority": 1, "params": {"goal": goal}})
        
        return steps
    
    # Process control methods
    async def pause_process(self, process_id: str) -> bool:
        """Pause a running process"""
        if process_id in self.active_processes:
            context = self.active_processes[process_id]
            context.add_to_memory("short_term", "paused_at", datetime.now())
            logger.info(f"⏸️ Process {process_id[:8]} paused")
            return True
        return False
    
    async def resume_process(self, process_id: str) -> bool:
        """Resume a paused process"""
        if process_id in self.active_processes:
            context = self.active_processes[process_id]
            # Remove pause marker
            if "paused_at" in context.short_term_memory:
                del context.short_term_memory["paused_at"]
            logger.info(f"▶️ Process {process_id[:8]} resumed")
            return True
        return False
    
    async def get_process_status(self, process_id: str) -> Optional[Dict]:
        """Get current status of a process"""
        if process_id in self.active_processes:
            context = self.active_processes[process_id]
            return {
                "process_id": process_id,
                "goal": context.goal,
                "status": "paused" if context.short_term_memory.get("paused_at") else "running",
                "progress": {
                    "completed": len(context.step_results),
                    "total": len(context.steps),
                    "failed": len(context.failed_steps),
                    "percentage": (len(context.step_results) / len(context.steps) * 100) if context.steps else 0
                },
                "current_step": len(context.step_results),
                "memory": {
                    "short_term": {k: str(v)[:50] for k, v in context.short_term_memory.items()},
                    "episodic_count": len(context.episodic_memory)
                },
                "tools_created": context.created_tools
            }
        return None