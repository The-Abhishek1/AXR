# axr_core/events/event.py
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Any, Optional
from uuid import UUID
from enum import Enum

class EventType(Enum):
    """Standardized event types for the system"""
    # Process events
    PROCESS_REGISTERED = "process_registered"
    PROCESS_STARTED = "process_started"
    PROCESS_PAUSED = "process_paused"
    PROCESS_RESUMED = "process_resumed"
    PROCESS_CANCELLED = "process_cancelled"
    PROCESS_COMPLETED = "process_completed"
    PROCESS_FAILED = "process_failed"
    
    # Step events
    STEP_CREATED = "step_created"
    STEP_READY = "step_ready"
    STEP_DISPATCHED = "step_dispatched"
    STEP_STARTED = "step_started"
    STEP_SUCCEEDED = "step_succeeded"
    STEP_FAILED = "step_failed"
    STEP_RETRY_SCHEDULED = "step_retry_scheduled"
    STEP_SKIPPED = "step_skipped"
    STEP_PAUSED = "step_paused"
    STEP_RESUMED = "step_resumed"
    STEP_CANCELLED = "step_cancelled"
    STEP_ADDED = "step_added"
    STEP_REMOVED = "step_removed"
    STEP_DEAD = "step_dead"
    STEP_REQUED = "step_requed"
    DEPENDENCY_UPDATED = "dependency_updated"
    
    # Worker events
    WORKER_REGISTERED = "worker_registered"
    WORKER_HEARTBEAT = "worker_heartbeat"
    WORKER_OFFLINE = "worker_offline"
    WORKER_LEASE_EXPIRED = "worker_lease_expired"
    
    # Agent events
    AGENT_PLAN_CREATED = "agent_plan_created"
    AGENT_COLLABORATION = "agent_collaboration"
    AGENT_LEARNING = "agent_learning"
    
    # System events
    SYSTEM_STARTUP = "system_startup"
    SYSTEM_SHUTDOWN = "system_shutdown"
    QUOTA_EXCEEDED = "quota_exceeded"
    BUDGET_EXCEEDED = "budget_exceeded"

@dataclass
class Event:
    """Core event dataclass"""
    type: EventType  # Changed from event_type to type for consistency
    pid: UUID
    step_id: Optional[UUID] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        """Ensure type is EventType enum"""
        if isinstance(self.type, str):
            self.type = EventType(self.type)