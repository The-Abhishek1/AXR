# axr_core/agents/__init__.py
import logging
import os
from axr_core.agents.registry.agent_registry import agent_registry
from axr_core.agents.llm_client import LLMClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flag to track if agents have been initialized
_initialized = False

def initialize_agents():
    """
    Initialize all agents when the system starts (idempotent)
    """
    global _initialized
    
    if _initialized:
        logger.debug("Agents already initialized, skipping")
        return agent_registry
    
    logger.info("🤖 Initializing agent system...")
    
    # Create LLM client for agents that need it
    llm_client = LLMClient()
    
    # Load agents from the correct path
    base_dir = os.path.dirname(os.path.dirname(__file__))
    domains_path = os.path.join(base_dir, "agents", "domains")
    
    if os.path.exists(domains_path):
        logger.info(f"📂 Loading agents from: {domains_path}")
        agent_registry.load_agents_from_domains(domains_path)
    else:
        logger.warning(f"Domains folder not found at: {domains_path}")
    
    # Register built-in planner if not already loaded
    existing_planners = agent_registry.get_agents_by_domain("planning")
    if not existing_planners:
        from axr_core.agents.planner.planner_agent import PlannerAgent
        planner = PlannerAgent(llm_client)
        agent_registry.register(planner)
        logger.info("✅ Registered built-in planner_agent")
    
    logger.info(f"✅ Agent system initialized with {len(agent_registry.get_all_agents())} agents")
    
    # Log available agents by domain
    agents_by_domain = {}
    for agent in agent_registry.get_all_agents():
        if agent.domain not in agents_by_domain:
            agents_by_domain[agent.domain] = []
        agents_by_domain[agent.domain].append(agent.name)
    
    for domain, agents in agents_by_domain.items():
        logger.info(f"  📌 {domain}: {', '.join(agents)}")
    
    _initialized = True
    return agent_registry

# Initialize only once when module is imported
agent_registry = initialize_agents()