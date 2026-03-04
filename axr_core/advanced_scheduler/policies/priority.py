"""Priority-based scheduling policy"""

from typing import List, Dict, Any
from uuid import UUID

from .base import SchedulingPolicy
from axr_core.process_manager.process import AIProcess
from axr_core.process_graph.models import ProcessStep

class PrioritySchedulingPolicy(SchedulingPolicy):
    """Schedule based on process/step priority"""
    
    def __init__(self):
        self.name = "priority"
    
    def score_process(self, process: AIProcess, context: Dict[str, Any]) -> float:
        # Higher priority = higher score
        return float(process.priority) if hasattr(process, 'priority') else 1.0
    
    def score_step(self, process: AIProcess, step: ProcessStep, context: Dict[str, Any]) -> float:
        # Lower priority number = higher priority
        return 1.0 / float(step.priority) if step.priority > 0 else 100.0
    
    def select_next_process(self, processes: List[AIProcess], context: Dict[str, Any]) -> AIProcess:
        if not processes:
            return None
        
        # Sort by priority (highest first)
        return max(processes, key=lambda p: self.score_process(p, context))
    
    def select_next_step(self, process: AIProcess, steps: List[ProcessStep], context: Dict[str, Any]) -> ProcessStep:
        if not steps:
            return None
        
        # Sort by priority (highest first)
        return max(steps, key=lambda s: self.score_step(process, s, context))