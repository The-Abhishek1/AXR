import json

def task_message(process, step, memory_inputs=None, capability= None):
    return json.dumps(
        {
            "pid": str(process.pid),
            "step_id": str(step.step_id),
            "syscall": step.syscall,
            "cost": step.cost_estimate,
            "inputs": memory_inputs or {},
            "capability": {
                "cap_id": str(capability.cap_id),
                "pid": str(capability.pid),
                "step_id": str(capability.step_id),
                "syscall": capability.syscall,
                "issued_at": capability.issued_at.isoformat(),
                "expires_at": capability.expires_at.isoformat(),
                "budget_limit": capability.budget_limit,
                "signature": capability.signature,
            } if capability else None,
        }
    ).encode()
    
def result_message(pid, step_id, status, output=None, error=None, capability=None):
    return json.dumps(
        {
            "pid": str(pid),
            "step_id": str(step_id),
            "status": status,
            "output": output,
            "error": error,
            "capability": {
                "cap_id": str(capability.cap_id),
                "pid": str(capability.pid),
                "step_id": str(capability.step_id),
                "syscall": capability.syscall,
                "issued_at": capability.issued_at.isoformat(),
                "expires_at": capability.expires_at.isoformat(),
                "budget_limit": capability.budget_limit,
                "signature": capability.signature,
            } if capability else None,
        }
    ).encode()