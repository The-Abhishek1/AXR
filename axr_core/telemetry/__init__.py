"""OpenTelemetry integration for AXR"""

from .tracing import (
    setup_telemetry, 
    get_tracer, 
    trace_step, 
    trace_async_step, 
    trace_nats_message, 
    ENABLED
)
from .metrics import (
    record_step_duration, 
    record_worker_load, 
    update_active_steps, 
    update_process_state,
    get_metrics,  # Add this export
    setup_metrics  # Add this if you need it
)
from .context import inject_context, extract_context

__all__ = [
    'setup_telemetry',
    'get_tracer',
    'trace_step',
    'trace_async_step',
    'trace_nats_message',
    'ENABLED',
    'record_step_duration',
    'record_worker_load',
    'update_active_steps',
    'update_process_state',
    'get_metrics',
    'setup_metrics',
    'inject_context',
    'extract_context'
]