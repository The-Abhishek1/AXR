from dataclasses import dataclass, field
from datetime import datetime, timedelta
from uuid import UUID, uuid4

@dataclass
class Capability:
    """
    Kernel capability token for a single syscall execution.
    """
    
    cap_id: UUID = field(default_factory=uuid4)
    
    pid: UUID = None
    step_id: UUID = None
    syscall: str = ""
    
    issued_at: datetime = field(default_factory=datetime.utcnow)
    expires_at: datetime = field(default_factory=lambda: datetime.utcnow() + timedelta(minutes=5))
    
    budget_limit: float = 0.0
    
    signature: str = "" # filled by issuer
    