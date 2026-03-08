# axr_core/security_module/evaluator.py

from __future__ import annotations

import yaml
from pathlib import Path
from typing import Dict, Any, List
import re

from axr_core.process_manager.process import AIProcess
from axr_core.process_graph.models import ProcessStep

class SecurityEvaluator:
    """
    AXR Security Module
    
    Enforces:
    - syscall allow/deny (with fuzzy matching)
    - budget limits
    """
    
    def __init__(self, policy_path: str):
        self.policy: Dict[str, Any] = self._load_policy(policy_path)
        
        # Pre-process patterns for faster matching
        self.allowed_patterns = self._compile_patterns(self.policy.get("allowed_syscalls", []))
        self.denied_patterns = self._compile_patterns(self.policy.get("denied_syscalls", []))
    
    # --------------------------------
    # Pattern compilation
    # --------------------------------
    
    def _compile_patterns(self, patterns: List[str]) -> List[re.Pattern]:
        """Compile string patterns to regex patterns for matching"""
        compiled = []
        for pattern in patterns:
            # Convert simple wildcards to regex
            if '*' in pattern:
                pattern = pattern.replace('*', '.*')
            # Add word boundaries for exact matching
            if not any(c in pattern for c in ['.', '*', '^', '$']):
                pattern = f"^{pattern}$"
            try:
                compiled.append(re.compile(pattern, re.IGNORECASE))
            except re.error:
                # If regex compilation fails, treat as literal string
                compiled.append(re.compile(f"^{re.escape(pattern)}$", re.IGNORECASE))
        return compiled
    
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
    # Matching functions
    # --------------------------------
    
    def _matches_patterns(self, syscall: str, patterns: List[re.Pattern]) -> bool:
        """Check if syscall matches any pattern"""
        for pattern in patterns:
            if pattern.search(syscall):
                return True
        return False
    
    def _fuzzy_match(self, syscall: str, allowed_list: List[str]) -> bool:
        """
        Fuzzy matching for syscall names
        Handles cases like:
        - "security_scan" matches "sast.scan"
        - "git_tool" matches "git.clone"
        - "send_email" matches "email.send"
        """
        syscall_lower = syscall.lower()
        
        # Direct match
        if syscall in allowed_list:
            return True
        
        # Check if any allowed tool is a substring
        for allowed in allowed_list:
            allowed_lower = allowed.lower()
            
            # Check if one contains the other
            if (allowed_lower in syscall_lower or 
                syscall_lower in allowed_lower or
                # Handle underscore vs dot differences
                allowed_lower.replace('.', '_') in syscall_lower or
                syscall_lower.replace('.', '_') in allowed_lower):
                return True
            
            # Check word similarity (simple version)
            allowed_parts = set(allowed_lower.replace('.', '_').split('_'))
            syscall_parts = set(syscall_lower.split('_'))
            
            # If they share significant parts
            if len(allowed_parts & syscall_parts) >= min(2, len(allowed_parts)):
                return True
        
        return False
    
    # --------------------------------
    # Main decision function
    # --------------------------------
    
    def allow(self, process: AIProcess, step: ProcessStep) -> bool:
        """Check if a step is allowed with fuzzy matching"""
        syscall = step.syscall
        
        # 1. Check denied list (exact + pattern)
        denied = self.policy.get("denied_syscalls") or []
        if self._matches_patterns(syscall, self.denied_patterns) or syscall in denied:
            print(f"[SECURITY] ❌ Denied: {syscall} (in deny list)")
            return False
        
        # 2. Check allowed list (with fuzzy matching)
        allowed = self.policy.get("allowed_syscalls") or []
        if allowed:
            # If allowed list exists, syscall must be in it
            if not (self._matches_patterns(syscall, self.allowed_patterns) or 
                    self._fuzzy_match(syscall, allowed)):
                print(f"[SECURITY] ❌ Denied: {syscall} (not in allow list)")
                return False
        
        # 3. Budget check
        max_budget = self.policy.get("budget_limits", {}).get("max_per_process")
        if max_budget is not None:
            if process.budget_used + step.cost_estimate > max_budget:
                print(f"[SECURITY] ❌ Denied: {syscall} (budget exceeded)")
                return False
        
        print(f"[SECURITY] ✅ Allowed: {syscall}")
        return True
    
    # --------------------------------
    # Helper methods
    # --------------------------------
    
    def get_allowed_tools(self) -> List[str]:
        """Get list of allowed tools (for UI)"""
        return self.policy.get("allowed_syscalls", [])
    
    def get_denied_tools(self) -> List[str]:
        """Get list of denied tools (for UI)"""
        return self.policy.get("denied_syscalls", [])
    
    def get_budget_limit(self) -> int:
        """Get max budget per process"""
        return self.policy.get("budget_limits", {}).get("max_per_process", 100)