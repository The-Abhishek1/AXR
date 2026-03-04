import hashlib
import json
from datetime import datetime, timedelta
from uuid import uuid4
from typing import Optional

from axr_core.capabilities.models import Capability

class CapabilityIssuer:
    """Issues capability tokens for step execution"""
    
    def __init__(self, secret_key: str = "axr-secret", issuer_id: str = "axr-scheduler"):
        self.secret_key = secret_key
        self.issuer_id = issuer_id
    
    def issue(self, pid, step_id, syscall, budget_limit=10.0, ttl_seconds=60) -> Capability:
        """Issue a new capability token"""
        now = datetime.now()
        cap = Capability(
            cap_id=uuid4(),
            pid=pid,
            step_id=step_id,
            syscall=syscall,
            issued_at=now,
            expires_at=now + timedelta(seconds=ttl_seconds),
            budget_limit=budget_limit,
            signature="",  # Will be set below
            issuer=self.issuer_id,  # Add issuer field
        )
        
        # Generate signature
        cap.signature = self._sign(cap)
        return cap
    
    def _sign(self, cap: Capability) -> str:
        """Generate signature for a capability"""
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
        
        # Sort keys for consistent hashing
        raw = json.dumps(payload, sort_keys=True) + self.secret_key
        return hashlib.sha256(raw.encode()).hexdigest()