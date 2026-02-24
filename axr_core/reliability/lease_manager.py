import time
from typing import Dict, Tuple
from uuid import UUID


class LeaseManager:
    def __init__(self, timeout_seconds: int = 10):
        self.timeout = timeout_seconds

        # step_id → (pid, start_time)
        self._leases: Dict[UUID, Tuple[UUID, float]] = {}

    # 🔐 create lease when step dispatched
    def start_lease(self, pid: UUID, step_id: UUID):
        self._leases[step_id] = (pid, time.time())

    # ✅ clear lease when result received
    def complete_lease(self, step_id: UUID):
        if step_id in self._leases:
            del self._leases[step_id]

    # ⏱ find expired steps
    def get_expired(self):
        now = time.time()
        expired = []

        for step_id, (pid, start_time) in list(self._leases.items()):
            if now - start_time > self.timeout:
                expired.append((pid, step_id))

        return expired