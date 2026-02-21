from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Any
from uuid import UUID

@dataclass
class Event:
    event_type: str
    pid: UUID
    step_id: UUID | None = None
    timestamp: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory= dict)