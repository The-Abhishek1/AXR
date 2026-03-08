# axr_core/agents/base/agent.py
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Set
from datetime import datetime
import json
import hashlib
from enum import Enum

class StepStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    BLOCKED = "blocked"
    SKIPPED = "skipped"

class TaskType(Enum):
    CODE_GENERATION = "code_generation"
    CODE_REVIEW = "code_review"
    TOOL_CREATION = "tool_creation"
    EMAIL = "email"
    MESSAGE = "message"
    REPORT = "report"
    DASHBOARD = "dashboard"
    CI_CD = "ci_cd"
    SECURITY = "security"
    DATA_ANALYSIS = "data_analysis"
    FILE_OPERATION = "file_operation"
    COMMUNICATION = "communication"
    PLANNING = "planning"
    EXECUTION = "execution"
    MONITORING = "monitoring"

class MemoryType(Enum):
    SHORT_TERM = "short_term"  # Current process memory
    LONG_TERM = "long_term"     # Learned patterns
    EPISODIC = "episodic"       # Past task memories
    SEMANTIC = "semantic"       # Domain knowledge
    PROCEDURAL = "procedural"   # How to do things

class AgentMessage:
    def __init__(self, from_agent: str, to_agent: str, 
                 message_type: str, content: Any, 
                 requires_response: bool = True):
        self.from_agent = from_agent
        self.to_agent = to_agent
        self.message_type = message_type
        self.content = content
        self.requires_response = requires_response
        self.timestamp = datetime.now()
        self.message_id = hashlib.md5(f"{from_agent}{to_agent}{self.timestamp}".encode()).hexdigest()[:8]

class ExecutionContext:
    """Context shared between agents during execution"""
    def __init__(self, process_id: str, goal: str):
        self.process_id = process_id
        self.goal = goal
        self.steps: List[Dict] = []
        self.step_results: Dict[str, Any] = {}
        self.failed_steps: List[Dict] = []
        self.modifications: List[Dict] = []
        self.context_data: Dict[str, Any] = {}

class TaskContext:
    """Rich context for task execution"""
    def __init__(self, process_id: str, goal: str, user_id: str = "default"):
        self.process_id = process_id
        self.goal = goal
        self.user_id = user_id
        self.steps: List[Dict] = []
        self.step_results: Dict[str, Any] = {}
        self.failed_steps: List[Dict] = []
        self.modifications: List[Dict] = []
        self.messages: List[AgentMessage] = []
        self.created_tools: List[str] = []
        self.summary: Dict[str, Any] = {}
        self.start_time = datetime.now()
        self.end_time: Optional[datetime] = None
        
        # Memory stores
        self.short_term_memory: Dict[str, Any] = {}  # Current task
        self.episodic_memory: List[Dict] = []  # Past similar tasks
        self.semantic_memory: Dict[str, Any] = {}  # Domain knowledge
        
    def add_to_memory(self, memory_type: str, key: str, value: Any):
        """Add to different memory types"""
        if memory_type == "short_term":
            self.short_term_memory[key] = {
                "value": value,
                "timestamp": datetime.now()
            }
        elif memory_type == "episodic":
            self.episodic_memory.append({
                "key": key,
                "value": value,
                "timestamp": datetime.now()
            })
        elif memory_type == "semantic":
            self.semantic_memory[key] = {
                "value": value,
                "timestamp": datetime.now()
            }

