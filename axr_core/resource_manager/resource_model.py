from dataclasses import dataclass

@dataclass
class ProcessResources:
    max_concurrent_steps: 10
    max_budget: float = 100.0