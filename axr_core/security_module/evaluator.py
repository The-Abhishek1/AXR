from __future__ import annotations

import yaml
from pathlib import Path
from typing import Dict, Any

from axr_core.process_manager.process import AIProcess
from axr_core.process_graph.models import ProcessStep

class SecurityEvaluator:
    """
    AXR Security Module
    
    Enforces:
    - syscall allow/deny
    - budget limits
    """
    
    def __init__(self, policy_path: str):
        self.policy: Dict[str, Any] = self._load_policy(policy_path)
        
    
    # --------------------------------
    # Policy loading
    # --------------------------------
    
    def _load_policy(self, policy_path: str) -> Dict[str, Any]:
        path = Path(policy_path)
        if not path.exists():
            raise FileNotFoundError(f"Policy file not found: {policy_path}")
        
        with open(path, "r") as f:
            return yaml.safe_load(f)
    
    # --------------------------------
    # Main decision function
    # --------------------------------
    
    def allow(self, process: AIProcess, step: ProcessStep) -> bool:
        syscall = step.syscall
        
        denied = self.policy.get("denied_syscalls") or []
        if syscall in denied:
            return False

        allowed = self.policy.get("allowed_syscalls") or []
        if allowed and syscall not in allowed:
            return False
        
        # 3. Budget check
        max_budget = (
            self.policy.get("budget_limits", {}).get("max_per_process")
        )
        
        if max_budget is not None:
            if process.budget_used + step.cost_estimate > max_budget:
                return False
        
        return True
        