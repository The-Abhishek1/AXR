from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

@dataclass
class Capability:
    """Capability token for step execution"""
    cap_id: UUID
    pid: UUID
    step_id: UUID
    syscall: str
    issued_at: datetime
    expires_at: datetime
    budget_limit: float
    signature: str
    issuer: str = "axr-scheduler"  # Add this field with default