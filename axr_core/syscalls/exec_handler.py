from axr_core.capabilities.issuer import CapabilityIssuer
from axr_core.security_module.evaluator import SecurityEvaluator
from axr_core.syscalls.base_handler import BaseHandler


class ExecHandler(BaseHandler):
    """
    AXR exec syscall:
    security → capability → tool execution
    """

    def __init__(self):
        super().__init__()
        self.security = SecurityEvaluator("policies/devsecops_safe.yaml")
        self.capability_issuer = CapabilityIssuer()

    def run(self, process, step, memory_manager=None):
        # Policy check
        if not self.security.allow(process, step):
            raise PermissionError("Policy denied")

        # ssue capability
        capability = self.capability_issuer.issue(
            pid=process.pid,
            step_id=step.step_id,
            syscall=step.syscall,
            budget_limit=process.remaining_budget(),
        )

        print(f"[CAP] Issued capability for {step.syscall}")

        # Execute via base handler
        return self.execute_tool(process, step, capability, memory_manager)