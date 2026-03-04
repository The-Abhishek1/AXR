"""Advanced scheduler with multiple policies"""

import time
import threading
from typing import Dict, List, Optional, Type
from uuid import UUID

from axr_core.process_manager.process import AIProcess
from axr_core.process_graph.models import ProcessStep, StepStatus

from .policies.base import SchedulingPolicy
from .policies.priority import PrioritySchedulingPolicy
from .policies.fair_share import FairShareSchedulingPolicy
from .policies.deadline import DeadlineSchedulingPolicy
from .policies.cost_aware import CostAwareSchedulingPolicy
from .quota.manager import QuotaManager

class AdvancedScheduler:
    """Scheduler with pluggable policies and quotas"""
    
    def __init__(self):
        self.policies: Dict[str, SchedulingPolicy] = {
            "priority": PrioritySchedulingPolicy(),
            "fair_share": FairShareSchedulingPolicy(),
            "deadline": DeadlineSchedulingPolicy(),
            "cost_aware": CostAwareSchedulingPolicy(),
        }
        self.active_policy = "priority"  # Default policy
        
        self.quota_manager = QuotaManager()
        self._lock = threading.RLock()
        
        print("[SCHEDULER] ✅ Advanced scheduler initialized")
    
    def set_policy(self, policy_name: str):
        """Change active scheduling policy"""
        if policy_name in self.policies:
            self.active_policy = policy_name
            print(f"[SCHEDULER] Switched to {policy_name} policy")
            return True
        return False
    
    def get_policy(self) -> SchedulingPolicy:
        """Get active policy"""
        return self.policies[self.active_policy]
    
    def select_next_process(self, processes: List[AIProcess], context: Dict = None) -> AIProcess:
        """Select next process using active policy"""
        if not processes:
            return None
        
        policy = self.get_policy()
        context = context or {}
        
        # Filter processes that can run (quota check)
        eligible = []
        for p in processes:
            if self.quota_manager.can_schedule_step(p.pid, 0):  # Just check limits
                eligible.append(p)
        
        if not eligible:
            return None
        
        return policy.select_next_process(eligible, context)
    
    def select_next_step(self, process: AIProcess, steps: List[ProcessStep], context: Dict = None) -> ProcessStep:
        """Select next step using active policy"""
        if not steps:
            return None
        
        policy = self.get_policy()
        context = context or {}
        
        # Filter steps that are READY
        ready = [s for s in steps if s.status == StepStatus.READY]
        if not ready:
            return None
        
        return policy.select_next_step(process, ready, context)
    
    def register_tenant(self, tenant_id: str, quota=None, priority=1):
        """Register a tenant with quota"""
        self.quota_manager.register_tenant(tenant_id, quota, priority)
    
    def allocate_process(self, process_id: UUID, tenant_id: str, quota=None) -> bool:
        """Allocate quota for a process"""
        return self.quota_manager.allocate_process(process_id, tenant_id, quota)
    
    def record_step_start(self, process_id: UUID):
        """Record step start for quota tracking"""
        self.quota_manager.record_step_start(process_id)
    
    def record_step_complete(self, process_id: UUID, duration: float, cost: float):
        """Record step completion for quota tracking"""
        self.quota_manager.record_step_complete(process_id, duration, cost)
        
        # Update fair share tracking if active
        if self.active_policy == "fair_share":
            process = None  # You'd need to get the process here
            if process:
                self.policies["fair_share"].record_execution(process, duration)
    
    def get_stats(self) -> Dict:
        """Get scheduler statistics"""
        return {
            "active_policy": self.active_policy,
            "available_policies": list(self.policies.keys()),
            "quotas": {
                "tenants": len(self.quota_manager._tenant_quotas),
                "active_processes": len(self.quota_manager._process_usage),
            }
        }