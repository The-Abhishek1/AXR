from axr_core.checkpointing.checkpoint_store import CheckpointStore
from axr_core.process_graph.models import StepStatus

class CheckpointManager:
    def __init__(self, memory_manager):
        self.store = CheckpointStore()
        self.memory_manager = memory_manager
        
    
    # -------------------------------------
    # Save checkpoint
    # -------------------------------------
    
    def save_checkpoint(self, process, steps):
        step_states = {
            step.step_id: step.status for step in steps
        }

        memory_snapshot = self.memory_manager.read_process_memory(process.pid)
        
        self.store.save(process.pid, step_states, memory_snapshot)
        
        print(f"[CHKPT] Saved checkpoint for PID= {process.pid}")
    
    # ----------------------------------------
    # Restore checkpoint
    # ----------------------------------------
    
    def restore_checkpoint(self, process, steps):
        data = self.store.load(process.pid)
        
        if not data:
            print(f"[CHKPT] No checkpoint found for PID= {process.pid}")
            return
        
        step_states = data["steps"]
        memory_snapshot = data["memory"]
        
        for step in steps:
            if step.step_id in step_states:
                step.status = step_states[step.step_id]
        
        # restore memory
        for step_id, output in memory_snapshot.items():
            self.memory_manager.write_output(process.pid, step_id, output)
        
        print(f"[CHKPT] Restored checkpoint for PID= {process.pid}")
        
