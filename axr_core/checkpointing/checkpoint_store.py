from typing import Dict, Any
from uuid import UUID

class CheckpointStore:
    """
    Stores last known good state of a process.
    """
    
    def __init__(self):
        self._checkpoints: Dict[UUID, Dict[str, Any]] = {}
        
    def save(self, pid:  UUID, step_states, memory_snapshot):
        self._checkpoints[pid] = {
            "steps": step_states,
            "memory": memory_snapshot,
        }
    
    def load(self, pid: UUID):
        return self._checkpoints.get(pid)