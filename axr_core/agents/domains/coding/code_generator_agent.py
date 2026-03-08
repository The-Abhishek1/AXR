# axr_core/agents/domains/coding/code_generator_agent.py
from typing import Dict, List, Any, Optional
import ast
import json
import logging

from axr_core.agents.base.agent import BaseAgent, TaskContext, TaskType, AgentMessage
from axr_core.tools.dynamic_tool_creator import dynamic_tool_creator
from axr_core.agents.llm_client import LLMClient

logger = logging.getLogger(__name__)

class CodeGeneratorAgent(BaseAgent):
    name = "code_generator_agent"
    domain = "coding"
    task_types = [TaskType.CODE_GENERATION, TaskType.TOOL_CREATION]
    capabilities = [
        "python_code_generation",
        "tool_creation",
        "code_optimization",
        "api_integration",
        "script_automation"
    ]
    rating = 4.7
    cost_per_run = 0.005
    avg_latency = 200
    
    def __init__(self, llm_client: LLMClient = None):
        super().__init__()
        self.llm = llm_client or LLMClient()
        self.generated_tools = []
    
    async def execute(self, task: Dict, context: TaskContext) -> Dict:
        """Execute code generation task"""
        task_type = TaskType(task.get("task_type", "code_generation"))
        
        if task_type == TaskType.TOOL_CREATION:
            return await self._create_tool(task, context)
        else:
            return await self._generate_code(task, context)
    
    async def collaborate(self, message: AgentMessage, context: TaskContext) -> Optional[Dict]:
        """Handle collaboration requests"""
        if message.message_type == "generate_code":
            return await self._generate_code(message.content, context)
        elif message.message_type == "create_tool":
            return await self._create_tool(message.content, context)
        elif message.message_type == "optimize_code":
            return await self._optimize_code(message.content, context)
        
        return await super().collaborate(message, context)
    
    async def _generate_code(self, task: Dict, context: TaskContext) -> Dict:
        """Generate code based on requirements"""
        requirements = task.get("requirements", "")
        language = task.get("language", "python")
        existing_code = task.get("existing_code", "")
        
        prompt = f"""Generate {language} code for the following requirements:
{requirements}

{f'Existing code to modify: {existing_code}' if existing_code else ''}

Requirements:
1. Include proper error handling
2. Add comprehensive comments
3. Follow best practices for {language}
4. Include docstrings
5. Make it production-ready

Return ONLY the code, no explanations."""
        
        try:
            code = self.llm.generate(prompt)
            
            # Validate syntax for Python
            if language == "python":
                try:
                    ast.parse(code)
                except SyntaxError as e:
                    return {
                        "success": False,
                        "error": f"Generated code has syntax error: {e}",
                        "code": code
                    }
            
            # Store in context memory
            context.add_to_memory("short_term", "generated_code", {
                "requirements": requirements,
                "code": code,
                "language": language
            })
            
            return {
                "success": True,
                "code": code,
                "language": language,
                "agent": self.name
            }
            
        except Exception as e:
            logger.error(f"Code generation failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _create_tool(self, task: Dict, context: TaskContext) -> Dict:
        """Create a new tool dynamically"""
        tool_name = task.get("tool_name", "")
        description = task.get("description", "")
        functionality = task.get("functionality", "")
        
        if not tool_name:
            # Generate tool name from description
            tool_name = description.lower().replace(" ", "_")[:30]
        
        # Generate tool code using LLM
        prompt = f"""Create a Python tool named '{tool_name}' that does:
{functionality}

Description: {description}

The tool should:
1. Be a single function named '{tool_name}'
2. Include proper error handling
3. Add comprehensive docstrings
4. Handle different input types
5. Return appropriate output

Return ONLY the Python code, no explanations."""

        try:
            code = self.llm.generate(prompt)
            
            # Request review from code review agent
            review_request = AgentMessage(
                from_agent=self.name,
                to_agent="code_review_agent",
                message_type="review_code",
                content={
                    "tool_name": tool_name,
                    "code": code,
                    "description": description
                }
            )
            
            # Find code review agent
            from axr_core.agents.registry.agent_registry import agent_registry
            review_agent = agent_registry.find_agent_for_task(TaskType.CODE_REVIEW)
            
            if review_agent:
                review_result = await review_agent.collaborate(review_request, context)
                
                if review_result and not review_result.get("approved", True):
                    # Fix issues based on review
                    code = await self._fix_code_from_review(code, review_result, context)
            
            # Create the tool
            result = await dynamic_tool_creator.create_tool(
                tool_name=tool_name,
                description=description,
                code=code,
                created_by=self.name,
                context=context
            )
            
            if result["success"]:
                self.generated_tools.append(tool_name)
                
                # Learn from this tool creation
                await self.learn_from_task({
                    "status": "success",
                    "tool_name": tool_name
                }, context)
            
            return result
            
        except Exception as e:
            logger.error(f"Tool creation failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _optimize_code(self, task: Dict, context: TaskContext) -> Dict:
        """Optimize existing code"""
        code = task.get("code", "")
        optimization_goal = task.get("goal", "performance")
        
        prompt = f"""Optimize this Python code for {optimization_goal}:
{code}

Focus on:
1. Performance improvements
2. Better error handling
3. Cleaner structure
4. Reduced complexity

Return ONLY the optimized code."""
        
        try:
            optimized = self.llm.generate(prompt)
            return {
                "success": True,
                "original_code": code,
                "optimized_code": optimized,
                "agent": self.name
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def _fix_code_from_review(self, code: str, review: Dict, context: TaskContext) -> str:
        """Fix code based on review feedback"""
        issues = review.get("issues", [])
        suggestions = review.get("suggestions", [])
        
        if not issues and not suggestions:
            return code
        
        prompt = f"""Fix this code based on review feedback:

Code:
{code}

Issues to fix:
{json.dumps(issues, indent=2)}

Suggestions:
{json.dumps(suggestions, indent=2)}

Return the fixed code only."""
        
        try:
            fixed = self.llm.generate(prompt)
            return fixed
        except:
            return code

class CodeReviewAgent(BaseAgent):
    name = "code_review_agent"
    domain = "coding"
    task_types = [TaskType.CODE_REVIEW]
    capabilities = [
        "code_review",
        "security_audit",
        "style_checking",
        "performance_analysis",
        "best_practices"
    ]
    rating = 4.6
    cost_per_run = 0.003
    avg_latency = 150
    
    def __init__(self, llm_client: LLMClient = None):
        super().__init__()
        self.llm = llm_client or LLMClient()
    
    async def execute(self, task: Dict, context: TaskContext) -> Dict:
        """Execute code review task"""
        code = task.get("code", "")
        review_type = task.get("review_type", "full")
        
        prompt = f"""Review this code thoroughly:

{code}

Check for:
1. Security vulnerabilities
2. Performance issues
3. Code style violations
4. Error handling
5. Best practices
6. Potential bugs

Provide a JSON response with:
{{
    "approved": true/false,
    "issues": [list of issues found],
    "suggestions": [list of improvements],
    "security_score": 0-100,
    "quality_score": 0-100,
    "critical_issues": [list of critical issues]
}}"""
        
        try:
            review = self.llm.generate_json(prompt)
            
            # Add to context memory
            context.add_to_memory("short_term", "code_review", review)
            
            return {
                **review,
                "agent": self.name
            }
            
        except Exception as e:
            return {
                "approved": False,
                "error": str(e),
                "agent": self.name
            }
    
    async def collaborate(self, message: AgentMessage, context: TaskContext) -> Optional[Dict]:
        """Handle review requests"""
        if message.message_type == "review_code":
            return await self.execute(message.content, context)
        
        return await super().collaborate(message, context)