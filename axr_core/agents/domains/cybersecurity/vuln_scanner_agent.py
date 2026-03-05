from axr_core.agents.base.agent import BaseAgent


class VulnerabilityScannerAgent(BaseAgent):

    name = "vuln_scanner_agent"
    domain = "cybersecurity"

    capabilities = ["vulnerability_scan",
                    "security_audit"]

    rating = 4.8
    cost_per_run = 0.003
    avg_latency = 200

    async def execute(self, task, tool_router):

        target = task["target"]

        process = type("Process", (), {"pid": "AXR-001"})
        step = type("Step", (), {"params": {"target": target}})

        result = tool_router.execute(
            "dependency.check",
            process,
            step
        )

        return {
            "target": target,
            "scan_result": result
        }