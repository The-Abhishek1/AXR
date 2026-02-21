from typing import List
from axr_core.events.event import Event

class EventBus:
    """
    In-memory event bus for AXR runtime.
    """
    
    def __init__(self):
        self._events: List[Event] = []
    
    def publish(self, event: Event):
        self._events.append(event)
        print(f"[EVENT] {event.event_type} pid= {event.pid} step= {event.step_id}")
    
    def get_events(self) -> List[Event]:
        return self._events