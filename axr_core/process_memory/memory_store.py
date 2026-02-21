from typing import Dict, Any
from uuid import UUID

class ProcessMemoryStore:
    """
    In-memory storage for process step outputs.
    Structure:
    {
        pid: {
            step_id: output_data
        }
    }
    """
    
    def __init__(self):
        self._store: Dict[UUID, Dict[UUID, Any]] = {}
        
    # -------------------------
    # Write
    # -------------------------
        
    def write(self, pid: UUID, step_id: UUID, data: Any):
        if pid not in self._store:
            self._store[pid] = {}
        
        self._store[pid][step_id] = data 
    
    # -------------------------
    # Read single step output
    # -------------------------
    
    def read(self, pid: UUID, step_id: UUID):
        return self._store.get(pid, {}).get(step_id)
        
    # -----------------------------------
    # Read all outputs for a  process
    # -----------------------------------
    
    def read_all(self, pid: UUID):
        return self._store.get(pid, {})