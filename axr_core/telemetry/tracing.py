"""Distributed tracing setup for AXR"""

import os
import functools
import time
from typing import Callable

from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import SERVICE_NAME, Resource
from opentelemetry.trace import SpanKind, StatusCode
from opentelemetry.propagate import inject, extract
import functools

# Simple flag to enable/disable telemetry
ENABLED = os.getenv("OTEL_ENABLED", "false").lower() == "true"

# Global tracer
_tracer = None

from opentelemetry.sdk.trace import TracerProvider

def setup_telemetry(service_name: str = "axr-scheduler"):
    global _tracer

    if not ENABLED:
        print("🔍 Telemetry disabled")
        return None

    # 🔥 Prevent override
    if isinstance(trace.get_tracer_provider(), TracerProvider):
        print("🔍 Tracer already initialized")
        _tracer = trace.get_tracer(service_name)
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

# ==================== SIMPLE DECORATORS ====================

def trace_step(func: Callable) -> Callable:
    """Simplest possible step tracer"""
    @functools.wraps(func)
    def wrapper(process, step, *args, **kwargs):
        # Execute the function
        result = func(process, step, *args, **kwargs)
        
        # Create a span if enabled
        if ENABLED and _tracer:
            try:
                with _tracer.start_as_current_span(
                    name=f"execute.{step.syscall}",
                    attributes={
                        "process.id": str(process.pid)[:8],
                        "step.id": str(step.step_id)[:8],
                        "step.syscall": step.syscall,
                    }
                ):
                    # Just creating the span, no need to do anything else
                    pass
            except Exception:
                pass
        
        return result
    return wrapper

def trace_async_step(func: Callable) -> Callable:
    """Simplest possible async step tracer"""
    @functools.wraps(func)
    async def wrapper(process, step, *args, **kwargs):
        # Execute the function
        result = await func(process, step, *args, **kwargs)
        
        # Create a span if enabled
        if ENABLED and _tracer:
            try:
                with _tracer.start_as_current_span(
                    name=f"execute.{step.syscall}",
                    attributes={
                        "process.id": str(process.pid)[:8],
                        "step.id": str(step.step_id)[:8],
                        "step.syscall": step.syscall,
                    }
                ):
                    pass
            except Exception:
                pass
        
        return result
    return wrapper

def trace_nats_message(func: Callable) -> Callable:
    """Simplest possible NATS tracer"""
    @functools.wraps(func)
    async def wrapper(msg, *args, **kwargs):
        # Execute the function
        result = await func(msg, *args, **kwargs)
        
        # Create a span if enabled
        if ENABLED and _tracer:
            try:
                subject = getattr(msg, 'subject', 'axr')
                with _tracer.start_as_current_span(
                    name=f"nats.{subject}",
                    attributes={
                        "subject": subject,
                    }
                ):
                    pass
            except Exception:
                pass
        
        return result
    return wrapper

def trace_agent_decision(agent_name: str):
    """Simplest possible agent decision tracer"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Execute the function
            result = func(*args, **kwargs)
            
            # Create a span if enabled
            if ENABLED and _tracer:
                try:
                    with _tracer.start_as_current_span(
                        name="agent.decision",
                        attributes={
                            "agent.name": agent_name,
                        }
                    ):
                        pass
                except Exception:
                    pass
            
            return result
        return wrapper
    return decorator


def trace_with_context(func):
    """Decorator that preserves trace context across async boundaries"""
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        # Get current span context
        current_span = trace.get_current_span()
        ctx = trace.set_span_in_context(current_span)
        
        # Create a new span as child of current context
        tracer = trace.get_tracer(__name__)
        with tracer.start_as_current_span(
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
                span.set_status(StatusCode.ERROR, str(e))
                raise
    return wrapper

def inject_trace_headers(headers: dict = None) -> dict:
    """Inject trace context into headers for NATS messages"""
    if headers is None:
        headers = {}
    inject(headers)
    return headers

def extract_trace_from_headers(headers: dict):
    """Extract trace context from headers"""
    return extract(headers)