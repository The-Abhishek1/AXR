"""Deadline-aware scheduling policy"""

import time
from datetime import datetime
from typing import List, Dict, Any

from .base import SchedulingPolicy
from axr_core.process_manager.process import AIProcess
from axr_core.process_graph.models import ProcessStep

class DeadlineSchedulingPolicy(SchedulingPolicy):
    """Schedule based on deadlines (EDF - Earliest Deadline First)"""
    
    def __init__(self):
        self.name = "deadline"
    
    def score_process(self, process: AIProcess, context: Dict[str, Any]) -> float:
        # Get deadline (higher priority = closer deadline)
        deadline = getattr(process, 'deadline', None)
        
        if not deadline:
            return 0.0  # No deadline, lower priority
        
        # Calculate time until deadline (in seconds)
        now = datetime.now()
        if isinstance(deadline, str):
            deadline = datetime.fromisoformat(deadline)
        
        time_remaining = (deadline - now).total_seconds()
        
        if time_remaining <= 0:
            # Already past deadline - highest priority (urgent)
            return 1e9
        
        # Closer deadline = higher score
        return 1.0 / time_remaining
    
    def score_step(self, process: AIProcess, step: ProcessStep, context: Dict[str, Any]) -> float:
        # Steps inherit process deadline
        return self.score_process(process, context)
    
    def select_next_process(self, processes: List[AIProcess], context: Dict[str, Any]) -> AIProcess:
        if not processes:
            return None
        
        # Earliest deadline first
        def get_deadline(p):
            deadline = getattr(p, 'deadline', None)
            if not deadline:
                return datetime.max
            if isinstance(deadline, str):
                return datetime.fromisoformat(deadline)
            return deadline
        
        return min(processes, key=get_deadline)
    
    def select_next_step(self, process: AIProcess, steps: List[ProcessStep], context: Dict[str, Any]) -> ProcessStep:
        if not steps:
            return None
        
        # For deadline, just take first step (process already selected by deadline)
        return steps[0]