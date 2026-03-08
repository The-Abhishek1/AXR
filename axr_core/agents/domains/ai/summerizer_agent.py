# axr_core/agents/domains/ai/summerizer_agent.py
from typing import Dict, List, Any, Optional
from axr_core.agents.base.agent import BaseAgent, TaskContext, TaskType

class SummarizerAgent(BaseAgent):
    name = "summarizer_agent"
    domain = "ai"
    task_types = [TaskType.REPORT]
    capabilities = ["text_summary", "text_analysis", "report_generation"]
    rating = 4.5
    cost_per_run = 0.001
    avg_latency = 80

    async def execute(self, task: Dict, context: TaskContext = None) -> Dict:
        """Execute summarization task"""
        text = task.get("text", "")
        max_length = task.get("max_length", 120)
        
        if len(text) > max_length:
            summary = text[:max_length] + "..."
        else:
            summary = text
        
        # Store in context memory if available
        if context:
            context.add_to_memory("short_term", "last_summary", {
                "input_length": len(text),
                "output_length": len(summary)
            })
        
        return {
            "success": True,
            "agent": self.name,
            "summary": summary,
            "original_length": len(text),
            "summary_length": len(summary)
        }
    
    async def can_handle(self, task_type: TaskType, context: TaskContext) -> float:
        """Return confidence score for handling tasks"""
        if task_type == TaskType.REPORT:
            return 0.9
        return 0.0