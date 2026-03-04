"""Resource quota models"""

from dataclasses import dataclass
from typing import Dict, Optional
from datetime import datetime, timedelta
from uuid import UUID

@dataclass
class ResourceQuota:
    """Resource quota for a tenant/process"""
    # CPU limits
    cpu_cores: float = 1.0  # CPU cores (can be fractional)
    cpu_time_seconds: int = 3600  # Max CPU time per day
    
    # Memory limits
    memory_mb: int = 1024  # Max memory per process
    total_memory_mb: int = 8192  # Total memory across all processes
    
    # Disk limits
    disk_mb: int = 10240  # Max disk per process
    total_disk_mb: int = 102400  # Total disk across all processes
    
    # Network limits
    network_mbps: int = 100  # Network bandwidth
    data_transfer_mb: int = 10240  # Data transfer per day
    
    # Cost limits
    cost_per_hour: float = 10.0  # Budget in dollars per hour
    total_cost: float = 100.0  # Total budget
    
    # Process limits
    max_concurrent_steps: int = 10
    max_processes: int = 5
    
    # Time limits
    max_execution_time_seconds: int = 7200  # 2 hours
    deadline: Optional[datetime] = None
    
    
@dataclass
class ResourceUsage:
    """Current resource usage"""
    process_id: UUID
    cpu_cores_used: float = 0.0
    cpu_time_used_seconds: int = 0
    memory_mb_used: int = 0
    disk_mb_used: int = 0
    data_transfer_mb_used: int = 0
    cost_incurred: float = 0.0
    steps_completed: int = 0
    steps_running: int = 0
    started_at: datetime = None
    last_updated: datetime = None
    tenant_id: str = "default"

@dataclass
class TenantQuota:
    """Quota for a tenant (user/team/project)"""
    tenant_id: str
    quotas: Dict[str, ResourceQuota]  # per process type or global
    used: ResourceUsage
    priority: int = 1  # Higher number = higher priority
    created_at: datetime = None
    updated_at: datetime = None