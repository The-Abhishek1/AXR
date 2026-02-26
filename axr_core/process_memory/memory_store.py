from typing import Dict, Any
from uuid import UUID
from copy import deepcopy

class ProcessMemoryStore:
    def __init__(self):
        self._store: Dict[UUID, Dict[UUID, Any]] = {}

    def write(self, pid: UUID, step_id: UUID, data: Any):
        if pid not in self._store:
            self._store[pid] = {}

        self._store[pid][step_id] = data

    def read(self, pid: UUID, step_id: UUID):
        return self._store.get(pid, {}).get(step_id)

    def read_all(self, pid: UUID):
        return deepcopy(self._store.get(pid, {}))

    def clear_process(self, pid: UUID):
        self._store.pop(pid, None)