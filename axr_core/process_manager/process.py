from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

class ProcessState(str, Enum):
    READY = "READY"
    RUNNING = "RUNNING"
    BLOCKED = "BLOCKED"
    TERMINATED = "TERMINATED"
    FAILED = "FAILED"
    PAUSED = "PAUSED"
    ROLLBACK_PENDING = "ROLLBACK_PENDING"
    ROLLBACK_RUNNING = "ROLLBACK_RUNNING"
    
@dataclass
class AIProcess:
    """
    AXR Kernel: AI Process Control Block(PCB)
    
    Represents a running AI job inside AXR.
    """
    intent: str
    budget_limit: float
    
    pid: UUID = field(default_factory=uuid4)
    state: ProcessState = ProcessState.READY
    
    budget_used: float = 0.0
    
    created_at: datetime = field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    terminated_at: Optional[datetime] = None
    
    # Scheduling metadata
    priority: int = 5
    last_scheduled_at: Optional[datetime] = None
    
    # Execution metadata
    current_step_id: Optional[UUID] = None
    error_message: Optional[str] = None
    
    completed_at = None
    # -----------------------------------
    # Kernel lifecycle operations
    # -----------------------------------
    
    def start(self) -> None:
        if self.state != ProcessState.READY:
            raise RuntimeError("Process can only start from READY state")
        
        self.state = ProcessState.RUNNING
        self.started_at = datetime.utcnow()
        
    def block(self) -> None:
        if self.state != ProcessState.RUNNING:
            raise RuntimeError("Only RUNNING process can be BLOCKED")
        
        self.state = ProcessState.BLOCKED
        
    def unblock(self) -> None:
        if self.state != ProcessState.BLOCKED:
            raise RuntimeError("Only BLOCKED process can be unblocked")
    
        self.state = ProcessState.READY
        
    def terminate(self) -> None:
        self.state = ProcessState.TERMINATED
        self.terminated_at = datetime.utcnow()
        self.completed_at = datetime.utcnow()
        
    def fail(self, message: str) -> None:
        self.state = ProcessState.FAILED
        self.error_message = message
        self.terminated_at = datetime.utcnow()
        
    def pause(self):
        self.state = ProcessState.PAUSED
    
    def resume(self):
        self.state = ProcessState.RUNNING
    
    # --------------------------------
    # Resource management
    # --------------------------------
    
    def charge_budget(self, amount: float) -> None:
        if amount < 0:
            raise ValueError("Budget charge cannot be negative")

        if self.budget_used + amount > self.budget_limit:
            raise RuntimeError("Budget limit exceeded")

        self.budget_used += amount
            
    def remaining_budget(self) -> float:
        return self.budget_limit - self.budget_used
    
    # -----------------------------------
    # Scheduling helpers
    # -----------------------------------
    
    def mark_scheduled(self) -> None:
        self.last_scheduled_at = datetime.utcnow()
    
    def is_active(self) -> bool:
        return self.state in {
            ProcessState.READY,
            ProcessState.RUNNING,
            ProcessState.BLOCKED,
        }

        