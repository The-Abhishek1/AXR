# axr_core/events/event_bus.py
from typing import List, Optional, Dict, Callable
from uuid import UUID
from datetime import datetime

from axr_core.events.event import Event, EventType
from axr_core.events.event_adapter import adapt_event
import logging

logger = logging.getLogger(__name__)

class EventBus:
    """
    Event bus for AXR runtime with support for subscribers
    """
    
    def __init__(self, repo=None):
        self._events: List[Event] = []
        self.repo = repo
        self._subscribers: Dict[EventType, List[Callable]] = {}
    
    def publish(self, event: Event):  # Remove async
        """Publish an event to all subscribers (sync method)"""
        self._events.append(event)
        
        # Save to repo if available - this is sync
        if self.repo:
            try:
                adapted_event = adapt_event(event)
                self.repo.save_event(adapted_event)  # This is sync
            except Exception as e:
                logger.error(f"Failed to save event to repo: {e}")
        
        # Log event
        step_info = f" STEP={event.step_id}" if event.step_id else ""
        logger.info(f"[EVENT] {event.type.value} PID={event.pid}{step_info}")
        
        # Notify subscribers (sync)
        if event.type in self._subscribers:
            for callback in self._subscribers[event.type]:
                try:
                    callback(event)
                except Exception as e:
                    logger.error(f"Subscriber error for {event.type}: {e}")
                    
                    
    def subscribe(self, event_type: EventType, callback: Callable):
        """Subscribe to a specific event type"""
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(callback)
    
    def get_events(self, 
                   process_id: Optional[UUID] = None,
                   event_type: Optional[EventType] = None,
                   limit: int = 100) -> List[Event]:
        """Get events with filtering"""
        events = self._events
        
        if process_id:
            events = [e for e in events if e.pid == process_id]
        
        if event_type:
            events = [e for e in events if e.type == event_type]
        
        return events[-limit:]
    
    def get_process_events(self, process_id: UUID) -> List[Event]:
        """Get all events for a process"""
        return [e for e in self._events if e.pid == process_id]
    
    def clear_old_events(self, max_age_seconds: int = 3600):
        """Clear events older than max_age_seconds"""
        now = datetime.utcnow()
        self._events = [
            e for e in self._events 
            if (now - e.timestamp).total_seconds() < max_age_seconds
        ]