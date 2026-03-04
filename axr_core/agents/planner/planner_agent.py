# axr_core/agents/planner/planner_agent.py
import json
import logging
from typing import Dict, List, Optional, Any
from axr_core.agents.llm_client import LLMClient
from tool_registry.registry import tool_registry
from axr_core.telemetry.custom import trace_agent_decision

logger = logging.getLogger(__name__)

class PlannerAgent:
    """
    Planner agent that uses CodeLlama to create intelligent plans
    """
    
    # This is the key - teaching the LLM what format to use!
    SYSTEM_PROMPT = """You are an expert workflow planner for a distributed task execution system.

AVAILABLE TOOLS:
{tool_descriptions}

IMPORTANT RULES:
1. You must ONLY use tools from the available tools list above
2. You must return ONLY valid JSON in the exact format shown below
3. Steps with the SAME priority can run in PARALLEL
4. Steps with HIGHER priority numbers run AFTER lower priority steps
5. A step can only run after ALL its dependencies are complete

RESPONSE FORMAT - YOU MUST RETURN EXACTLY THIS STRUCTURE:
{
    "steps": [
        {
            "tool": "tool.name",  # Must be from available tools
            "priority": 1,        # Lower number = runs first
            "depends_on": []      # List of step indices (0-based) this step depends on
        }
    ]
}

EXAMPLES:

Example 1: "clone repo and scan it"
{
    "steps": [
        {"tool": "git.clone", "priority": 1, "depends_on": []},
        {"tool": "sast.scan", "priority": 2, "depends_on": [0]}
    ]
}

Example 2: "deploy after tests"
{
    "steps": [
        {"tool": "git.clone", "priority": 1, "depends_on": []},
        {"tool": "test.run", "priority": 2, "depends_on": [0]},
        {"tool": "deploy.service", "priority": 3, "depends_on": [1]}
    ]
}

Example 3: "security scan and lint in parallel, then deploy"
{
    "steps": [
        {"tool": "git.clone", "priority": 1, "depends_on": []},
        {"tool": "sast.scan", "priority": 2, "depends_on": [0]},
        {"tool": "lint", "priority": 2, "depends_on": [0]},
        {"tool": "deploy.service", "priority": 3, "depends_on": [1, 2]}
    ]
}

Remember: Return ONLY the JSON object, no explanations or markdown.
"""

    def __init__(self, llm_client: LLMClient):
        self.llm = llm_client

    
    @trace_agent_decision("planner")
    def create_plan(self, goal: str) -> Dict:
        """Create a plan using CodeLlama"""
        
        # Get tool descriptions
        tools = tool_registry.list_tools()
        tool_descriptions = "\n".join([
            f"- {t.name}: {t.description}" for t in tools
        ])
        
        # Fill in the system prompt with actual tools
        system_prompt = self.SYSTEM_PROMPT.replace("{tool_descriptions}", tool_descriptions)
        
        # Create the user prompt
        user_prompt = f"""User goal: {goal}

Create an optimized execution plan with proper dependencies.
Use only the available tools listed above.
Think about what steps are needed and their logical order.

Remember: Return ONLY the JSON object with steps array."""

        try:
            logger.info(f"🤖 Asking CodeLlama to plan: {goal}")
            logger.debug(f"System prompt: {system_prompt}")
            logger.debug(f"User prompt: {user_prompt}")
            
            plan = self.llm.generate_json(user_prompt, system_prompt)
            logger.info(f"✅ CodeLlama generated plan: {json.dumps(plan, indent=2)}")
            
            # Validate and fix the plan
            validated_plan = self._validate_plan(plan)
            return validated_plan
            
        except Exception as e:
            logger.error(f"❌ CodeLlama failed: {e}")
            import traceback
            traceback.print_exc()
            logger.info("📋 Using fallback plan")
            return self._fallback_plan(goal)

    def _validate_plan(self, plan: Dict) -> Dict:
        """Ensure plan has required structure and uses valid tools"""
        if "steps" not in plan:
            plan["steps"] = []
        
        # Get available tool names for validation
        available_tools = [t.name for t in tool_registry.list_tools()]
        
        valid_steps = []
        for i, step in enumerate(plan["steps"]):
            # Check if step has required fields
            if "tool" not in step:
                logger.warning(f"Step {i} missing 'tool', skipping")
                continue
            
            # Check if tool is available
            if step["tool"] not in available_tools:
                logger.warning(f"Tool '{step['tool']}' not available, using git.clone")
                step["tool"] = "git.clone"
            
            # Ensure priority exists
            if "priority" not in step:
                step["priority"] = 1
            
            # Ensure depends_on exists
            if "depends_on" not in step:
                step["depends_on"] = []
            
            # Validate dependencies are valid indices
            valid_deps = []
            for dep in step["depends_on"]:
                if isinstance(dep, int) and 0 <= dep < i:
                    valid_deps.append(dep)
                elif isinstance(dep, str) and dep.isdigit():
                    dep_int = int(dep)
                    if 0 <= dep_int < i:
                        valid_deps.append(dep_int)
            
            step["depends_on"] = valid_deps
            valid_steps.append(step)
        
        plan["steps"] = valid_steps
        return plan

    @trace_agent_decision("planner")
    def _fallback_plan(self, goal: str) -> Dict:
        """Simple fallback plan when LLM fails"""
        # Your existing fallback logic...
        goal_lower = goal.lower()
        steps = []
        
        # Clone step
        if any(word in goal_lower for word in ['clone', 'repo', 'git']):
            steps.append({"tool": "git.clone", "priority": 1, "depends_on": []})
            clone_idx = 0
        else:
            clone_idx = -1
            steps.append({"tool": "git.clone", "priority": 1, "depends_on": []})
            clone_idx = 0
        
        # Security scan
        if any(word in goal_lower for word in ['scan', 'security', 'sast']):
            deps = [clone_idx] if clone_idx >= 0 else []
            steps.append({"tool": "sast.scan", "priority": 2, "depends_on": deps})
            scan_idx = len(steps) - 1
        else:
            scan_idx = -1
        
        # Lint
        if any(word in goal_lower for word in ['lint', 'style']):
            deps = [clone_idx] if clone_idx >= 0 else []
            steps.append({"tool": "lint", "priority": 2, "depends_on": deps})
            lint_idx = len(steps) - 1
        else:
            lint_idx = -1
        
        # Build
        if any(word in goal_lower for word in ['build', 'compile']):
            deps = [clone_idx] if clone_idx >= 0 else []
            steps.append({"tool": "build", "priority": 2, "depends_on": deps})
            build_idx = len(steps) - 1
        else:
            build_idx = -1
        
        # Test
        if any(word in goal_lower for word in ['test']):
            deps = [build_idx] if build_idx >= 0 else ([clone_idx] if clone_idx >= 0 else [])
            steps.append({"tool": "test.run", "priority": 3, "depends_on": deps})
        
        # Deploy
        if any(word in goal_lower for word in ['deploy', 'staging', 'production']):
            deps = []
            if scan_idx >= 0:
                deps.append(scan_idx)
            if lint_idx >= 0:
                deps.append(lint_idx)
            if build_idx >= 0:
                deps.append(build_idx)
            steps.append({"tool": "deploy.service", "priority": 4, "depends_on": deps})
        
        return {"steps": steps}