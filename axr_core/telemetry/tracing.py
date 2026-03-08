"""Distributed tracing setup for AXR"""

import os
import functools
import time
from typing import Callable, Optional, Dict, Any

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.trace import SpanKind, StatusCode
from opentelemetry.propagate import inject, extract
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

# Simple flag to enable/disable telemetry
ENABLED = os.getenv("OTEL_ENABLED", "false").lower() == "true"

# Global tracer
_tracer = None

def setup_telemetry(service_name: str = "axr-scheduler"):
    global _tracer

    if not ENABLED:
        print("🔍 Telemetry disabled")
        return None

    # Check if already initialized
    current_provider = trace.get_tracer_provider()
    if isinstance(current_provider, TracerProvider):
        _tracer = trace.get_tracer(service_name)
        print(f"🔍 Using existing tracer for {service_name}")
        return _tracer

    resource = Resource(attributes={
        SERVICE_NAME: service_name,
    })

    provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(provider)

    otlp_exporter = OTLPSpanExporter(
        endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317"),
        insecure=True
    )

    provider.add_span_processor(BatchSpanProcessor(otlp_exporter))

    _tracer = trace.get_tracer(service_name)

    print(f"🔍 OpenTelemetry initialized for {service_name}")
    return _tracer

def get_tracer(name: str):
    """Get a tracer"""
    return trace.get_tracer(name)

# ==================== DECORATORS ====================

def trace_step(func: Callable) -> Callable:
    """Trace step execution (sync) - FIXED argument order"""
    @functools.wraps(func)
    def wrapper(first_arg, second_arg, *args, **kwargs):
        # Determine which is which based on attributes
        if hasattr(first_arg, 'pid') and hasattr(first_arg, 'intent'):
            process = first_arg
            step = second_arg
        else:
            step = first_arg
            process = second_arg
        
        if not ENABLED or not _tracer:
            return func(first_arg, second_arg, *args, **kwargs)
        
        start_time = time.time()
        with _tracer.start_as_current_span(
            name=f"step.execute.{step.syscall}",
            kind=SpanKind.INTERNAL,
            attributes={
                "process.id": str(process.pid),
                "step.id": str(step.step_id),
                "step.syscall": step.syscall,
                "step.priority": step.priority,
                "process.intent": process.intent[:100] if process.intent else "",
            }
        ) as span:
            try:
                result = func(first_arg, second_arg, *args, **kwargs)
                duration = (time.time() - start_time) * 1000
                span.set_attribute("step.duration_ms", duration)
                span.set_status(StatusCode.OK)
                return result
            except Exception as e:
                span.record_exception(e)
                span.set_attribute("error.message", str(e))
                span.set_status(StatusCode.ERROR)
                raise
    return wrapper

def trace_async_step(func: Callable) -> Callable:
    """Trace async step execution (supports class methods)"""

    @functools.wraps(func)
    async def wrapper(*args, **kwargs):

        if not ENABLED or not _tracer:
            return await func(*args, **kwargs)

        # Detect arguments
        process = None
        step = None

        for arg in args:
            if hasattr(arg, "step_id") and hasattr(arg, "syscall"):
                step = arg
            elif hasattr(arg, "pid") and hasattr(arg, "intent"):
                process = arg

        # Fallback safety
        if not process or not step:
            return await func(*args, **kwargs)

        start_time = time.time()

        with _tracer.start_as_current_span(
            name=f"step.execute.{step.syscall}",
            kind=SpanKind.INTERNAL,
            attributes={
                "process.id": str(process.pid),
                "step.id": str(step.step_id),
                "step.syscall": step.syscall,
                "step.priority": step.priority,
                "process.intent": process.intent[:100] if process.intent else "",
            },
        ) as span:

            try:
                result = await func(*args, **kwargs)

                duration = (time.time() - start_time) * 1000
                span.set_attribute("step.duration_ms", duration)
                span.set_status(StatusCode.OK)

                return result

            except Exception as e:
                span.record_exception(e)
                span.set_attribute("error.message", str(e))
                span.set_status(StatusCode.ERROR)
                raise

    return wrapper

