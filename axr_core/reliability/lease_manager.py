import time
from typing import Dict, Tuple, List
from uuid import UUID


class LeaseManager:
    def __init__(self, timeout_seconds: int = 10):
        self.timeout = timeout_seconds

        # step_id → (pid, start_time)
        self._leases: Dict[UUID, Dict] = {}

    # create lease when step dispatched
    def start_lease(self, pid: UUID, step_id: UUID, worker_id: str):
        self._leases[step_id] = {
            "pid": pid,
            "worker_id": worker_id,
            "expires_at": time.time() + self.timeout
        }

    # clear lease when result received
    def complete_lease(self, step_id: UUID):
        self._leases.pop(step_id, None)

    # find expired steps
    def get_expired(self) -> List[tuple]:
        now = time.time()
        expired = []

        for step_id, lease in list(self._leases.items()):
            if lease["expires_at"] <= now:
                expired.append((lease["pid"], step_id))

        return expired
    
    
    def get_worker_load(self) -> Dict[str, int]:
        load = {}
        now = time.time()
        
        for lease in self._leases.values():
            if lease["expires_at"] > now:
                wid = lease["worker_id"]
                load[wid] = load.get(wid, 0) + 1
            
        return load