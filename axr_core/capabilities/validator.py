import hashlib
import json
from datetime import datetime

from axr_core.capabilities.models import Capability

class CapabilityValidator:
    """
    Validates capability tokens before syscall execution.
    """
    
    def __init__(self, secret_key: str = "axr-secret"):
        self.secret_key = secret_key
        
    def validate(self, cap: Capability) -> bool:
        if datetime.utcnow() > cap.expires_at:
            return False
        
        expected_sig = self._sign(cap)
        
        return expected_sig == cap.signature
    
    def _sign(self, cap: Capability) -> str:
        payload = {
            "pid": str(cap.pid),
            "step_id": str(cap.step_id),
            "syscall": cap.syscall,
            "issued_at": cap.issued_at.isoformat(),
            "expires_at": cap.expires_at.isoformat(),
            "budget_limit": cap.budget_limit,
        }
        
        raw = json.dumps(payload, sort_keys=True) + self.secret_key
        return hashlib.sha256(raw.encode()).hexdigest()