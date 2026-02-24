import asyncio
from nats.aio.client import Client as NATS

class NATSClient:
    def __init__(self, url="nats://127.0.0.1:4222"):
        self.url = url
        self.nc = NATS()
    
    async def connect(self):
        await self.nc.connect(self.url)
    
    async def publish(self, subject: str, payload: bytes):
        await self.nc.publish(subject, payload)
    
    async def subscribe(self, subject: str, cb):
        await self.nc.subscribe(subject, cb=cb)
        
        