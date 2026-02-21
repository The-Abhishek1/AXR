from uuid import UUID
from typing import Any, Dict

from axr_core.process_memory.memory_store import ProcessMemoryStore

class ProcessMemoryManager:
    """
    Kernel interface for process memory operations.
    """
    
    def __init__(self):
        self.store = ProcessMemoryStore()
        
    # -----------------------------
    # Write output of a step
    # -----------------------------
        
    def write_output(self, pid: UUID, step_id: UUID, data: Any):
        self.store.write(pid, step_id, data)
        
    # ----------------------------------
    # Read output of a specific step
    # ----------------------------------
        
    def read_output(self, pid: UUID, step_id: UUID):
        return self.store.read(pid, step_id)
    
    
    # -----------------------------------------
    # Read all previous outputs
    # -----------------------------------------
    
    def read_process_memory(self, pid: UUID) -> Dict:
        return self.store.read_all(pid)