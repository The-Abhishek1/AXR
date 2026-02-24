import json

def task_message(process, step, memory_inputs=None):
    return json.dumps(
        {
            "pid": str(process.pid),
            "step_id": str(step.step_id),
            "syscall": step.syscall,
            "cost": step.cost_estimate,
            "inputs": memory_inputs or {},
        }
    ).encode()
    
def result_message(pid, step_id, status, output=None, error=None):
    return json.dumps(
        {
            "pid": pid,
            "step_id": step_id,
            "status": status,
            "output": output,
            "error": error
        }
    ).encode()