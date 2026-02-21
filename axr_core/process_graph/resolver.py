from __future__ import annotations

from typing import Dict, List
from uuid import UUID

from .models import ProcessStep, StepStatus

class ProcessGraphResolver:
    """
    Determines runnable steps for a given process.
    Handles:
    - dependency satisfaction
    - failure propogation
    - parallel readiness
    """
    
    def __init__(self, steps: List[ProcessStep]):
        # Map step_id -> step for fast lookup
        self.steps: Dict[UUID, ProcessStep] = {step.step_id: step for step in steps}
        
        # ------------------------
        # Public API
        # ------------------------
        
    def resolve(self) -> List[ProcessStep]:
        """
        updates step states and returns list of READY steps.
        """
        runnable: List[ProcessStep] = []
        
        for step in self.steps.values():
            if step.status in {StepStatus.SUCCESS, StepStatus.RUNNING, StepStatus.SKIPPED}:
                continue
            
            if step.status == StepStatus.FAILED:
                self._propogate_failure(step)
                continue
            
            if self._dependencies_failed(step):
                self.skip()
                continue
            
            if self._dependencies_satisfied(step):
                if step.status == StepStatus.PENDING and self._dependencies_satisfied(step):
                    step.mark_ready()
                if step.status == StepStatus.READY:
                    runnable.append(step)
        
        return runnable
    
    # -------------------------
    # Dependecy checks
    # -------------------------
    
    def _dependencies_satisfied(self, step: ProcessStep) -> bool:
        """
        All dependencies must be SUCCESS.
        """
        if not step.depends_on:
            return True
        
        for dep_id in step.depends_on:
            dep_step = self.steps.get(dep_id)
            if not dep_step or dep_step.status != StepStatus.SUCCESS:
                return False
        
        return True
    
    def _dependencies_failed(self, step: ProcessStep) -> bool:
        """
        If any dependency FAILED or SKIPPED -> this step must be SKIPPED.
        """
        
        for dep_id in step.depends_on:
            dep_step = self.steps.get(dep_id)
            if dep_step and dep_step.status in {StepStatus.FAILED, StepStatus.SKIPPED}:
                return True
        
        return False
    
    # -----------------------------
    # Failure propogation
    # -----------------------------
    
    def _propogate_failure(self, failed_step: ProcessStep) -> None:
        """
        Mark downstream dependent steps as SKIPPED.
        """
        for step in self.steps.values():
            if failed_step.step_id in step.depends_on:
                if step.status not in {StepStatus.SUCCESS, StepStatus.FAILED, StepStatus.SKIPPED}:
                    step.skip()
                        
        