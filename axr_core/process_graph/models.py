from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4

class StepStatus(str, Enum):
    PENDING = "PENDING"
    READY = "READY"
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"
    ROLLED_BACK = "ROLLED_BACK"
    
@dataclass
class ProcessStep:
    """
    AXR Kernel: Process Step (unit of execution inside an AIProcess)
    """
    
    pid: UUID
    syscall: str
    cost_estimate: float = 0.0
    
    step_id: UUID = field(default_factory=uuid4)
    status: StepStatus = StepStatus.PENDING
    
    # Dependency management
    depends_on: List[UUID] = field(default_factory=list)
    
    # Rollback support
    rollback_syscall: Optional[str] = None
    
    # Runtime metadata
    retries: int = 0
    max_retries: int = 2
    last_error: Optional[str] = None
    backoff_seconds: int = 1
    failure_policy: str = "fail_process"
    # Options: fail_process | retry | skip
    
    # Input/Output references (for memory manager later)
    input_ref: Optional[str] = None
    output_ref: Optional[str] = None
    finalized: bool = False
    
    # -------------------------------
    # State transitions
    # -------------------------------
    
    def mark_ready(self) -> None:
        if self.status == StepStatus.PENDING:
            self.status = StepStatus.READY
            
    def start(self) -> None:
        if self.status not in {StepStatus.READY}:
            raise RuntimeError("Step must be READY to start")

        self.status = StepStatus.RUNNING
    
    def succeed(self) -> None:
        self.status = StepStatus.SUCCESS
    
    def fail(self, error: str) -> None:
        self.status = StepStatus.FAILED
        self.last_error = error
    
    def skip(self) -> None:
        self.status = StepStatus.SKIPPED
    
    def can_retry(self) -> bool:
        return self.retries < self.max_retries
    
    def record_retry(self) -> None:
        self.retries += 1
        self.status = StepStatus.PENDING
        