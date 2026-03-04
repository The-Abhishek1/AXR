# tool_runtime/base_tool/tool.py
from abc import ABC, abstractmethod
from typing import Optional, Dict, Any

class BaseTool(ABC):
    """
    Abstract base class that all tools must inherit from.
    Ensures consistent interface across all tools.
    """
    
    @abstractmethod
    def execute(self, process, step, memory_manager=None) -> Dict[str, Any]:
        """
        Execute the tool's main functionality.
        
        Args:
            process: The AIProcess object
            step: The ProcessStep being executed
            memory_manager: Optional memory manager for I/O
        
        Returns:
            Dictionary with execution results
        """
        pass
    
    @abstractmethod
    def rollback(self, process, step, memory_manager=None) -> None:
        """
        Clean up after a failed execution.
        Called during transaction rollback.
        """
        pass