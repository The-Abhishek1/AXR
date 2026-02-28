import time
from typing import Dict, List, Optional, Union
import threading


class WorkerRegistry:
    def __init__(self, ttl_seconds: int = 10):
        self.ttl = ttl_seconds
        
        # worker_id -> {tools: [], last_seen: float, capacity: int, running: int}
        self._workers: Dict[str, Dict] = {}
        self._lock = threading.RLock()
        
    def register(self, worker_id: str, tools: Union[List[str], List[dict]], capacity: int = 1):
        """
        Register a worker with its capabilities
        tools can be either list of strings or list of dicts with 'name' key
        """
        with self._lock:
            # Normalize tools to list of strings
            tool_names = []
            for tool in tools:
                if isinstance(tool, dict):
                    # If it's a dict, try to get 'name' or 'function' or convert to string
                    tool_names.append(tool.get("name", str(tool)))
                elif hasattr(tool, 'name'):
                    # If it's an object with a name attribute (like ToolMeta)
                    tool_names.append(tool.name)
                else:
                    # If it's already a string or something else
                    tool_names.append(str(tool))
            
            # Filter out any tool names that look like object references
            tool_names = [t for t in tool_names if not t.startswith('<') and not t.endswith('>')]
            
            if worker_id in self._workers:
                # Update existing worker
                self._workers[worker_id]["tools"] = tool_names
                self._workers[worker_id]["capacity"] = capacity
                self._workers[worker_id]["last_seen"] = time.time()
                # Preserve running count
            else:
                # New worker
                self._workers[worker_id] = {
                    "tools": tool_names,
                    "capacity": capacity,
                    "running": 0,
                    "last_seen": time.time(),
                }
            
            if tool_names:
                print(f"[WORKER-REG] Registered {worker_id} with tools: {tool_names}, capacity: {capacity}")
            else:
                print(f"[WORKER-REG-WARN] Registered {worker_id} with NO valid tools (original: {tools})")
    
    def get_live_workers(self):
        now = time.time()
        with self._lock:
            live = {}
            for wid, data in self._workers.items():
                if now - data["last_seen"] <= self.ttl:
                    # Only include workers with valid tools
                    if data["tools"]:
                        live[wid] = data.copy()
            return live
    
    def get_workers_for_tool(self, tool: str):
        """Get all workers that support a specific tool"""
        live = self.get_live_workers()
        
        result = []
        with self._lock:
            for wid, data in live.items():
                if tool in data["tools"]:
                    result.append(wid)
            
            if result:
                print(f"[WORKER-LOOKUP] Tool '{tool}' found on workers: {result}")
            return result
    
    def list_workers(self):
        with self._lock:
            return self._workers.copy()
    
    def list_workers_with_health(self):
        now = time.time()
        with self._lock:
            result = {}
            for wid, data in self._workers.items():
                last_seen = data["last_seen"]
                is_live = (now - last_seen) <= self.ttl
                
                # Only include workers with valid tools
                if data["tools"]:
                    result[wid] = {
                        **data,
                        "is_live": is_live,
                        "latency_ms": int((now - last_seen) * 1000),
                    }
            return result
    
    def heartbeat(self, worker_id: str):
        with self._lock:
            if worker_id in self._workers:
                self._workers[worker_id]["last_seen"] = time.time()
                print(f"[WORKER-HB] {worker_id} heartbeat")
    
    def acquire_worker(self, tool: str) -> Optional[str]:
        """
        Acquire a worker for a tool (increment running count).
        Returns worker_id or None if no worker available.
        """
        with self._lock:
            now = time.time()
            eligible = []
            
            for wid, data in self._workers.items():
                # Skip workers with no valid tools
                if not data["tools"]:
                    continue
                    
                # Check if worker is live
                if now - data["last_seen"] > self.ttl:
                    continue
                    
                # Check if worker supports the tool
                if tool in data["tools"]:
                    if data["running"] < data["capacity"]:
                        eligible.append((wid, data["running"]))
            
            if not eligible:
                return None
            
            # Sort by running count (least loaded first)
            eligible.sort(key=lambda x: x[1])
            worker_id = eligible[0][0]
            
            # Increment running count
            self._workers[worker_id]["running"] += 1
            return worker_id
    
    def release_worker(self, worker_id: str):
        """
        Release a worker (decrement running count).
        """
        with self._lock:
            if worker_id in self._workers:
                self._workers[worker_id]["running"] = max(
                    0, self._workers[worker_id]["running"] - 1
                )
    
    def get_worker_load(self, worker_id: str) -> int:
        """Get current load (running tasks) for a worker"""
        with self._lock:
            if worker_id in self._workers:
                return self._workers[worker_id]["running"]
            return 0
    
    def get_all_loads(self) -> Dict[str, int]:
        """Get loads for all workers"""
        with self._lock:
            return {
                wid: data["running"] 
                for wid, data in self._workers.items()
                if data["tools"]  # Only include workers with valid tools
            }
    
    def cleanup_invalid_workers(self):
        """Remove workers with no valid tools"""
        with self._lock:
            to_remove = [wid for wid, data in self._workers.items() if not data["tools"]]
            for wid in to_remove:
                del self._workers[wid]
            if to_remove:
                print(f"[WORKER-CLEANUP] Removed {len(to_remove)} invalid workers: {to_remove}")


# Create the singleton instance
_worker_registry = WorkerRegistry()

# Define what gets exported
__all__ = ['WorkerRegistry', 'worker_registry']

# This is the key - make sure worker_registry is defined at module level
worker_registry = _worker_registry