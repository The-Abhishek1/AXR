from typing import List

from tool_registry.registry import ToolRegistry
from axr_core.process_memory.memory_manager import ProcessMemoryManager
from axr_core.process_graph.models import ProcessStep, StepStatus
from axr_core.events.event import Event
from axr_core.persistence.repository import PersistenceRepository

class TransactionManager:
    """
    Handles rollback of completed steps on process failure.
    """
    
    def __init__(self, memory_manager: ProcessMemoryManager, event_bus):
        self.registry = ToolRegistry()
        self.memory_manager = memory_manager
        self.event_bus = event_bus
        self.repo = PersistenceRepository()
    
    # ----------------------------
    # Rollback process
    # ----------------------------
    
    def rollback_process(self, process, steps: List[ProcessStep]):
        """
        Rollback all SUCCESS steps in reverse order.
        """
        
        print(f"\n[TXN] Starting rollback for PID= {process.pid}")
        
        successful_steps = [
            step for step in steps if step.status in { StepStatus.SUCCESS , StepStatus.RUNNING} 
        ]
        
        # Reverse order for rollback
        
        for step in reversed(successful_steps):
            try:
                tool = self.registry.get_tool(step.syscall)
                
                print(f"\n[TXN] Rolling back {step.syscall} STEP_ID: {step.step_id}")
                
                tool.rollback(process, step, self.memory_manager)
                
                step.status = StepStatus.ROLLED_BACK
                
                self.repo.save_step(step)
                
                self.event_bus.publish(
                    Event(
                        event_type="STEP_ROLLED_BACK",
                        pid=process.pid,
                        step_id=step.step_id,
                    )
                )
                
                # Clean memory for that step
                self.memory_manager.write_output(process.pid, step.step_id, None)
                print(f"[TXN] Rolling complete for {step.syscall} STEP_ID: {step.step_id}")
            
            except Exception as e:
                print(f"\n[TXN-FAIL] Rollback failed for {step.syscall}: {e}\n")
            
        print(f"\n[TXN] Rollback complete for PID= {process.pid}\n")