"""Worker registry for tracking worker availability and load"""

import time
import threading
from typing import Dict, List, Optional, Set
from collections import defaultdict

class WorkerRegistry:
    """Registry for tracking workers and their capabilities"""

    def __init__(self, ttl_seconds: int = 10):
        self.ttl = ttl_seconds
        self._workers: Dict[str, Dict] = {}
        self._lock = threading.RLock()

        # Fast lookup
        self._tools_to_workers: Dict[str, Set[str]] = defaultdict(set)


    def register(self, worker_id: str, tools: List[str], capacity: int = 1):
        """
        Sync full worker state (idempotent).
        Safe to call on every heartbeat.
        """

        with self._lock:
            is_new = worker_id not in self._workers

            # Normalize tool names
            tool_names = []
            for tool in tools:
                if isinstance(tool, dict):
                    tool_names.append(tool.get("name", str(tool)))
                elif hasattr(tool, "name"):
                    tool_names.append(tool.name)
                else:
                    tool_names.append(str(tool))

            tool_names = [
                t for t in tool_names
                if not t.startswith("<") and not t.endswith(">")
            ]

            # Remove old tool mappings if updating
            if not is_new:
                old_tools = self._workers[worker_id].get("tools", [])
                for old_tool in old_tools:
                    self._tools_to_workers[old_tool].discard(worker_id)

            # Upsert worker
            self._workers[worker_id] = {
                "tools": tool_names,
                "capacity": capacity,
                "running": self._workers.get(worker_id, {}).get("running", 0),
                "last_seen": time.time(),
            }

            # Add tool mappings
            for tool in tool_names:
                self._tools_to_workers[tool].add(worker_id)

            # Log only if new worker
            if is_new:
                print(
                    f"[WORKER-ONLINE] 🟢 {worker_id[:8]} "
                    f"tools={tool_names[:3]} capacity={capacity}"
                )
                
                
    def heartbeat(self, worker_id: str, load: Optional[int] = None):
        """
        Update worker liveness + load.
        """

        with self._lock:
            if worker_id not in self._workers:
                return  # silently ignore

            self._workers[worker_id]["last_seen"] = time.time()

            if load is not None:
                self._workers[worker_id]["running"] = load

    # ---- Everything below unchanged ----

    def get_live_workers(self) -> Dict[str, Dict]:
        now = time.time()
        with self._lock:
            return {
                wid: {
                    "capacity": data["capacity"],
                    "running": data.get("running", 0),
                    "tools": data["tools"],
                }
                for wid, data in self._workers.items()
                if data["tools"] and now - data["last_seen"] <= self.ttl
            }

    def get_workers_for_tool(self, tool: str) -> List[str]:
        with self._lock:
            now = time.time()
            return [
                wid
                for wid in self._tools_to_workers.get(tool, set())
                if wid in self._workers
                and now - self._workers[wid]["last_seen"] <= self.ttl
            ]

    def acquire_worker(self, tool: str) -> Optional[str]:
        with self._lock:
            now = time.time()
            eligible = []

            for wid in self._tools_to_workers.get(tool, set()):
                data = self._workers.get(wid)
                if not data:
                    continue
                if now - data["last_seen"] > self.ttl:
                    continue
                if data["running"] < data["capacity"]:
                    eligible.append((wid, data["running"]))

            if not eligible:
                return None

            eligible.sort(key=lambda x: x[1])
            worker_id = eligible[0][0]
            self._workers[worker_id]["running"] += 1
            return worker_id

    def release_worker(self, worker_id: str):
        with self._lock:
            if worker_id in self._workers:
                self._workers[worker_id]["running"] = max(
                    0, self._workers[worker_id]["running"] - 1
                )

    def get_worker_load(self, worker_id: str) -> int:
        with self._lock:
            return self._workers.get(worker_id, {}).get("running", 0)

    def get_all_loads(self) -> Dict[str, int]:
        with self._lock:
            return {
                wid: data["running"]
                for wid, data in self._workers.items()
                if data["tools"]
            }

    def list_workers(self) -> Dict:
        with self._lock:
            return self._workers.copy()

    def list_workers_with_health(self) -> Dict:
        now = time.time()
        with self._lock:
            return {
                wid: {
                    **data,
                    "is_live": now - data["last_seen"] <= self.ttl,
                    "latency_ms": int((now - data["last_seen"]) * 1000),
                }
                for wid, data in self._workers.items()
                if data["tools"]
            }

    def cleanup_invalid_workers(self):
        with self._lock:
            to_remove = [
                wid for wid, data in self._workers.items()
                if not data["tools"]
            ]
            for wid in to_remove:
                del self._workers[wid]

            if to_remove:
                print(f"[WORKER-CLEANUP] Removed {len(to_remove)} invalid workers")


# Singleton
_worker_registry = WorkerRegistry()
worker_registry = _worker_registry

__all__ = ["WorkerRegistry", "worker_registry"]