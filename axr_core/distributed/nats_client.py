"""NATS client wrapper with header support"""

import asyncio
import nats
from nats.errors import ConnectionClosedError, TimeoutError, NoServersError
from typing import Optional, Dict, Any, Callable
import logging

logger = logging.getLogger(__name__)

class NATSClient:
    """NATS client wrapper with header support"""
    
    def __init__(self, servers: str = "nats://localhost:4222"):
        self.servers = servers
        self.nc = None
        self._connected = False
        self._subs = []
    
    async def connect(self, max_reconnect_attempts: int = -1) -> bool:
        """Connect to NATS server"""
        try:
            self.nc = await nats.connect(
                self.servers,
                max_reconnect_attempts=max_reconnect_attempts,
                reconnect_time_wait=2,
                name="axr-scheduler"
            )
            self._connected = True
            print("[NATS] ✅ Connected successfully")
            return True
        except Exception as e:
            print(f"[NATS] ❌ Connection failed: {e}")
            self._connected = False
            return False
    
    @property
    def is_connected(self) -> bool:
        """Check if NATS is connected"""
        return self._connected and self.nc is not None and self.nc.is_connected
    
    async def publish(self, subject: str, payload: bytes, headers: Dict[str, str] = None):
        """
        Publish message to subject with optional headers
        
        Args:
            subject: Subject to publish to
            payload: Message payload as bytes
            headers: Optional dictionary of headers
        """
        if not self.is_connected:
            raise ConnectionError("NATS not connected")
        
        try:
            # nats-py supports headers via the headers parameter
            await self.nc.publish(subject, payload, headers=headers)
        except Exception as e:
            print(f"[NATS] ❌ Publish failed: {e}")
            raise
    
    async def request(self, subject: str, payload: bytes, timeout: float = 5, headers: Dict[str, str] = None):
        """Send request and wait for response"""
        if not self.is_connected:
            raise ConnectionError("NATS not connected")
        
        try:
            msg = await self.nc.request(subject, payload, timeout=timeout, headers=headers)
            return msg
        except Exception as e:
            print(f"[NATS] ❌ Request failed: {e}")
            raise
    
    async def subscribe(self, subject: str, cb: Callable, queue: str = None):
        """
        Subscribe to subject
        
        Args:
            subject: Subject to subscribe to
            cb: Callback function that receives msg
            queue: Optional queue group for load balancing
        """
        if not self.is_connected:
            raise ConnectionError("NATS not connected")
        
        try:
            sub = await self.nc.subscribe(subject, queue=queue, cb=cb)
            self._subs.append(sub)
            print(f"[NATS] 📡 Subscribed to {subject}")
            return sub
        except Exception as e:
            print(f"[NATS] ❌ Subscribe failed: {e}")
            raise
    
    async def close(self):
        """Close NATS connection"""
        self._connected = False
        if self.nc:
            await self.nc.close()
            print("[NATS] 🔒 Connection closed")