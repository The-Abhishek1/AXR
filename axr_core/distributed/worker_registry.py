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
    
    
    def list_workers(self):
        return self._workers
    
    
    def list_workers_with_health(self):
        now = time.time()
        result = {}

        for wid, data in self._workers.items():
            last_seen = data["last_seen"]
            is_live = (now - last_seen) <= self.ttl

            result[wid] = {
                **data,
                "is_live": is_live,
                "latency_ms": int((now - last_seen) * 1000),
            }

        return result
    
    def heartbeat(self, worker_id: str):
        if worker_id in self._workers:
            self._workers[worker_id]["last_seen"] = time.time()

    
# Global singleton registry used across AXR
worker_registry = WorkerRegistry()