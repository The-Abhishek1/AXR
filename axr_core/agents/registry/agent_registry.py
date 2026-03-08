# axr_core/agents/registry/agent_registry.py
import os
import importlib
import inspect
import logging
from typing import Dict, List, Optional, Set
from axr_core.agents.base.agent import BaseAgent

logger = logging.getLogger(__name__)

class AgentRegistry:
    """
    Registry that dynamically loads and manages agents from domains folder
    """
    
    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}
        self._domain_index: Dict[str, List[str]] = {}
        self._capability_index: Dict[str, List[str]] = {}
        self._loaded_paths: Set[str] = set()  # Track loaded paths to prevent duplicates
    
    def register(self, agent: BaseAgent):
        """Register a single agent if not already registered"""
        if agent.name in self._agents:
            logger.debug(f"Agent {agent.name} already registered, skipping")
            return
        
        self._agents[agent.name] = agent
        
        # Index by domain
        if agent.domain not in self._domain_index:
            self._domain_index[agent.domain] = []
        self._domain_index[agent.domain].append(agent.name)
        
        # Index by capabilities
        for capability in agent.capabilities:
            if capability not in self._capability_index:
                self._capability_index[capability] = []
            self._capability_index[capability].append(agent.name)
        
        logger.info(f"✅ Registered agent: {agent.name} (domain: {agent.domain})")
    
    def load_agents_from_domains(self, domains_path: str = None):
        """
        Dynamically load all agents from domains folder
        Prevents loading the same path twice
        """
        if not domains_path:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            domains_path = os.path.join(base_dir, "agents", "domains")
        
        # Normalize path to prevent duplicates due to different path representations
        domains_path = os.path.normpath(domains_path)
        
        # Check if this path has already been loaded
        if domains_path in self._loaded_paths:
            logger.debug(f"Path already loaded: {domains_path}, skipping")
            return
        
        logger.info(f"🔍 Loading agents from: {domains_path}")
        
        if not os.path.exists(domains_path):
            logger.warning(f"Domains path not found: {domains_path}")
            return
        
        loaded_count = 0
        for root, _, files in os.walk(domains_path):
            for file in files:
                if not file.endswith(".py") or file.startswith("__"):
                    continue
                
                file_path = os.path.join(root, file)
                module_path = self._path_to_module(file_path)
                
                try:
                    module = importlib.import_module(module_path)
                    
                    for name, obj in inspect.getmembers(module, inspect.isclass):
                        if (issubclass(obj, BaseAgent) and 
                            obj != BaseAgent and 
                            not inspect.isabstract(obj)):
                            
                            # Check if agent with this name already exists
                            agent_name = getattr(obj, 'name', name.lower())
                            if agent_name in self._agents:
                                logger.debug(f"Agent {agent_name} already exists, skipping")
                                continue
                            
                            # Instantiate the agent
                            agent = obj()
                            self.register(agent)
                            loaded_count += 1
                            
                except Exception as e:
                    logger.error(f"Failed to load agent from {file_path}: {e}")
        
        # Mark this path as loaded
        self._loaded_paths.add(domains_path)
        logger.info(f"📊 Loaded {loaded_count} agents from {domains_path}")
    
    def get_agent(self, name: str) -> Optional[BaseAgent]:
        """Get agent by name"""
        return self._agents.get(name)
    
    def get_agents_by_domain(self, domain: str) -> List[BaseAgent]:
        """Get all agents in a domain"""
        agent_names = self._domain_index.get(domain, [])
        return [self._agents[name] for name in agent_names if name in self._agents]
    
    def get_agents_by_capability(self, capability: str) -> List[BaseAgent]:
        """Get all agents with a specific capability"""
        agent_names = self._capability_index.get(capability, [])
        return [self._agents[name] for name in agent_names if name in self._agents]
    
    def get_all_agents(self) -> List[BaseAgent]:
        """Get all registered agents"""
        return list(self._agents.values())
    
    def find_agent_for_step(self, step_type: str, domain_hint: str = None) -> Optional[BaseAgent]:
        """Find the most suitable agent for a step type"""
        # First try by domain hint
        if domain_hint:
            domain_agents = self.get_agents_by_domain(domain_hint)
            for agent in domain_agents:
                if step_type in agent.capabilities:
                    return agent
        
        # Then try by capability
        capability_agents = self.get_agents_by_capability(step_type)
        if capability_agents:
            # Return highest rated
            return max(capability_agents, key=lambda a: a.rating)
        
        return None
    
    def list_agents(self) -> List[Dict]:
        """List all agents with their details"""
        return [
            {
                "name": agent.name,
                "domain": agent.domain,
                "capabilities": agent.capabilities,
                "rating": agent.rating,
                "cost_per_run": agent.cost_per_run,
                "avg_latency": agent.avg_latency
            }
            for agent in self._agents.values()
        ]
    
    def _path_to_module(self, file_path: str) -> str:
        """Convert file path to module path"""
        # Find the 'axr_core' part
        parts = file_path.split(os.sep)
        for i, part in enumerate(parts):
            if part == "axr_core":
                module_parts = parts[i:]
                break
        else:
            # Fallback
            module_parts = parts[-4:] if len(parts) >= 4 else parts
        
        module_path = ".".join(module_parts).replace(".py", "")
        return module_path

# Global singleton instance
agent_registry = AgentRegistry()