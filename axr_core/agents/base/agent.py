from abc import ABC, abstractmethod


class BaseAgent(ABC):

    name: str
    domain: str
    capabilities: list[str]

    rating: float
    cost_per_run: float
    avg_latency: float

    @abstractmethod
    async def execute(self, task, tool_router):
        pass