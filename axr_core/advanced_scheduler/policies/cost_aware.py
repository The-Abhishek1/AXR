"""Cost-aware scheduling policy"""

from typing import List, Dict, Any

from .base import SchedulingPolicy
from axr_core.process_manager.process import AIProcess
from axr_core.process_graph.models import ProcessStep

class CostAwareSchedulingPolicy(SchedulingPolicy):
    """Schedule to minimize cost while meeting constraints"""
    
    def __init__(self, budget_tracker=None):
        self.name = "cost_aware"
        self.budget_tracker = budget_tracker
        self._cost_per_step: Dict[str, float] = {
            "git.clone": 0.01,
            "build": 0.05,
            "test.run": 0.03,
            "sast.scan": 0.04,
            "lint": 0.02,
            "deploy.service": 0.10,
        }
    
    def score_process(self, process: AIProcess, context: Dict[str, Any]) -> float:
        # Balance between priority and remaining budget
        priority = getattr(process, 'priority', 1)
        budget_left = process.remaining_budget()
        
        # Higher priority and more budget left = higher score
        return priority * budget_left
    
    def score_step(self, process: AIProcess, step: ProcessStep, context: Dict[str, Any]) -> float:
        # Consider step cost
        step_cost = self._cost_per_step.get(step.syscall, 0.05)
        budget_left = process.remaining_budget()
        
        if step_cost > budget_left:
            return -1  # Can't afford this step
        
        # Score based on value/cost ratio
        value = step.priority * 10  # Higher priority = more value
        return value / step_cost
    
    def select_next_process(self, processes: List[AIProcess], context: Dict[str, Any]) -> AIProcess:
        if not processes:
            return None
        
        # Score and pick best
        scored = [(p, self.score_process(p, context)) for p in processes]
        scored.sort(key=lambda x: x[1], reverse=True)
        
        return scored[0][0] if scored else None
    
    def select_next_step(self, process: AIProcess, steps: List[ProcessStep], context: Dict[str, Any]) -> ProcessStep:
        if not steps:
            return None
        
        # Pick step with best value/cost ratio
        scored = [(s, self.score_step(process, s, context)) for s in steps]
        scored.sort(key=lambda x: x[1], reverse=True)
        
        return scored[0][0] if scored and scored[0][1] > 0 else None