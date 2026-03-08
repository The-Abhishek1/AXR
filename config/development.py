# config/development.py
"""
Development configuration for resource-constrained environments
"""

# Agent Configuration
AGENT_CONFIG = {
    "max_concurrent_agents": 2,  # Limit concurrent agents
    "agent_timeout": 30,  # Timeout in seconds
    "use_mock_agents": True,  # Use mock implementations
    "mock_delay_min": 0.1,
    "mock_delay_max": 0.5
}

# LLM Configuration (lightweight)
LLM_CONFIG = {
    "model": "tinyllama",  # Use smaller model if available
    "base_url": "http://localhost:11434",
    "timeout": 60,
    "options": {
        "num_predict": 500,  # Limit output length
        "temperature": 0.1,
        "top_k": 20  # Reduce for faster responses
    }
}

# Memory Management
MEMORY_CONFIG = {
    "max_short_term_items": 10,  # Limit memory per process
    "max_episodic_memory": 50,  # Total episodes to store
    "cleanup_interval": 300  # Cleanup every 5 minutes
}

# Execution Limits
EXECUTION_CONFIG = {
    "max_steps_per_process": 5,  # Limit process complexity
    "max_concurrent_processes": 2,
    "step_timeout": 10
}