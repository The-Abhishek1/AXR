import hashlib
import json
from datetime import datetime
from typing import Set, Optional

from axr_core.capabilities.models import Capability
from axr_core.process_manager.process import AIProcess
from axr_core.process_graph.models import ProcessStep

class CapabilityValidator:
    """
    Validates capability tokens before syscall execution.
    """
    
    def __init__(self, secret_key: str = "axr-secret", max_age_seconds: int = 3600):
        self.secret_key = secret_key
        self._max_capability_age_seconds = max_age_seconds
        self._used_capabilities: Set[str] = set()
        self._trusted_issuers = ["axr-scheduler"]  # Add trusted issuers
    
    def validate(self, cap: Capability) -> bool:
        """
        Basic signature validation
        """
        # Recreate the expected signature
        expected = self._sign(cap)
        return expected == cap.signature
    
    def validate_strict(self, cap: Capability, process: AIProcess, step: ProcessStep) -> bool:
        """
        Strict capability validation with all checks
        """
        # Check 1: Basic signature validation
        if not self.validate(cap):
            print(f"[CAP] Invalid signature for {str(cap.cap_id)[:8]}")
            return False
        
        # Check 2: Expiration
        now = datetime.now()
        if now > cap.expires_at:
            print(f"[CAP] Capability expired at {cap.expires_at}")
            return False
        
        # Check 3: Not too old
        age = (now - cap.issued_at).total_seconds()
        if age > self._max_capability_age_seconds:
            print(f"[CAP] Capability too old: {age}s > {self._max_capability_age_seconds}s")
            return False
        
        # Check 4: Process match
        if cap.pid != process.pid:
            print(f"[CAP] Process mismatch: {str(cap.pid)[:8]} vs {str(process.pid)[:8]}")
            return False
        
        # Check 5: Step match
        if cap.step_id != step.step_id:
            print(f"[CAP] Step mismatch: {str(cap.step_id)[:8]} vs {str(step.step_id)[:8]}")
            return False
        
        # Check 6: Syscall match
        if cap.syscall != step.syscall:
            print(f"[CAP] Syscall mismatch: {cap.syscall} vs {step.syscall}")
            return False
        
        # Check 7: Budget validation
        if cap.budget_limit < step.cost_estimate:
            print(f"[CAP] Insufficient budget: {cap.budget_limit} < {step.cost_estimate}")
            return False
        
        # Check 8: Issuer validation
        if not self._validate_issuer(cap):
            return False
        
        # Check 9: Replay prevention
        if str(cap.cap_id) in self._used_capabilities:
            print(f"[CAP] Capability already used (replay attack): {str(cap.cap_id)[:8]}")
            return False
        
        # Mark as used
        self._used_capabilities.add(str(cap.cap_id))
        
        # Clean up old capability IDs periodically
        if len(self._used_capabilities) > 10000:
            self._used_capabilities.clear()
        
        print(f"[CAP] ✅ All validations passed for {str(cap.cap_id)[:8]}")
        return True
    
    def _validate_issuer(self, cap: Capability) -> bool:
        """Validate the capability issuer is trusted"""
        issuer = getattr(cap, 'issuer', None)
        if not issuer:
            print(f"[CAP] No issuer information")
            return False
        
        if issuer not in self._trusted_issuers:
            print(f"[CAP] Untrusted issuer: {issuer}")
            return False
        
        return True
    
    def _sign(self, cap: Capability) -> str:
        """Generate signature for a capability (mirrors issuer)"""
        payload = {
            "cap_id": str(cap.cap_id),
            "pid": str(cap.pid),
            "step_id": str(cap.step_id),
            "syscall": cap.syscall,
            "issued_at": cap.issued_at.isoformat(),
            "expires_at": cap.expires_at.isoformat(),
            "budget_limit": cap.budget_limit,
            "issuer": getattr(cap, 'issuer', 'axr-scheduler'),
        }
        
        raw = json.dumps(payload, sort_keys=True) + self.secret_key
        return hashlib.sha256(raw.encode()).hexdigest()