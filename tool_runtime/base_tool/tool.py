from abc import ABC, abstractmethod
from typing import Dict, Any


class BaseTool(ABC):

    name: str
    syscall: str
    description: str

    @abstractmethod
    def execute(self, process, step, memory_manager=None) -> Dict[str, Any]:
        pass

    @abstractmethod
    def rollback(self, process, step, memory_manager=None) -> None:
        pass