"""Fair share scheduling policy"""

import time
from typing import List, Dict, Any
from collections import defaultdict

from .base import SchedulingPolicy
from axr_core.process_manager.process import AIProcess
from axr_core.process_graph.models import ProcessStep

class FairShareSchedulingPolicy(SchedulingPolicy):
    """Ensure fair distribution of resources across tenants"""
    
    def __init__(self):
        self.name = "fair_share"
        self._process_execution_time: Dict[UUID, float] = defaultdict(float)
        self._tenant_execution_time: Dict[str, float] = defaultdict(float)
        self._tenant_slots: Dict[str, int] = defaultdict(int)
    
    def score_process(self, process: AIProcess, context: Dict[str, Any]) -> float:
        tenant_id = getattr(process, 'tenant_id', 'default')
        
        # Calculate fairness score (lower execution time = higher score)
        tenant_time = self._tenant_execution_time[tenant_id]
        process_time = self._process_execution_time[process.pid]
        
        # Aim for balance: processes with less CPU time get priority
        return 1.0 / (process_time + 1.0) * (1.0 / (tenant_time + 1.0))
    
    def score_step(self, process: AIProcess, step: ProcessStep, context: Dict[str, Any]) -> float:
        # Steps are scored the same as their process
        return self.score_process(process, context)
    
    def select_next_process(self, processes: List[AIProcess], context: Dict[str, Any]) -> AIProcess:
        if not processes:
            return None
        
        # Score each process
        scored = [(p, self.score_process(p, context)) for p in processes]
        scored.sort(key=lambda x: x[1], reverse=True)
        
        return scored[0][0] if scored else None
    
    def select_next_step(self, process: AIProcess, steps: List[ProcessStep], context: Dict[str, Any]) -> ProcessStep:
        if not steps:
            return None
        
        # For fair share, just take the first ready step
        # (priority is about process fairness, not step order)
        return steps[0]
    
    def record_execution(self, process: AIProcess, duration: float):
        """Record execution time for fairness calculation"""
        tenant_id = getattr(process, 'tenant_id', 'default')
        self._process_execution_time[process.pid] += duration
        self._tenant_execution_time[tenant_id] += duration