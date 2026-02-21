import time
from axr_core.process_graph.models import StepStatus

class RetryManager:
    """
    Handles retry logic with exponential backoff.
    """
    
    def should_retry(self, step) -> bool:
        return step.retries < step.max_retries
    
    def apply_backoff(self, step):
        delay = step.backoff_seconds * (2 ** step.retries)
        print(f"[RETRY] Backoff {delay}s for {step.syscall}")
    
    def mark_retry(self, step, error: str):
        step.retries += 1
        step.last_error = error
        step.status = StepStatus.PENDING