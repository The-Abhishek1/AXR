from typing import List

from tool_registry.registry import ToolRegistry
from axr_core.process_memory.memory_manager import ProcessMemoryManager
from axr_core.process_graph.models import ProcessStep, StepStatus

class TransactionManager:
    """
    Handles rollback of completed steps on process failure.
    """
    
    def __init__(self, memory_manager: ProcessMemoryManager):
        self.registry = ToolRegistry()
        self.memory_manager = memory_manager
    
    # ----------------------------
    # Rollback process
    # ----------------------------
    
    def rollback_process(self, process, steps: List[ProcessStep]):
        """
        Rollback all SUCCESS steps in reverse order.
        """
        
        print(f"[TXN] Starting rollback for PID= {process.pid}")
        
        successful_steps = [
            step for step in steps if step.status == StepStatus.SUCCESS
        ]
        
        # Reverse order for rollback
        
        for step in reversed(successful_steps):
            try:
                tool = self.registry.get_tool(step.syscall)
                
                print(f"\n[TXN] Rolling back {step.syscall}")
                
                tool.rollback(process, step, self.memory_manager)
                
                # Clean memory for that step
                self.memory_manager.write_output(process.pid, step.step_id, None)
            
            except Exception as e:
                print(f"[TXN-FAIL] Rollback failed for {step.syscall}: {e}")
            
        print(f"[TXN] Rollback complete for PID= {process.pid}")