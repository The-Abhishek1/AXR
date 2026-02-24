import asyncio
import json

from nats.aio.client import Client as NATS 
from tool_registry.registry import ToolRegistry
from axr_core.distributed.message import result_message

registry = ToolRegistry()

async def main():
    nc = NATS()
    await nc.connect("nats://127.0.0.1:4222")
    
    async def handle_task(msg):
        data = json.loads(msg.data.decode())
        
        pid = data["pid"]
        step_id = data["step_id"]
        syscall = data["syscall"]
        
        print(f"[WORKER] Received {syscall}")
        
        try:
            tool = registry.get_tool(syscall)
            
            inputs = data.get("inputs", {})
            
            # minimal process context (tools expect process.pid)
            class WorkerProcess:
                def __init__(self, pid):
                    self.pid = pid
            
            process_ctx = WorkerProcess(pid)
                
            result = tool.execute(process_ctx, inputs, None)
            
            await nc.publish(
                "axr.results",
                result_message(pid, step_id, "success", output=result),
            )
            
            print(f"[WORKER] Completed {syscall}")
        
        except Exception as e:
            await nc.publish(
                "axr.results",
                result_message(pid, step_id, "failed", error=str(e)),
            )
            
            print(f"[WORKER] Failed {syscall}: {e}")
    
    await nc.subscribe("axr.tasks", cb=handle_task)
    
    print("Worker listening on axr.tasks")
    
    while True:
        await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(main())