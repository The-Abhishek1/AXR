import asyncio
import json
import uuid

from nats.aio.client import Client as NATS 
from tool_registry.registry import ToolRegistry
from axr_core.distributed.message import result_message

registry = ToolRegistry()

worker_id = str(uuid.uuid4())

async def main():
    nc = NATS()
    await nc.connect("nats://127.0.0.1:4222")

    print(f"[WORKER {worker_id}] connected")

    async def handle_task(msg):
        print(f"[WORKER {worker_id}] RAW MSG {msg.subject}")

        data = json.loads(msg.data.decode())

        pid = data["pid"]
        step_id = data["step_id"]
        syscall = data["syscall"]

        print(f"[WORKER {worker_id}] Received {syscall}")

        try:
            tool = registry.get_tool(syscall)

            class WorkerProcess:
                def __init__(self, pid):
                    self.pid = pid

            process_ctx = WorkerProcess(pid)

            result = tool.execute(process_ctx, data.get("inputs", {}), None)

            await nc.publish(
                "axr.results",
                result_message(pid, step_id, "success", output=result),
            )

            print(f"[WORKER {worker_id}] Completed {syscall}")

        except Exception as e:
            await nc.publish(
                "axr.results",
                result_message(pid, step_id, "failed", error=str(e)),
            )
            print(f"[WORKER {worker_id}] Failed {syscall}: {e}")

    # subscribe first
    await nc.subscribe(f"axr.tasks.{worker_id}", cb=handle_task)
    await nc.flush()

    print(f"[WORKER {worker_id}] subscribed to axr.tasks.{worker_id}")

    # heartbeat after subscribe
    async def send_heartbeat():
        WORKER_CAPACITY = 2
        while True:
            await nc.publish(
                "axr.heartbeat",
                json.dumps({
                    "worker_id": worker_id,
                    "tools": registry.list_tools(),
                    "capacity": WORKER_CAPACITY,
                }).encode(),
            )
            await asyncio.sleep(5)

    asyncio.create_task(send_heartbeat())

    print(f"[WORKER {worker_id}] listening")

    await asyncio.Event().wait()
    
    while True:
        await asyncio.sleep(1)
    
    
if __name__ == "__main__":
    asyncio.run(main())