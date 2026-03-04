"""Custom instrumentation for AXR-specific operations"""

import functools
import time
from opentelemetry import trace

def trace_agent_decision(agent_name: str):
    """Trace agent decision making"""
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            tracer = trace.get_tracer(f"agent.{agent_name}")
            start_time = time.time()
            
            with tracer.start_as_current_span("agent.decision") as span:
                span.set_attribute("agent.name", agent_name)
                try:
                    result = func(*args, **kwargs)
                    duration = (time.time() - start_time) * 1000
                    span.set_attribute("decision.duration_ms", duration)
                    span.set_attribute("decision.outcome", str(result)[:100])
                    return result
                except Exception as e:
                    span.record_exception(e)
                    span.set_status(trace.Status(trace.StatusCode.ERROR, str(e)))
                    raise
        
        return wrapper
    return decorator

def trace_worker_execution(worker_id: str):
    """Trace worker execution"""
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            tracer = trace.get_tracer(f"worker.{worker_id[:8]}")
            start_time = time.time()
            
            with tracer.start_as_current_span("worker.execute") as span:
                span.set_attribute("worker.id", worker_id)
                try:
                    result = await func(*args, **kwargs)
                    duration = (time.time() - start_time) * 1000
                    span.set_attribute("execution.duration_ms", duration)
                    return result
                except Exception as e:
                    span.record_exception(e)
                    span.set_status(trace.Status(trace.StatusCode.ERROR, str(e)))
                    raise
        
        return wrapper
    return decorator