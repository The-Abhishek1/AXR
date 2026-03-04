import asyncio
import json
import uuid
import time
from datetime import datetime
from uuid import UUID

from nats.aio.client import Client as NATS 
from tool_registry.registry import ToolRegistry
from axr_core.distributed.message import result_message
from axr_core.capabilities.models import Capability


# registry = ToolRegistry()
worker_id = str(uuid.uuid4())
WORKER_CAPACITY = 10
# Use a mutable object for load tracking
worker_state = {"current_load": 0}
REGISTRATION_SENT = False

registry = ToolRegistry()


async def main():
    global worker_state, REGISTRATION_SENT
    nc = NATS()

    # Connect with proper error handling
    try:
        await nc.connect(
            "nats://127.0.0.1:4222", 
            max_reconnect_attempts=-1,
            name=f"worker-{worker_id[:8]}"
        )
        print(f"[WORKER {worker_id[:8]}] ✅ Connected to NATS")
    except Exception as e:
        print(f"[WORKER {worker_id[:8]}] ❌ Failed to connect to NATS: {e}")
        return

    async def handle_task(msg):
        worker_state["current_load"] += 1
        current = worker_state["current_load"]
        print(f"[WORKER {worker_id[:8]}] 📨 Received task on {msg.subject} (load: {current}/{WORKER_CAPACITY})")
        
        # Extract headers if present (for tracing)
        headers = getattr(msg, 'headers', {})
        if headers:
            print(f"[WORKER {worker_id[:8]}] Headers: {headers}")
        
        try:
            data = json.loads(msg.data.decode())
            
            cap_data = data.get("capability")
            cap = None
            pid = None
            step_id = None
            syscall = None

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

            print(f"[WORKER {worker_id[:8]}] ⚙️ Executing {syscall} for process {str(pid)[:8]}")

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
            start_time = time.time()
            result = tool.execute(process_ctx, data.get("inputs", {}), cap)
            duration = time.time() - start_time

            # Send success result
            await nc.publish(
                "axr.results",
                result_message(pid, step_id, "success", output=result, error=None, capability=cap),
            )

            print(f"[WORKER {worker_id[:8]}] ✅ Completed {syscall} in {duration:.2f}s")

        except Exception as e:
            print(f"[WORKER {worker_id[:8]}] ❌ Failed: {e}")
            
            # Send failure result
            if pid and step_id:
                await nc.publish(
                    "axr.results",
                    result_message(pid, step_id, "failed", output=None, error=str(e), capability=cap),
                )
        finally:
            worker_state["current_load"] -= 1

    # Subscribe to worker-specific topic
    await nc.subscribe(f"axr.tasks.{worker_id}", cb=handle_task)
    print(f"[WORKER {worker_id[:8]}] 📡 Subscribed to axr.tasks.{worker_id[:8]}")
    
    # Also subscribe to broadcast topic if needed
    await nc.subscribe("axr.tasks.broadcast", cb=handle_task)
    print(f"[WORKER {worker_id[:8]}] 📡 Subscribed to axr.tasks.broadcast")
    
    await nc.flush()

    # Get tools list
    tools = [tool.name for tool in registry.list_tools()]
    print(f"[WORKER {worker_id[:8]}] 🛠️ Loaded tools: {tools}")
    
    # Send initial registration heartbeat with tools (CRITICAL!)
    # This MUST be sent BEFORE starting the heartbeat loop
    reg_payload = {
        "worker_id": worker_id,
        "tools": tools,  # This MUST be included for registration
        "capacity": WORKER_CAPACITY,
        "load": worker_state["current_load"],
        "timestamp": time.time(),
    }
    await nc.publish(
        "axr.heartbeat",
        json.dumps(reg_payload).encode(),
    )
    print(f"[WORKER {worker_id[:8]}] 💓 Sent REGISTRATION heartbeat with {len(tools)} tools")
    REGISTRATION_SENT = True

    # Small delay to ensure registration is processed
    await asyncio.sleep(0.5)

    # Heartbeat loop - ALWAYS send full state (idempotent)
    async def send_heartbeat():
        while True:
            try:
                hb_payload = {
                    "worker_id": worker_id,
                    "tools": tools,  # ✅ ALWAYS include
                    "capacity": WORKER_CAPACITY,  # ✅ ALWAYS include
                    "load": worker_state["current_load"],
                    "timestamp": time.time(),
                }

                await nc.publish(
                    "axr.heartbeat",
                    json.dumps(hb_payload).encode(),
                )

                await asyncio.sleep(5)

            except Exception as e:
                print(f"[WORKER {worker_id[:8]}] ❤️ Heartbeat error: {e}")
                await asyncio.sleep(1)

    asyncio.create_task(send_heartbeat())

    print(f"[WORKER {worker_id[:8]}] 🚀 Ready and listening")

    # Keep running
    while True:
        await asyncio.sleep(1)
    
if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print(f"[WORKER {worker_id[:8]}] 👋 Shutting down")