def trace_nats_message(func: Callable) -> Callable:
    """Trace NATS message handling"""
    @functools.wraps(func)
    async def wrapper(msg, *args, **kwargs):
        if not ENABLED or not _tracer:
            return await func(msg, *args, **kwargs)
        
        # Extract context from headers
        headers = getattr(msg, 'headers', {})
        ctx = TraceContextTextMapPropagator().extract(headers)
        
        subject = getattr(msg, 'subject', 'unknown')
        
        with _tracer.start_as_current_span(
            name=f"nats.{subject}",
            context=ctx,
            kind=SpanKind.CONSUMER,
            attributes={
                "messaging.system": "nats",
                "messaging.destination": subject,
                "messaging.message_id": getattr(msg, 'reply', ''),
            }
        ) as span:
            try:
                # Try to extract message data for attributes
                if hasattr(msg, 'data') and msg.data:
                    try:
                        import json
                        data = json.loads(msg.data.decode())
                        if 'step_id' in data:
                            span.set_attribute("step.id", str(data['step_id'])[:8])
                        if 'pid' in data:
                            span.set_attribute("process.id", str(data['pid'])[:8])
                        if 'status' in data:
                            span.set_attribute("message.status", data['status'])
                    except:
                        pass
                
                result = await func(msg, *args, **kwargs)
                span.set_status(StatusCode.OK)
                return result
            except Exception as e:
                span.record_exception(e)
                span.set_attribute("error.message", str(e))
                span.set_status(StatusCode.ERROR)
                raise
    return wrapper

def trace_agent_decision(agent_name: str):
    """Trace agent decision making"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            if not ENABLED or not _tracer:
                return func(*args, **kwargs)
            
            start_time = time.time()
            with _tracer.start_as_current_span(
                name="agent.decision",
                kind=SpanKind.INTERNAL,
                attributes={
                    "agent.name": agent_name,
                }
            ) as span:
                try:
                    result = func(*args, **kwargs)
                    duration = (time.time() - start_time) * 1000
                    span.set_attribute("decision.duration_ms", duration)
                    if isinstance(result, dict):
                        span.set_attribute("decision.steps", len(result.get('steps', [])))
                    span.set_status(StatusCode.OK)
                    return result
                except Exception as e:
                    span.record_exception(e)
                    span.set_attribute("error.message", str(e))
                    span.set_status(StatusCode.ERROR)
                    raise
        return wrapper
    return decorator

def trace_scheduler_cycle(func: Callable) -> Callable:
    """Trace scheduler cycle"""
    @functools.wraps(func)
    async def wrapper(self, *args, **kwargs):
        if not ENABLED or not _tracer:
            return await func(self, *args, **kwargs)
        
        start_time = time.time()
        with _tracer.start_as_current_span(
            name="scheduler.cycle",
            kind=SpanKind.INTERNAL,
            attributes={
                "global.active_steps": getattr(self, '_global_active_steps', 0),
                "processes.total": len(getattr(self, 'processes', {})),
            }
        ) as span:
            try:
                result = await func(self, *args, **kwargs)
                duration = (time.time() - start_time) * 1000
                span.set_attribute("cycle.duration_ms", duration)
                span.set_status(StatusCode.OK)
                return result
            except Exception as e:
                span.record_exception(e)
                span.set_attribute("error.message", str(e))
                span.set_status(StatusCode.ERROR)
                raise
    return wrapper

def trace_with_context(func: Callable) -> Callable:
    """Preserve trace context across async boundaries"""
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        if not ENABLED or not _tracer:
            return await func(*args, **kwargs)
        
        current_span = trace.get_current_span()
        ctx = trace.set_span_in_context(current_span)
        
        with _tracer.start_as_current_span(
            name=func.__name__,
            context=ctx,
            kind=SpanKind.INTERNAL
        ) as span:
            try:
                result = await func(*args, **kwargs)
                span.set_status(StatusCode.OK)
                return result
            except Exception as e:
                span.record_exception(e)
                span.set_attribute("error.message", str(e))
                span.set_status(StatusCode.ERROR)
                raise
    return wrapper

def inject_trace_headers(headers: dict = None) -> dict:
    """Inject trace context into headers"""
    if headers is None:
        headers = {}
    TraceContextTextMapPropagator().inject(headers)
    return headers

def extract_trace_from_headers(headers: dict):
    """Extract trace context from headers"""
    return TraceContextTextMapPropagator().extract(headers)