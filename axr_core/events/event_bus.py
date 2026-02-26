from typing import List
from axr_core.events.event import Event

class EventBus:
    """
    In-memory event bus for AXR runtime.
    """
    
    def __init__(self, repo=None):
        self._events: List[Event] = []
        self.repo = repo
    
    def publish(self, event: Event):
        self._events.append(event)
        
        if self.repo:
            self.repo.save_event(event)
        
        print(f"[EVENT] {event.event_type} PID= {event.pid} STEP_ID= {event.step_id}")
    
    def get_events(self) -> List[Event]:
        return self._events