import time
from typing import Dict, List


class WorkerRegistry:
    def __init__(self, ttl_seconds: int = 10):
        self.ttl = ttl_seconds
        
        # worker_id -> {tools: [], last_seen: float}
        self._workers: Dict[str, Dict] = {}
        
    def register(self, worker_id: str, tools: List[str], capacity: int = 1):
        self._workers[worker_id] = {
            "tools": tools,
            "capacity": capacity,
            "last_seen": time.time(),
        }
    
    def get_live_workers(self):
        now = time.time()
        return{
            wid: data
            for wid, data in self._workers.items()
            if now - data["last_seen"] <= self.ttl
        }
    
    def get_workers_for_tool(self, tool: str):
        live = self.get_live_workers()
        
        return [
            wid for wid, data in live.items()
            if tool in data["tools"]
        ]