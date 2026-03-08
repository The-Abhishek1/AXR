# axr_core/events/event_adapter.py
"""
Event adapter for backward compatibility between old and new event systems
"""
from axr_core.events.event import Event as NewEvent, EventType
from typing import Union, Any
from uuid import UUID
from datetime import datetime

class LegacyEvent:
    """Wrapper to make new events look like old events"""
    
    def __init__(self, new_event: NewEvent):
        self._event = new_event
        self.event_type = new_event.type.value
        self.pid = new_event.pid
        self.step_id = new_event.step_id
        self.timestamp = new_event.timestamp
        self.metadata = new_event.metadata
    
    def __getattr__(self, name):
        return getattr(self._event, name)

def adapt_event(event: Union[Any, NewEvent]) -> Union[Any, LegacyEvent]:
    """
    Adapt event to the format expected by the repository
    Returns original if it's already in old format, wrapped if new format
    """
    if hasattr(event, 'type') and not hasattr(event, 'event_type'):
        return LegacyEvent(event)
    return event