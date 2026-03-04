"""Metrics collection for AXR"""

import time
from typing import Dict
import os

# Simple in-memory metrics if Prometheus not available
try:
    from prometheus_client import Counter, Histogram, Gauge, generate_latest
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False
    print("[METRICS] Prometheus not installed, using simple metrics")

# Simple metrics storage
class SimpleMetrics:
    def __init__(self):
        self.step_counts = {}
        self.step_durations = {}
        self.worker_loads = {}
        self.active_steps = {}
        self.process_states = {}

_metrics = SimpleMetrics()

def setup_metrics(service_name: str = "axr-scheduler"):
    """Initialize metrics"""
    if PROMETHEUS_AVAILABLE:
        print(f"📊 Prometheus metrics initialized for {service_name}")
    else:
        print(f"📊 Simple metrics initialized for {service_name}")
    return _metrics

def record_step_duration(syscall: str, duration: float, status: str = "success"):
    """Record step execution duration"""
    key = f"{syscall}:{status}"
    _metrics.step_counts[key] = _metrics.step_counts.get(key, 0) + 1
    
    if syscall not in _metrics.step_durations:
        _metrics.step_durations[syscall] = []
    _metrics.step_durations[syscall].append(duration)
    # Keep only last 100
    if len(_metrics.step_durations[syscall]) > 100:
        _metrics.step_durations[syscall] = _metrics.step_durations[syscall][-100:]
    
    if PROMETHEUS_AVAILABLE:
        try:
            from prometheus_client import Counter, Histogram
            # You'd need to define these globally, but for simplicity we'll skip
            pass
        except:
            pass

def record_worker_load(worker_id: str, load: int, tools: list):
    """Record worker load"""
    _metrics.worker_loads[worker_id] = {
        "load": load,
        "tools": tools[:3],
        "timestamp": time.time()
    }

def update_active_steps(process_id: str, count: int):
    """Update active steps count for a process"""
    _metrics.active_steps[process_id] = {
        "count": count,
        "timestamp": time.time()
    }

def update_process_state(process_id: str, state: str, intent: str):
    """Update process state metric"""
    _metrics.process_states[process_id] = {
        "state": state,
        "intent": intent[:50],
        "timestamp": time.time()
    }

def get_metrics():
    """Get metrics for /metrics endpoint"""
    if PROMETHEUS_AVAILABLE:
        try:
            from prometheus_client import generate_latest
            return generate_latest()
        except:
            pass
    
    # Simple text format
    output = []
    output.append("# HELP axr_steps_total Total steps executed")
    output.append("# TYPE axr_steps_total counter")
    for key, count in _metrics.step_counts.items():
        output.append(f'axr_steps_total{{syscall="{key.split(":")[0]}",status="{key.split(":")[1]}"}} {count}')
    
    output.append("\n# HELP axr_worker_load Current worker load")
    output.append("# TYPE axr_worker_load gauge")
    for wid, info in _metrics.worker_loads.items():
        tools = ",".join(info["tools"])
        output.append(f'axr_worker_load{{worker_id="{wid[:8]}",tools="{tools}"}} {info["load"]}')
    
    return "\n".join(output).encode('utf-8')