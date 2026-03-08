# axr_core/agents/service/dynamic_agent_loader.py
import os
import logging
from typing import Optional

from axr_core.agents.registry.agent_registry import agent_registry
from axr_core.agents.llm_client import LLMClient

logger = logging.getLogger(__name__)

class DynamicAgentLoader:
    """
    Simplified loader that just triggers the registry to load agents
    """
    
    def __init__(self, registry=None):
        self.registry = registry or agent_registry
        self.llm_client = LLMClient()
        self._loaded = False

    def load_agents(self):
        """Load all agents from the domains folder (idempotent)"""
        if self._loaded:
            logger.debug("Agents already loaded, skipping")
            return
        
        # Get the correct domains path
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        domains_path = os.path.join(base_dir, "agents", "domains")
        
        # Let the registry handle the loading (it will prevent duplicates)
        self.registry.load_agents_from_domains(domains_path)
        
        self._loaded = True
        logger.info(f"✅ Agent loading complete. Total agents: {len(self.registry.get_all_agents())}")