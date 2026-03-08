# api/routes/__init__.py
from . import static
from . import tools
from . import policies
from . import replay
from . import events
from . import workers
from . import dashboard
from . import agents
from . import processes
from . import scheduler_control
from . import agent_execution
from . import dev_agents
from . import hybrid_execution  # Add this
from . import debug

__all__ = [
    'static', 'tools', 'policies', 'replay', 'events', 
    'workers', 'dashboard', 'agents', 'processes',
    'scheduler_control', 'agent_execution', 'dev_agents',
    'hybrid_execution', 'debug'
]