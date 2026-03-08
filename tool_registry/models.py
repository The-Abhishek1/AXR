# tool_registry/models.py
from typing import Callable, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Tool:
    """Tool model for the registry"""
    name: str
    description: str
    function: Callable
    category: str = "general"
    cost: float = 1.0
    timeout: int = 30
    version: str = "1.0.0"
    created_at: datetime = None
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now()
        if self.metadata is None:
            self.metadata = {}

@dataclass
class ToolMeta:
    """Metadata for tools"""
    name: str
    syscall: str
    description: str
    category: str = "general"
    cost: float = 1.0
    
@dataclass
class ToolExecution:
    """Record of tool execution"""
    tool_name: str
    process_id: str
    step_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str = "pending"
    result: Any = None
    error: Optional[str] = None
    duration_ms: Optional[float] = None