class BaseAgent(ABC):
    name: str
    domain: str
    task_types: List[TaskType] = []
    capabilities: List[str] = []
    rating: float = 0.0
    cost_per_run: float = 0.0
    avg_latency: float = 0.0
    version: str = "1.0.0"
    
    def __init__(self):
        self.experience: Dict[str, Any] = {}  # Learning from past tasks
        self.success_rate = 100.0
        self.tasks_completed = 0
        self.feedback_history: List[Dict] = []
        self.llm_client = None  # Will be set by loader
        
    @abstractmethod
    async def execute(self, task: Dict, context: TaskContext) -> Dict:
        """Execute a task with full context"""
        pass
    
    async def can_handle(self, task_type: TaskType, context: TaskContext) -> float:
        """Return confidence score (0-1) for handling this task"""
        if task_type in self.task_types:
            # Base confidence from experience
            base_confidence = 0.8
            
            # Adjust based on similar past tasks
            similar_tasks = self._find_similar_tasks(context.goal)
            if similar_tasks:
                avg_success = sum(t.get("success", 0) for t in similar_tasks) / len(similar_tasks)
                base_confidence = (base_confidence + avg_success) / 2
            
            return base_confidence
        return 0.0
    
    async def collaborate(self, message: AgentMessage, context: TaskContext) -> Optional[Dict]:
        """Handle collaboration requests from other agents"""
        context.messages.append(message)
        
        if message.message_type == "request_help":
            return await self._provide_help(message.content, context)
        elif message.message_type == "review_code":
            return await self._review_code(message.content, context)
        elif message.message_type == "create_tool":
            return await self._create_tool(message.content, context)
        
        return None
    
    async def learn_from_task(self, task_result: Dict, context: TaskContext):
        """Learn from completed tasks"""
        self.tasks_completed += 1
        
        # Store in episodic memory
        memory_entry = {
            "goal": context.goal,
            "steps": context.steps,
            "result": task_result,
            "success": task_result.get("status") == "success",
            "timestamp": datetime.now(),
            "modifications": context.modifications,
            "created_tools": context.created_tools
        }
        
        context.add_to_memory("episodic", f"task_{self.tasks_completed}", memory_entry)
        
        # Update success rate
        if memory_entry["success"]:
            self.success_rate = (self.success_rate * (self.tasks_completed - 1) + 100) / self.tasks_completed
        else:
            self.success_rate = (self.success_rate * (self.tasks_completed - 1)) / self.tasks_completed
        
        # Store feedback
        self.feedback_history.append({
            "task_id": context.process_id,
            "success": memory_entry["success"],
            "rating": task_result.get("rating", 3),
            "timestamp": datetime.now()
        })
    
    def _find_similar_tasks(self, goal: str) -> List[Dict]:
        """Find similar past tasks using semantic similarity"""
        # This would use embeddings in production
        similar = []
        for entry in self.feedback_history[-100:]:  # Look at last 100 tasks
            # Simple keyword matching for now
            if any(word in goal.lower() for word in entry.get("keywords", [])):
                similar.append(entry)
        return similar
    
    async def _provide_help(self, request: Dict, context: TaskContext) -> Dict:
        """Provide help to another agent"""
        return {
            "help_provided": True,
            "suggestions": ["Consider using tool X", "Check memory for similar tasks"],
            "confidence": 0.7
        }
    
    async def _review_code(self, code: Dict, context: TaskContext) -> Dict:
        """Review code generated by another agent"""
        return {
            "approved": True,
            "suggestions": [],
            "issues": []
        }
    
    async def _create_tool(self, tool_spec: Dict, context: TaskContext) -> Dict:
        """Create a new tool dynamically"""
        return {
            "tool_created": False,
            "message": "Tool creation not implemented in base agent"
        }

class AgentMemory:
    """Persistent memory across all agents"""
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        self.short_term: Dict[str, Dict] = {}  # Process-specific
        self.long_term: Dict[str, List[Dict]] = {}  # Learned patterns
        self.knowledge_base: Dict[str, Any] = {}  # Domain knowledge
        self.tool_knowledge: Dict[str, Dict] = {}  # Tool usage patterns
        
    def store_experience(self, agent_name: str, experience: Dict):
        """Store agent experience for learning"""
        if agent_name not in self.long_term:
            self.long_term[agent_name] = []
        self.long_term[agent_name].append({
            **experience,
            "timestamp": datetime.now()
        })
        # Keep last 1000 experiences
        self.long_term[agent_name] = self.long_term[agent_name][-1000:]
    
    def get_similar_experiences(self, agent_name: str, query: str, limit: int = 5) -> List[Dict]:
        """Get similar past experiences"""
        experiences = self.long_term.get(agent_name, [])
        # This would use embeddings in production
        return experiences[-limit:]  # Return most recent for now

# Global memory instance
agent_memory = AgentMemory()