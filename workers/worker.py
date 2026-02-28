import asyncio
import json
import uuid
import time

from nats.aio.client import Client as NATS 
from tool_registry.registry import ToolRegistry
from axr_core.distributed.message import result_message
from axr_core.capabilities.models import Capability
from datetime import datetime
from uuid import UUID


registry = ToolRegistry()

worker_id = str(uuid.uuid4())

async def main():
    nc = NATS()
    
    # Connect with proper error handling
    try:
        await nc.connect("nats://127.0.0.1:4222", max_reconnect_attempts=-1)
        print(f"[WORKER {worker_id}] connected to NATS")
    except Exception as e:
        print(f"[WORKER {worker_id}] Failed to connect to NATS: {e}")
        return

    async def handle_task(msg):
        print(f"[WORKER {worker_id}] Received task on {msg.subject}")
        
        try:
            data = json.loads(msg.data.decode())
            
            cap_data = data.get("capability")
            cap = None

            if cap_data:
                cap = Capability(
                    cap_id=UUID(cap_data["cap_id"]),
                    pid=UUID(cap_data["pid"]),
                    step_id=UUID(cap_data["step_id"]),
                    syscall=cap_data["syscall"],
                    issued_at=datetime.fromisoformat(cap_data["issued_at"]),
                    expires_at=datetime.fromisoformat(cap_data["expires_at"]),
                    budget_limit=cap_data["budget_limit"],
                    signature=cap_data["signature"],
                )

            pid = UUID(data["pid"])
            step_id = UUID(data["step_id"])
            syscall = data["syscall"]

            print(f"[WORKER {worker_id}] Executing {syscall} for process {pid}")

            # Get the tool
            tool = registry.get_tool(syscall)
            if not tool:
                raise Exception(f"Tool {syscall} not found")

            # Create process context
            class WorkerProcess:
                def __init__(self, pid):
                    self.pid = pid

            process_ctx = WorkerProcess(pid)

            # Execute the tool
            result = tool.execute(process_ctx, data.get("inputs", {}), cap)

            # Send success result
            await nc.publish(
                "axr.results",
                result_message(pid, step_id, "success", output=result, error=None, capability=cap),
            )

            print(f"[WORKER {worker_id}] Completed {syscall} successfully")

        except Exception as e:
            print(f"[WORKER {worker_id}] Failed {syscall}: {e}")
            
            # Send failure result
            await nc.publish(
                "axr.results",
                result_message(pid, step_id, "failed", output=None, error=str(e), capability=cap),
            )

    # Subscribe to worker-specific topic
    await nc.subscribe(f"axr.tasks.{worker_id}", cb=handle_task)
    
    # Also subscribe to broadcast topic if needed
    await nc.subscribe("axr.tasks.broadcast", cb=handle_task)
    
    await nc.flush()
    print(f"[WORKER {worker_id}] subscribed to axr.tasks.{worker_id}")

    # Send initial heartbeat immediately
    tools = [tool.name for tool in registry.list_tools()]
    WORKER_CAPACITY = 10
    
    await nc.publish(
        "axr.heartbeat",
        json.dumps({
            "worker_id": worker_id,
            "tools": tools,
            "capacity": WORKER_CAPACITY,
            "timestamp": time.time(),
        }).encode(),
    )
    print(f"[WORKER {worker_id}] Sent initial heartbeat with tools: {tools}")

    # Heartbeat loop
    async def send_heartbeat():
        while True:
            try:
                await nc.publish(
                    "axr.heartbeat",
                    json.dumps({
                        "worker_id": worker_id,
                        "tools": tools,
                        "capacity": WORKER_CAPACITY,
                        "timestamp": time.time(),
                    }).encode(),
                )
                print(f"[WORKER {worker_id}] Heartbeat sent")
                await asyncio.sleep(5)
            except Exception as e:
                print(f"[WORKER {worker_id}] Heartbeat error: {e}")
                await asyncio.sleep(1)

    asyncio.create_task(send_heartbeat())

    print(f"[WORKER {worker_id}] Ready and listening")

    # Keep running
    while True:
        await asyncio.sleep(1)
    
if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print(f"[WORKER {worker_id}] Shutting down")