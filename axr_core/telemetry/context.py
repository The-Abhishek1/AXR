"""Context propagation for distributed tracing"""

from typing import Dict, Optional
from opentelemetry import propagate
from opentelemetry.trace.propagation.tracecontext import TraceContextTextMapPropagator

def inject_context(carrier: Dict) -> Dict:
    """Inject current trace context into carrier dict (e.g. NATS headers)"""
    # This actually populates the dict with 'traceparent'
    TraceContextTextMapPropagator().inject(carrier)
    return carrier

def extract_context(carrier: Dict):
    """Extract trace context from carrier dict"""
    # This returns a Context object that OpenTelemetry understands
    return TraceContextTextMapPropagator().extract(carrier)