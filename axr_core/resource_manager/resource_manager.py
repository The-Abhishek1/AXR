from typing import Dict
from uuid import UUID

from axr_core.resource_manager.resource_model import ProcessResources


class ResourceManager:
    """
    Controls scheduling admission based on:
    - per-process concurrency
    - budget limits
    """

    def __init__(self):
        self.process_limits: Dict[UUID, ProcessResources] = {}
        self.active_steps: Dict[UUID, int] = {}

    # ------------------------------
    # Register process limits
    # ------------------------------

    def register_process(self, pid: UUID, limits: ProcessResources):
        self.process_limits[pid] = limits
        self.active_steps[pid] = 0

    # ------------------------------
    # Admission control
    # ------------------------------

    def can_schedule(self, pid: UUID, step_cost: float, remaining_budget: float) -> bool:
        limits = self.process_limits.get(pid)

        if not limits:
            return True

        # concurrency check
        if self.active_steps.get(pid, 0) >= limits.max_concurrent_steps:
            return False

        # budget check
        if step_cost > remaining_budget:
            return False

        return True

    # ----------------------------------
    # Allocate slot
    # ----------------------------------

    def allocate(self, pid: UUID) -> bool:
        limits = self.process_limits.get(pid)

        if not limits:
            self.active_steps[pid] = self.active_steps.get(pid, 0) + 1
            return True

        if self.active_steps.get(pid, 0) >= limits.max_concurrent_steps:
            return False

        self.active_steps[pid] = self.active_steps.get(pid, 0) + 1
        return True

    # ----------------------------------
    # Release slot
    # ----------------------------------

    def release(self, pid: UUID):
        if self.active_steps.get(pid, 0) > 0:
            self.active_steps[pid] -= 1

    # ----------------------------------
    # Reset usage (FOR RESTORE / HEAL)
    # ----------------------------------

    def reset_usage(self, pid: UUID):
        """
        Force reset active slot usage for a process.
        Used during crash recovery / restore.
        """
        if pid in self.active_steps:
            self.active_steps[pid] = 0