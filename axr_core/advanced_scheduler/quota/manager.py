"""Resource quota manager"""

import time
import threading
from typing import Dict, Optional, List
from uuid import UUID
from datetime import datetime, timedelta
from collections import defaultdict

from .models import ResourceQuota, ResourceUsage, TenantQuota

class QuotaManager:
    """Manages resource quotas for processes and tenants"""
    
    def __init__(self):
        self._tenant_quotas: Dict[str, TenantQuota] = {}
        self._process_usage: Dict[UUID, ResourceUsage] = {}
        self._process_quotas: Dict[UUID, ResourceQuota] = {}
        self._lock = threading.RLock()
        
        # Default quotas
        self.default_quota = ResourceQuota()
        
        print("[QUOTA] ✅ Quota manager initialized")
    
    def register_tenant(self, tenant_id: str, quota: Optional[ResourceQuota] = None, priority: int = 1):
        """Register a tenant with quota"""
        with self._lock:
            if tenant_id in self._tenant_quotas:
                print(f"[QUOTA] Tenant {tenant_id} already registered")
                return
            
            self._tenant_quotas[tenant_id] = TenantQuota(
                tenant_id=tenant_id,
                quotas={"default": quota or self.default_quota},
                used=ResourceUsage(process_id=None),
                priority=priority,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            print(f"[QUOTA] Registered tenant {tenant_id} with priority {priority}")
    
    def allocate_process(self, process_id: UUID, tenant_id: str, quota: Optional[ResourceQuota] = None):
        """Allocate quota for a process"""
        with self._lock:
            # Get tenant quota
            tenant = self._tenant_quotas.get(tenant_id)
            if not tenant:
                print(f"[QUOTA] Tenant {tenant_id} not found, using default")
                tenant = TenantQuota(
                    tenant_id=tenant_id,
                    quotas={"default": self.default_quota},
                    used=ResourceUsage(process_id=None),
                    priority=1,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                self._tenant_quotas[tenant_id] = tenant
            
            # Check if tenant can run more processes
            tenant_quota = tenant.quotas.get("default", self.default_quota)
            if len([p for p in self._process_usage.values() if hasattr(p, 'tenant_id') and p.tenant_id == tenant_id]) >= tenant_quota.max_processes:
                print(f"[QUOTA] Tenant {tenant_id} reached max processes ({tenant_quota.max_processes})")
                return False
            
            # Create process usage
            self._process_usage[process_id] = ResourceUsage(
                process_id=process_id,
                started_at=datetime.now(),
                last_updated=datetime.now(),
                tenant_id=tenant_id
            )
            self._process_quotas[process_id] = quota or tenant_quota
            
            print(f"[QUOTA] Allocated quota for process {str(process_id)[:8]}")
            return True
    
    def can_schedule_step(self, process_id: UUID, step_cost: float) -> bool:
        """Check if step can be scheduled within quotas"""
        with self._lock:
            usage = self._process_usage.get(process_id)
            quota = self._process_quotas.get(process_id)
            
            if not usage or not quota:
                return True  # No quota restrictions
            
            # Check concurrent steps
            if usage.steps_running >= quota.max_concurrent_steps:
                print(f"[QUOTA] Process {str(process_id)[:8]} at max concurrent steps ({quota.max_concurrent_steps})")
                return False
            
            # Check cost
            if usage.cost_incurred + step_cost > quota.total_cost:
                print(f"[QUOTA] Process {str(process_id)[:8]} would exceed cost budget")
                return False
            
            # Check execution time
            elapsed = (datetime.now() - usage.started_at).total_seconds()
            if elapsed > quota.max_execution_time_seconds:
                print(f"[QUOTA] Process {str(process_id)[:8]} exceeded execution time")
                return False
            
            # Check deadline
            if quota.deadline and datetime.now() > quota.deadline:
                print(f"[QUOTA] Process {str(process_id)[:8]} missed deadline")
                return False
            
            return True
    
    def record_step_start(self, process_id: UUID):
        """Record step starting"""
        with self._lock:
            if process_id in self._process_usage:
                self._process_usage[process_id].steps_running += 1
                self._process_usage[process_id].last_updated = datetime.now()
    
    def record_step_complete(self, process_id: UUID, duration: float, cost: float):
        """Record step completion"""
        with self._lock:
            if process_id in self._process_usage:
                usage = self._process_usage[process_id]
                usage.steps_running -= 1
                usage.steps_completed += 1
                usage.cpu_time_used_seconds += duration
                usage.cost_incurred += cost
                usage.last_updated = datetime.now()
    
    def get_process_usage(self, process_id: UUID) -> Optional[ResourceUsage]:
        """Get usage for a process"""
        return self._process_usage.get(process_id)
    
    def get_tenant_usage(self, tenant_id: str) -> Dict:
        """Get aggregated usage for a tenant"""
        with self._lock:
            processes = [
                usage for pid, usage in self._process_usage.items()
                if hasattr(usage, 'tenant_id') and usage.tenant_id == tenant_id
            ]
            
            total = ResourceUsage(process_id=None)
            for p in processes:
                total.cpu_time_used_seconds += p.cpu_time_used_seconds
                total.memory_mb_used += p.memory_mb_used
                total.cost_incurred += p.cost_incurred
                total.steps_completed += p.steps_completed
            
            return {
                "tenant_id": tenant_id,
                "active_processes": len(processes),
                "total_cpu_time": total.cpu_time_used_seconds,
                "total_cost": total.cost_incurred,
                "total_steps": total.steps_completed,
                "processes": [str(pid) for pid in self._process_usage.keys()]
            }
    
    def release_process(self, process_id: UUID):
        """Release process quotas"""
        with self._lock:
            self._process_usage.pop(process_id, None)
            self._process_quotas.pop(process_id, None)
            print(f"[QUOTA] Released process {str(process_id)[:8]}")