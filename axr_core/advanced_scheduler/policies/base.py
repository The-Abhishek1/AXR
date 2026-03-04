"""Base scheduling policy"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any
from uuid import UUID

from axr_core.process_manager.process import AIProcess
from axr_core.process_graph.models import ProcessStep

class SchedulingPolicy(ABC):
    """Base class for scheduling policies"""
    
    @abstractmethod
    def score_process(self, process: AIProcess, context: Dict[str, Any]) -> float:
        """Score a process for scheduling (higher is better)"""
        pass
    
    @abstractmethod
    def score_step(self, process: AIProcess, step: ProcessStep, context: Dict[str, Any]) -> float:
        """Score a step for scheduling (higher is better)"""
        pass
    
    @abstractmethod
    def select_next_process(self, processes: List[AIProcess], context: Dict[str, Any]) -> AIProcess:
        """Select next process to schedule"""
        pass
    
    @abstractmethod
    def select_next_step(self, process: AIProcess, steps: List[ProcessStep], context: Dict[str, Any]) -> ProcessStep:
        """Select next step to schedule for a process"""
        pass