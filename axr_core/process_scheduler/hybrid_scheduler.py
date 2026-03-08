# axr_core/process_scheduler/hybrid_scheduler.py
import asyncio
import logging
import heapq
import time
from typing import Dict, List, Optional, Any, Set, Tuple
from datetime import datetime
from uuid import UUID, uuid4
import json
from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum

from axr_core.process_manager.process import AIProcess, ProcessState
from axr_core.process_graph.models import ProcessStep, StepStatus
from axr_core.process_graph.resolver import ProcessGraphResolver
from axr_core.security_module.evaluator import SecurityEvaluator
from axr_core.capabilities.issuer import CapabilityIssuer
from axr_core.capabilities.validator import CapabilityValidator
from axr_core.capabilities.models import Capability
from axr_core.process_memory.memory_manager import ProcessMemoryManager
from axr_core.transactions.transaction_manager import TransactionManager
from axr_core.checkpointing.checkpoint_manager import CheckpointManager
from axr_core.retry.retry_manager import RetryManager
from axr_core.events.event_bus import EventBus
from axr_core.events.event import Event, EventType
from axr_core.resource_manager.resource_manager import ResourceManager
from axr_core.resource_manager.resource_model import ProcessResources
from axr_core.persistence.repository import PersistenceRepository
from axr_core.distributed.nats_client import NATSClient
from axr_core.distributed.message import task_message
from axr_core.reliability.lease_manager import LeaseManager
from axr_core.distributed.worker_registry import worker_registry
from axr_core.event_scheduler.scheduler import EventDrivenScheduler
from axr_core.cluster.autoscaler import WorkerAutoScaler
from axr_core.artifacts.artifact_manager import artifact_manager

from axr_core.agents.base.agent import BaseAgent, TaskContext, AgentMessage
from axr_core.agents.registry.agent_registry import agent_registry

logger = logging.getLogger(__name__)

# ==================== Enums ====================

class SchedulerEventType(Enum):
    """Internal scheduler events"""
    STEP_READY = "step_ready"
    STEP_COMPLETED = "step_completed"
    STEP_FAILED = "step_failed"
    PROCESS_PAUSED = "process_paused"
    PROCESS_RESUMED = "process_resumed"
    PROCESS_CANCELLED = "process_cancelled"
    NEW_PROCESS = "new_process"
    RETRY_READY = "retry_ready"

# ==================== Data Classes ====================

@dataclass
class RetryItem:
    """Item in retry priority queue"""
    retry_time: float
    step_id: UUID
    process_id: UUID
    
    def __lt__(self, other):
        return self.retry_time < other.retry_time

@dataclass
class ProcessStateObject:
    """Encapsulated state for a process"""
    process: AIProcess
    steps: List[ProcessStep]
    step_map: Dict[UUID, ProcessStep]
    resolver: ProcessGraphResolver
    context: TaskContext
    metrics: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    
    def get_step(self, step_id: UUID) -> Optional[ProcessStep]:
        return self.step_map.get(step_id)
    
    def update_resolver(self):
        """Update resolver with current steps"""
        self.resolver = ProcessGraphResolver(self.steps)

# ==================== Metrics Collector ====================

class MetricsCollector:
    """Collect and store system metrics"""
    
    def __init__(self):
        self.steps_per_second = 0
        self.step_count = 0
        self.last_metric_time = time.time()
        self.worker_utilization: Dict[str, float] = {}
        self.agent_success_rate: Dict[str, float] = {}
        self.agent_tasks: Dict[str, int] = defaultdict(int)
        self.agent_failures: Dict[str, int] = defaultdict(int)
        self.step_latencies: List[float] = []
        self.max_latency_samples = 1000
        
    def record_step_completion(self, duration: float, agent: Optional[str] = None):
        """Record step completion metrics"""
        self.step_count += 1
        self.step_latencies.append(duration)
        if len(self.step_latencies) > self.max_latency_samples:
            self.step_latencies.pop(0)
        
        # Calculate steps per second
        now = time.time()
        time_diff = now - self.last_metric_time
        if time_diff >= 1.0:
            self.steps_per_second = self.step_count / time_diff
            self.step_count = 0
            self.last_metric_time = now
        
        # Update agent metrics
        if agent:
            self.agent_tasks[agent] += 1
    
    def record_step_failure(self, agent: Optional[str] = None):
        """Record step failure"""
        if agent:
            self.agent_failures[agent] += 1
    
    def get_agent_success_rate(self, agent_name: str) -> float:
        """Get success rate for an agent"""
        total = self.agent_tasks.get(agent_name, 0)
        if total == 0:
            return 100.0
        failures = self.agent_failures.get(agent_name, 0)
        return ((total - failures) / total) * 100
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get all metrics"""
        return {
            "steps_per_second": self.steps_per_second,
            "avg_latency": sum(self.step_latencies) / len(self.step_latencies) if self.step_latencies else 0,
            "worker_utilization": self.worker_utilization,
            "agent_stats": {
                name: {
                    "tasks": self.agent_tasks[name],
                    "failures": self.agent_failures.get(name, 0),
                    "success_rate": self.get_agent_success_rate(name)
                }
                for name in self.agent_tasks.keys()
            }
        }

# ==================== Main Scheduler ====================

class HybridScheduler:
    """
    Enterprise-grade scheduler with agent-based dynamic adaptation
    Optimized for performance, scalability, and reliability
    """
    
    def __init__(self, max_workers: int = 50, max_active_processes: int = 100):
        # === Core data structures ===
        self.processes: Dict[UUID, ProcessStateObject] = {}
        self.step_futures: Dict[UUID, asyncio.Future] = {}
        self.step_results: Dict[UUID, Any] = {}
        
        # === Execution control ===
        self._global_active_steps = 0
        self.global_max_parallel = max_workers
        self.max_active_processes = max_active_processes
        self._active_process_count = 0
        
        # === Event-driven scheduler ===
        self._scheduler_event = asyncio.Event()
        self._running = False
        self._scheduler_task: Optional[asyncio.Task] = None
        
        # === Priority queue for retries ===
        self.retry_heap: List[RetryItem] = []
        self._retry_lock = asyncio.Lock()
        
        # === Process queues for backpressure ===
        self.process_queue: asyncio.Queue = asyncio.Queue(maxsize=1000)
        self._queue_processor_task: Optional[asyncio.Task] = None
        
        # === Locks for thread safety ===
        self._global_lock = asyncio.Lock()
        self._process_locks: Dict[UUID, asyncio.Lock] = {}
        
        # === Control sets ===
        self.paused_processes: Set[UUID] = set()
        self.cancelled_processes: Set[UUID] = set()
        self.paused_steps: Dict[UUID, Set[UUID]] = defaultdict(set)
        self.cancelled_steps: Dict[UUID, Set[UUID]] = defaultdict(set)
        
        # === Worker tracking ===
        self._lease_worker_map: Dict[UUID, str] = {}
        self._worker_step_map: Dict[str, UUID] = {}
        
        # === Metrics ===
        self.metrics = MetricsCollector()
        
        # === Initialize all enterprise components ===
        self.security_evaluator = SecurityEvaluator(policy_path="policies/devsecops_safe.yaml")
        self.capability_issuer = CapabilityIssuer()
        self.capability_validator = CapabilityValidator()
        self.memory_manager = ProcessMemoryManager()
        self.repo = PersistenceRepository()
        self.event_bus = EventBus(repo=self.repo)
        self.transaction_manager = TransactionManager(self.memory_manager, self.event_bus)
        self.checkpoint_manager = CheckpointManager(self.memory_manager)
        self.retry_manager = RetryManager()
        self.resource_manager = ResourceManager()
        self.lease_manager = LeaseManager(timeout_seconds=15)
        self.worker_registry = worker_registry
        
        # === NATS ===
        self.nats = None
        self.loop = None
        
        # === Advanced scheduling ===
        from axr_core.advanced_scheduler.scheduler import AdvancedScheduler
        self.advanced_scheduler = AdvancedScheduler()
        self.advanced_scheduler.register_tenant(tenant_id="default", quota=None, priority=1)
        
        # === Event and auto-scaling ===
        self.event_scheduler = EventDrivenScheduler(self)
        self.autoscaler = WorkerAutoScaler(self)
        
        # === Agent collaboration ===
        self.agent_messages: Dict[UUID, List[AgentMessage]] = {}
        
        # === Artifact cleanup ===
        self.artifact_ttl = 3600  # 1 hour default
        self._cleanup_task: Optional[asyncio.Task] = None
        
        self.last_scale_time = 0
        self.SCALE_COOLDOWN = 5  # seconds
        
        self.MAX_RETRIES = 3
        self.BASE_BACKOFF = 0.5
        
        logger.info(f"[HYBRID] Scheduler initialized with max_workers={max_workers}, max_processes={max_active_processes}")
    
    # ==================== INITIALIZATION ====================
    
    async def init_nats(self):
        """Initialize NATS connection"""
        self.nats = NATSClient()
        self.loop = asyncio.get_running_loop()
        await self.nats.connect()
        await self.nats.subscribe("axr.results", self._on_result)
        await self.nats.subscribe("axr.heartbeat", self._handle_heartbeat)
        await self.nats.nc.flush()
        logger.info("[HYBRID] NATS initialized")
    
    async def start(self):
        """Start the scheduler"""
        self._running = True
        self._scheduler_task = asyncio.create_task(self._scheduler_loop())
        self._queue_processor_task = asyncio.create_task(self._process_queue_loop())
        self._cleanup_task = asyncio.create_task(self._artifact_cleanup_loop())
        logger.info("[HYBRID] Scheduler started")
    
    async def stop(self):
        """Stop the scheduler"""
        self._running = False
        self._scheduler_event.set()  # Wake up loops to exit
        
        # Cancel all tasks
        for task in [self._scheduler_task, self._queue_processor_task, self._cleanup_task]:
            if task:
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass
        
        # Cancel all pending futures
        for future in self.step_futures.values():
            if not future.done():
                future.cancel()
        
        logger.info("[HYBRID] Scheduler stopped")
    
    # ==================== MAIN EXECUTION ====================
    
    async def execute_goal(self, goal: str, user_id: str = "default") -> Dict:
        """
        Execute a goal with full agent collaboration
        Uses queue for backpressure
        """
        # Create process
        process_id = uuid4()
        process = AIProcess(intent=goal, budget_limit=100)
        process.pid = process_id
        process.user_id = user_id
        
        # Create agent context
        context = TaskContext(str(process_id), goal, user_id)
        
        # Queue for execution (backpressure)
        try:
            await asyncio.wait_for(
                self.process_queue.put((process, context)),
                timeout=30.0
            )
            logger.info(f"[QUEUE] Process {str(process_id)[:8]} queued. Queue size: {self.process_queue.qsize()}")
        except asyncio.TimeoutError:
            raise Exception("System busy - queue full")
        
        # Wait for completion
        # In production, you'd return a future/token for polling
        return await self._wait_for_completion(process_id)
    
    async def _process_queue_loop(self):
        """Process queued executions with backpressure control"""
        while self._running:
            try:
                # Get next process from queue
                process, context = await self.process_queue.get()
                
                # Check active process limit
                if self._active_process_count >= self.max_active_processes:
                    logger.warning(f"Active process limit reached, requeueing {str(process.pid)[:8]}")
                    await asyncio.sleep(0.1)
                    await self.process_queue.put((process, context))
                    continue
                
                # Execute process
                self._active_process_count += 1
                asyncio.create_task(self._execute_process(process, context))
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Queue processor error: {e}")
    

    async def _execute_process(self, process: AIProcess, context: TaskContext):
        """Execute a single process"""
        process_id = process.pid
        logger.info(f"▶️ Executing process {str(process_id)[:8]}: {process.intent}")
        
        try:
            # Phase 1: Agent-based planning
            plan = await self._agent_planning(process.intent, context)
            
            # Convert plan to steps
            steps = await self._plan_to_steps(process_id, plan)
            
            # Create process state
            step_map = {s.step_id: s for s in steps}
            resolver = ProcessGraphResolver(steps)
            
            process_state = ProcessStateObject(
                process=process,
                steps=steps,
                step_map=step_map,
                resolver=resolver,
                context=context
            )
            
            # Register with all systems
            await self._register_process(process_state)
            
            # Update process state to RUNNING
            process.state = ProcessState.RUNNING
            self.repo.save_process(process)
            
            # Notify scheduler of new process
            self._scheduler_event.set()
            
            # Wait for process completion
            while not self._is_process_complete(process_state):
                if process_id in self.cancelled_processes:
                    await self._cancel_process(process_id)
                    break
                
                await asyncio.sleep(0.1)
            
            # Finalize
            await self._finalize_process(process_id)
            
        except Exception as e:
            logger.error(f"Process {str(process_id)[:8]} failed: {e}")
            process.state = ProcessState.FAILED
            self.repo.save_process(process)
            await self._handle_process_failure(process_id, e)
        finally:
            self._active_process_count -= 1
    
    async def _scheduler_loop(self):
        """
        Event-driven scheduler loop
        Wakes only when events occur, not busy polling
        """
        while self._running:
            try:
                # Wait for event (with timeout for periodic checks)
                try:
                    await asyncio.wait_for(self._scheduler_event.wait(), timeout=1.0)
                except asyncio.TimeoutError:
                    pass
                
                # Clear event for next round
                self._scheduler_event.clear()
                
                # Process retry queue (using heap)
                await self._process_retry_queue()
                
                # Schedule ready steps
                await self._schedule_ready_steps()
                
                # Check for expired leases
                self._check_expired_leases()
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Scheduler loop error: {e}")
    
    async def _process_retry_queue(self):
        """Process retry queue using heap for efficiency"""
        now = time.time()
        ready_retries = []
        
        async with self._retry_lock:
            while self.retry_heap and self.retry_heap[0].retry_time <= now:
                item = heapq.heappop(self.retry_heap)
                ready_retries.append(item)
        
        # Process ready retries
        for item in ready_retries:
            process_state = self.processes.get(item.process_id)
            if not process_state:
                continue
            
            step = process_state.get_step(item.step_id)
            if step and step.status == StepStatus.PENDING:
                step.status = StepStatus.READY
                self.repo.save_step(step)
                logger.debug(f"[RETRY] Step {step.syscall} ready")
        
        if ready_retries:
            self._scheduler_event.set()  # Wake up for new ready steps

    async def _schedule_ready_steps(self):
        """Schedule all ready steps across processes"""
        for process_id, process_state in list(self.processes.items()):
            # Skip paused/cancelled processes
            if process_id in self.paused_processes or process_id in self.cancelled_processes:
                continue
            
            # Get process lock
            if process_id not in self._process_locks:
                self._process_locks[process_id] = asyncio.Lock()
            
            async with self._process_locks[process_id]:
                # Get runnable steps (resolver handles READY logic)
                runnable = process_state.resolver.get_runnable_steps()
                
                for step in runnable:
                    # Skip controlled steps
                    if step.step_id in self.paused_steps[process_id]:
                        continue
                    if step.step_id in self.cancelled_steps[process_id]:
                        continue
                    
                    # Check if we can schedule
                    if not await self._can_schedule_step(process_state, step):
                        continue
                    
                    if step.status == StepStatus.PENDING:
                        step.mark_ready()

                    step.start()
                    self.repo.save_step(step)
                    
                    # Execute
                    asyncio.create_task(self._execute_step(process_state, step))
    
    # ==================== STEP EXECUTION ====================
    
    async def _execute_step(self, process_state: ProcessStateObject, step: ProcessStep):
        """Execute a single step with full infrastructure"""
        process_id = process_state.process.pid
        step_id = step.step_id
        start_time = time.time()
        
        # Create future
        future = asyncio.get_running_loop().create_future()
        self.step_futures[step_id] = future
        
        try:
            # Update counts
            async with self._global_lock:
                self._global_active_steps += 1
            
            # Record start
            self.advanced_scheduler.record_step_start(process_id)
            
            # Publish event
            self.event_bus.publish(Event(
                type=EventType.STEP_STARTED,
                pid=process_id,
                step_id=step_id,
                metadata={"syscall": step.syscall}
            ))
            
            # Find best agent
            agent = await self._find_agent_for_step(step, process_state.context)
            
            # Acquire worker
            worker_id = await self._acquire_worker_for_step(step.syscall)
            if not worker_id:
                raise Exception(f"No worker available for {step.syscall}")
            
            # Issue capability
            capability = self.capability_issuer.issue(
                pid=process_id,
                step_id=step_id,
                syscall=step.syscall,
                budget_limit=step.cost_estimate
            )
            
            # Get memory
            process_memory = self.memory_manager.read_process_memory(process_id)
            
            # Prepare message - ALL UUIDs CONVERTED TO STRINGS
            payload = {
                "pid": str(process_id),
                "step_id": str(step_id),
                "syscall": step.syscall,
                "memory": {str(k): v for k, v in process_memory.items()},
                "capability": {
                    "cap_id": str(capability.cap_id),
                    "pid": str(process_id),
                    "step_id": str(step_id),
                    "syscall": step.syscall,
                    "budget_limit": step.cost_estimate,
                    "signature": capability.signature,
                    "issued_at": capability.issued_at.isoformat(),
                    "expires_at": capability.expires_at.isoformat()
                },
                "inputs": step.params if hasattr(step, "params") else {},
                "timeout": getattr(step, "timeout", 300)
            }

            # Update step
            step.assigned_worker = worker_id
            step.status = StepStatus.RUNNING
            self.repo.save_step(step)

            # Track mapping
            async with self._global_lock:
                self._lease_worker_map[step_id] = worker_id
                self._worker_step_map[worker_id] = step_id

            # Start lease
            self.lease_manager.start_lease(process_id, step_id, worker_id)

            # Send to worker
            try:
                payload_bytes = json.dumps(payload).encode('utf-8')
                await self.nats.publish(f"axr.tasks.{worker_id}", payload_bytes)
                logger.info(f"[NATS] Published task to worker {worker_id[:8]}")
            except Exception as e:
                logger.error(f"[NATS] Publish failed: {e}")
                raise

            # Wait for result (with step-specific timeout)
            timeout = getattr(step, 'timeout', 300)
            try:
                result = await asyncio.wait_for(future, timeout=timeout)
                
                # Success path
                step.succeed()
                
                # Store output
                if result.get("output"):
                    self.memory_manager.write_output(process_id, step_id, result["output"])
                    
                    # Handle artifacts
                    artifacts = artifact_manager.handle_step_output(
                        process_id, step_id, result["output"]
                    )
                    if artifacts:
                        logger.info(f"[STEP] Generated {len(artifacts)} artifacts")
                
                # Update metrics
                duration = time.time() - start_time
                self.metrics.record_step_completion(duration, agent.name if agent else None)
                
                # Publish success
                self.event_bus.publish(Event(
                    type=EventType.STEP_SUCCEEDED,
                    pid=process_id,
                    step_id=step_id,
                    metadata={"duration": duration}
                ))
                
                # Notify agents
                if agent:
                    duration = (step.completed_at - step.started_at).total_seconds() if step.started_at and step.completed_at else 0
                    await self._broadcast_success(agent, step, result, process_state.context, duration)
    
                logger.info(f"✅ Step {step.syscall} completed in {duration:.2f}s")
                
            except asyncio.TimeoutError:
                raise Exception(f"Step timed out after {timeout}s")
            
        except Exception as e:
            # Failure path
            logger.error(f"Step {step.syscall} failed: {e}")
            await self._handle_step_failure(process_state, step, e)
            
            # Update metrics
            self.metrics.record_step_failure(agent.name if agent else None)
            
            # Publish failure
            self.event_bus.publish(Event(
                type=EventType.STEP_FAILED,
                pid=process_id,
                step_id=step_id,
                metadata={"error": str(e)}
            ))
            
        finally:
            # Cleanup
            async with self._global_lock:
                self.step_futures.pop(step_id, None)
                self._global_active_steps -= 1
                
                worker_id = self._lease_worker_map.pop(step_id, None)
                if worker_id:
                    self._worker_step_map.pop(worker_id, None)
            
            # Release worker
            if worker_id:
                self.worker_registry.release_worker(worker_id)
            
            # Complete lease
            self.lease_manager.complete_lease(step_id)
            
            # Save step
            self.repo.save_step(step)
            
            # Record completion in quota manager
            duration = time.time() - start_time
            self.advanced_scheduler.record_step_complete(process_id, duration, step.cost_estimate)
            
            # Wake scheduler
            self._scheduler_event.set()
    
    async def _handle_step_failure(self, process_state: ProcessStateObject, step: ProcessStep, error: Exception):
        """Handle step failure with retry and agent help"""
        process_id = process_state.process.pid
        step_id = step.step_id
        
        # Rollback budget
        process_state.process.budget_used -= step.cost_estimate
        self.repo.save_process(process_state.process)
        
        # Check retry count
        if step.retries < self.MAX_RETRIES:
            # Schedule retry
            step.retries += 1
            backoff = self.BASE_BACKOFF * (2 ** (step.retries - 1))
            retry_time = time.time() + backoff
            
            # Add to heap
            async with self._retry_lock:
                heapq.heappush(self.retry_heap, RetryItem(retry_time, step_id, process_id))
            
            step.status = StepStatus.PENDING
            logger.info(f"[RETRY] Step {step.syscall} retry {step.retries} in {backoff:.1f}s")
            
            self.event_bus.publish(Event(
                type=EventType.STEP_RETRY_SCHEDULED,
                pid=process_id,
                step_id=step_id,
                metadata={"retry": step.retries, "backoff": backoff}
            ))
            
        else:
            # Max retries - ask agents for help
            logger.warning(f"[HELP] Step {step.syscall} failed, asking agents")
            
            # Find helping agent
            for agent in agent_registry.get_all_agents():
                if hasattr(agent, 'on_step_failed'):
                    try:
                        replacement_steps = await agent.on_step_failed(
                            {"tool": step.syscall, "step_id": str(step_id)},
                            str(error),
                            process_state.context
                        )
                        
                        if replacement_steps:
                            # Add replacement steps
                            new_steps = await self._plan_to_steps(process_id, {"steps": replacement_steps})
                            
                            # Update dependencies
                            for new_step in new_steps:
                                new_step.depends_on.append(step_id)
                                await self.add_step(process_id, new_step)
                            
                            logger.info(f"[HELP] Agent {agent.name} provided {len(new_steps)} replacements")
                            return
                    except Exception as e:
                        logger.error(f"Agent {agent.name} help failed: {e}")
            
            # No help - mark failed
            step.fail(str(error))
            logger.error(f"❌ Step {step.syscall} failed permanently")
    
    # ==================== WORKER MANAGEMENT ====================
    
    async def _acquire_worker_for_step(self, step_syscall: str) -> Optional[str]:
        """Acquire best worker using load balancing"""
        workers = self.worker_registry.get_workers_for_tool(step_syscall)
        if not workers:
            return None
        
        # Load balancing - pick least loaded
        best_worker = None
        best_load = float('inf')
        
        for worker_id in workers:
            load = self.worker_registry.get_worker_load(worker_id)
            if load < best_load:
                best_load = load
                best_worker = worker_id
        
        if best_worker:
            return self.worker_registry.acquire_worker(step_syscall, preferred=best_worker)
        
        return None
    
    # ==================== NATS CALLBACKS ====================
    
    async def _on_result(self, msg):
        """Handle worker results"""
        try:
            data = json.loads(msg.data.decode())
            step_id = UUID(data["step_id"])
            
            # Find future
            future = self.step_futures.get(step_id)
            if not future:
                logger.warning(f"Received result for unknown step {step_id}")
                return
            
            # Validate capability
            if not await self._validate_capability(data):
                future.set_exception(Exception("Invalid capability"))
                return
            
            # Set result
            if data.get("status") == "success":
                # Cache result
                self.step_results[step_id] = data
                future.set_result(data)
            else:
                future.set_exception(Exception(data.get("error", "Unknown error")))
            
            # Wake scheduler
            self._scheduler_event.set()
            
        except Exception as e:
            logger.error(f"Error processing result: {e}")
    
    async def _validate_capability(self, data: Dict) -> bool:
        """Validate capability from worker response"""
        cap_data = data.get("capability")
        if not cap_data:
            return False
        
        try:
            cap = Capability(
                cap_id=UUID(cap_data["cap_id"]),
                pid=UUID(cap_data["pid"]),
                step_id=UUID(cap_data["step_id"]),
                syscall=cap_data["syscall"],
                issued_at=datetime.fromisoformat(cap_data["issued_at"]),
                expires_at=datetime.fromisoformat(cap_data["expires_at"]),
                budget_limit=cap_data["budget_limit"],
                signature=cap_data["signature"],
                issuer=cap_data.get("issuer", "axr-scheduler")
            )
            
            process = self.processes.get(cap.pid)
            step = self.processes[cap.pid].get_step(cap.step_id) if cap.pid in self.processes else None
            
            if not process or not step:
                return False
            
            return self.capability_validator.validate_strict(cap, process.process, step)
            
        except Exception:
            return False
    
    async def _handle_heartbeat(self, msg):
        """Handle worker heartbeats"""
        try:
            data = json.loads(msg.data.decode())
            worker_id = data["worker_id"]
            tools = data.get("tools", [])
            capacity = data.get("capacity", 10)
            load = data.get("load", 0)
            
            # Register or update
            if tools:
                self.worker_registry.register(worker_id, tools, capacity)
            
            self.worker_registry.heartbeat(worker_id, load)
            
            # Update metrics
            self.metrics.worker_utilization[worker_id] = load / capacity if capacity > 0 else 0
            
        except Exception as e:
            logger.error(f"Heartbeat error: {e}")
    
    # ==================== DAG MUTATION API ====================
    
    async def add_step(self, process_id: UUID, step: ProcessStep) -> bool:
        """Add a new step dynamically"""
        if process_id not in self.processes:
            return False
        
        process_state = self.processes[process_id]
        
        async with self._process_locks[process_id]:
            # Check for cycles
            if not self._validate_dag(process_state.steps + [step]):
                logger.error(f"Cannot add step {step.syscall} - would create cycle")
                return False
            
            # Add step
            process_state.steps.append(step)
            process_state.step_map[step.step_id] = step
            
            # Update resolver
            process_state.update_resolver()
            
            # Save
            self.repo.save_step(step)
            
            logger.info(f"[DAG] Added step {step.syscall} to process {str(process_id)[:8]}")
            
            # Wake scheduler
            self._scheduler_event.set()
            
            return True
    
    async def remove_step(self, process_id: UUID, step_id: UUID) -> bool:
        """Remove a step dynamically"""
        if process_id not in self.processes:
            return False
        
        process_state = self.processes[process_id]
        
        async with self._process_locks[process_id]:
            step = process_state.get_step(step_id)
            if not step:
                return False
            
            # Remove from lists
            process_state.steps = [s for s in process_state.steps if s.step_id != step_id]
            process_state.step_map.pop(step_id, None)
            
            # Update dependencies in other steps
            for s in process_state.steps:
                if step_id in s.depends_on:
                    s.depends_on.remove(step_id)
                    self.repo.save_step(s)
            
            # Update resolver
            process_state.update_resolver()
            
            # Mark as skipped
            step.status = StepStatus.SKIPPED
            self.repo.save_step(step)
            
            logger.info(f"[DAG] Removed step from process {str(process_id)[:8]}")
            
            # Wake scheduler
            self._scheduler_event.set()
            
            return True
    
    async def update_dependency(self, process_id: UUID, step_id: UUID, depends_on: List[UUID]) -> bool:
        """Update step dependencies"""
        if process_id not in self.processes:
            return False
        
        process_state = self.processes[process_id]
        
        async with self._process_locks[process_id]:
            step = process_state.get_step(step_id)
            if not step:
                return False
            
            # Update dependencies
            step.depends_on = depends_on
            self.repo.save_step(step)
            
            # Validate DAG
            if not self._validate_dag(process_state.steps):
                # Rollback
                logger.error("Dependency update would create cycle - rolling back")
                return False
            
            # Update resolver
            process_state.update_resolver()
            
            logger.info(f"[DAG] Updated dependencies for step {step.syscall}")
            
            # Wake scheduler
            self._scheduler_event.set()
            
            return True
    
    def _validate_dag(self, steps: List[ProcessStep]) -> bool:
        """Validate that steps don't form cycles"""
        # Build adjacency list
        adj = {s.step_id: s.depends_on for s in steps}
        
        # Check for cycles using DFS
        visited = set()
        stack = set()
        
        def has_cycle(step_id: UUID) -> bool:
            if step_id in stack:
                return True
            if step_id in visited:
                return False
            
            visited.add(step_id)
            stack.add(step_id)
            
            for dep in adj.get(step_id, []):
                if has_cycle(dep):
                    return True
            
            stack.remove(step_id)
            return False
        
        for step in steps:
            if has_cycle(step.step_id):
                return False
        
        return True
    
    # ==================== PROCESS CONTROL ====================
    
    async def pause_process(self, process_id: UUID) -> bool:
        """Pause a process"""
        if process_id not in self.processes:
            return False
        
        self.paused_processes.add(process_id)
        
        # Pause all running steps
        process_state = self.processes[process_id]
        for step in process_state.steps:
            if step.status == StepStatus.RUNNING:
                self.paused_steps[process_id].add(step.step_id)
        
        self.event_bus.publish(Event(
            type=EventType.PROCESS_PAUSED,
            pid=process_id
        ))
        
        logger.info(f"[CONTROL] Paused process {str(process_id)[:8]}")
        return True
    
    async def resume_process(self, process_id: UUID) -> bool:
        """Resume a process"""
        if process_id not in self.processes:
            return False
        
        self.paused_processes.discard(process_id)
        self.paused_steps[process_id].clear()
        
        self.event_bus.publish(Event(
            type=EventType.PROCESS_RESUMED,
            pid=process_id
        ))
        
        # Wake scheduler
        self._scheduler_event.set()
        
        logger.info(f"[CONTROL] Resumed process {str(process_id)[:8]}")
        return True
    
    async def cancel_process(self, process_id: UUID) -> bool:
        """Cancel a process"""
        if process_id not in self.processes:
            return False
        
        self.cancelled_processes.add(process_id)
        
        # Cancel all steps
        process_state = self.processes[process_id]
        for step in process_state.steps:
            if step.status == StepStatus.RUNNING:
                await self.cancel_step(process_id, step.step_id)
        
        self.event_bus.publish(Event(
            type=EventType.PROCESS_CANCELLED,
            pid=process_id
        ))
        
        # Wake scheduler
        self._scheduler_event.set()
        
        logger.info(f"[CONTROL] Cancelled process {str(process_id)[:8]}")
        return True
    
    async def pause_step(self, process_id: UUID, step_id: UUID) -> bool:
        """Pause a specific step"""
        if process_id not in self.processes:
            return False
        
        self.paused_steps[process_id].add(step_id)
        
        self.event_bus.publish(Event(
            type=EventType.STEP_PAUSED,
            pid=process_id,
            step_id=step_id
        ))
        
        logger.info(f"[CONTROL] Paused step {str(step_id)[:8]}")
        return True
    
    async def resume_step(self, process_id: UUID, step_id: UUID) -> bool:
        """Resume a step"""
        if process_id not in self.processes:
            return False
        
        self.paused_steps[process_id].discard(step_id)
        
        self.event_bus.publish(Event(
            type=EventType.STEP_RESUMED,
            pid=process_id,
            step_id=step_id
        ))
        
        # Wake scheduler
        self._scheduler_event.set()
        
        logger.info(f"[CONTROL] Resumed step {str(step_id)[:8]}")
        return True
    
    async def cancel_step(self, process_id: UUID, step_id: UUID) -> bool:
        """Cancel a step"""
        if process_id not in self.processes:
            return False
        
        self.cancelled_steps[process_id].add(step_id)
        
        # Cancel future if running
        future = self.step_futures.get(step_id)
        if future and not future.done():
            future.cancel()
        
        # Update step status
        process_state = self.processes[process_id]
        step = process_state.get_step(step_id)
        if step:
            step.status = StepStatus.SKIPPED
            step.error = "Cancelled by user"
            self.repo.save_step(step)
        
        self.event_bus.publish(Event(
            type=EventType.STEP_CANCELLED,
            pid=process_id,
            step_id=step_id
        ))
        
        # Wake scheduler
        self._scheduler_event.set()
        
        logger.info(f"[CONTROL] Cancelled step {str(step_id)[:8]}")
        return True
    
    # ==================== HELPER METHODS ====================
    
    async def _agent_planning(self, goal: str, context: TaskContext) -> Dict:
        """Agents collaborate to create plan with scoring"""
        planning_agents = []
        for agent in agent_registry.get_all_agents():
            if "planning" in agent.capabilities:
                planning_agents.append(agent)
        
        if not planning_agents:
            from axr_core.agents.planner.planner_agent import PlannerAgent
            planner = PlannerAgent()
            return await planner.create_plan(goal, None)
        
        # Collect plans with scores
        plans = []
        for agent in planning_agents[:3]:
            try:
                plan = await agent.execute({"action": "create_plan", "goal": goal}, context)
                if plan and plan.get("steps"):
                    # Calculate score
                    steps = len(plan["steps"])
                    cost = sum(s.get("cost", 1.0) for s in plan["steps"])
                    confidence = getattr(agent, 'rating', 0.5)
                    
                    # Score = steps - cost/10 + confidence
                    score = steps - (cost / 10) + confidence
                    
                    plans.append((score, plan, agent.name))
                    
            except Exception as e:
                logger.warning(f"Agent {agent.name} planning failed: {e}")
        
        if plans:
            # Select best plan by score
            plans.sort(reverse=True)
            best_score, best_plan, agent_name = plans[0]
            logger.info(f"Selected plan from {agent_name} (score: {best_score:.2f})")
            return best_plan
        
        return {"steps": []}
    
    async def _plan_to_steps(self, process_id: UUID, plan: Dict) -> List[ProcessStep]:
        """Convert plan to ProcessStep objects"""
        steps = []
        
        for i, item in enumerate(plan.get("steps", [])):
            step = ProcessStep(
                pid=process_id,
                syscall=item["tool"],
                cost_estimate=item.get("cost", 1.0),
                priority=item.get("priority", 1),
                failure_policy=item.get("failure_policy", "retry")
            )
            
            # Add custom fields
            step.params = item.get("params", {})
            step.timeout = item.get("timeout", 300)
            
            steps.append(step)
        
        # Add dependencies
        for i, item in enumerate(plan.get("steps", [])):
            for dep_idx in item.get("depends_on", []):
                if dep_idx < len(steps):
                    steps[i].depends_on.append(steps[dep_idx].step_id)
        
        return steps
    
    async def _register_process(self, process_state: ProcessStateObject):
        """Register process with all systems"""
        process_id = process_state.process.pid
        
        self.processes[process_id] = process_state
        
        # Resource management
        self.resource_manager.register_process(
            process_id,
            ProcessResources(
                max_concurrent_steps=10,
                max_budget=process_state.process.budget_limit
            )
        )
        
        # Persistence
        self.repo.save_process(process_state.process)
        for step in process_state.steps:
            self.repo.save_step(step)
        
        # Advanced scheduling
        self.advanced_scheduler.allocate_process(process_id, "default")
        
        # Event bus
        self.event_bus.publish(Event(
            type=EventType.PROCESS_REGISTERED,
            pid=process_id,
            metadata={"goal": process_state.process.intent}
        ))
        
        logger.info(f"[PROCESS] Registered {str(process_id)[:8]} with {len(process_state.steps)} steps")
    
    async def _can_schedule_step(self, process_state: ProcessStateObject, step: ProcessStep) -> bool:

        process = process_state.process
        process_id = process.pid
        
        # Check if step is already running or dispatched
        if step.status not in [StepStatus.READY, StepStatus.PENDING]:
            return False
        
        # Check process limits
        if self._global_active_steps >= self.global_max_parallel:
            return False
        
        # Security check
        if not self.security_evaluator.allow(process, step):
            logger.warning(f"Security blocked {step.syscall}")
            step.fail("Blocked by security policy")
            self.repo.save_step(step)
            return False
        
        # Budget check
        if not self.resource_manager.can_schedule(
            process_id, step.cost_estimate, process.remaining_budget()
        ):
            return False
        
        # Quota check
        if not self.advanced_scheduler.quota_manager.can_schedule_step(
            process_id, step.cost_estimate
        ):
            return False
        
        # Worker check with cooldown
        workers = self.worker_registry.get_workers_for_tool(step.syscall)
        now = time.time()
        
        if not workers:
            # Check if any workers exist at all
            all_workers = self.worker_registry.get_live_workers()
            
            if not all_workers and now - self.last_scale_time > self.SCALE_COOLDOWN:
                # No workers at all - scale up with cooldown
                logger.info(f"[AUTOSCALE] No workers available, launching worker")
                asyncio.create_task(self.autoscaler.scale_up())
                self.last_scale_time = now
            elif not workers and all_workers:
                # Workers exist but none support this tool
                logger.debug(f"[WORKER] No workers support {step.syscall}")
            
            return False
        
        return True
    
    async def _find_agent_for_step(self, step: ProcessStep, context: TaskContext) -> Optional[BaseAgent]:
        """Find best agent using multiple criteria"""
        best_agent = None
        best_score = 0
        
        for agent in agent_registry.get_all_agents():
            score = 0
            
            # Capability match
            if step.syscall in agent.capabilities:
                score += 10
            elif any(cap in step.syscall for cap in agent.capabilities):
                score += 5
            
            # Domain match
            if hasattr(agent, 'domain') and agent.domain in step.syscall:
                score += 3
            
            # Success rate
            success_rate = self.metrics.get_agent_success_rate(agent.name)
            score += success_rate / 20  # Max 5 points
            
            # Experience
            tasks = self.metrics.agent_tasks.get(agent.name, 0)
            score += min(tasks, 5)  # Max 5 points for experience
            
            if score > best_score:
                best_score = score
                best_agent = agent
        
        return best_agent if best_score > 0 else None
    
    async def _broadcast_success(self, agent: BaseAgent, step: ProcessStep, 
                                result: Dict, context: TaskContext, duration: float):
        """Broadcast success to other agents"""
        message = AgentMessage(
            from_agent=agent.name,
            to_agent="all",
            message_type="step_succeeded",
            content={
                "step": step.syscall,
                "result": result.get("output", ""),
                "duration": duration
            }
        )
        
        process_id = UUID(context.process_id)
        if process_id not in self.agent_messages:
            self.agent_messages[process_id] = []
        self.agent_messages[process_id].append(message)
        
        # Limit message history
        if len(self.agent_messages[process_id]) > 100:
            self.agent_messages[process_id] = self.agent_messages[process_id][-100:]
    
    def _is_process_complete(self, process_state: ProcessStateObject) -> bool:
        """Check if process is complete"""
        terminal_states = {StepStatus.SUCCESS, StepStatus.FAILED, StepStatus.SKIPPED}
        return all(s.status in terminal_states for s in process_state.steps)
    
    async def _finalize_process(self, process_id: UUID):
        """Finalize process and cleanup"""
        if process_id not in self.processes:
            return
        
        process_state = self.processes[process_id]
        
        # Determine final status
        if any(s.status == StepStatus.FAILED for s in process_state.steps):
            status = "FAILED"
        else:
            status = "COMPLETED"
        
        process_state.process.finalized = True
        
        # Save checkpoint
        self.checkpoint_manager.save_checkpoint(
            process_state.process, 
            process_state.steps
        )
        
        # Publish event
        self.event_bus.publish(Event(
            type=EventType.PROCESS_COMPLETED if status == "COMPLETED" else EventType.PROCESS_FAILED,
            pid=process_id
        ))
        
        # Cleanup futures and results
        for step in process_state.steps:
            self.step_futures.pop(step.step_id, None)
            self.step_results.pop(step.step_id, None)
        
        # Remove from active processes after a delay (for queries)
        async def delayed_cleanup():
            await asyncio.sleep(300)  # Keep for 5 minutes for queries
            self.processes.pop(process_id, None)
            self._process_locks.pop(process_id, None)
            self.agent_messages.pop(process_id, None)
        
        asyncio.create_task(delayed_cleanup())
        
        logger.info(f"[PROCESS] {str(process_id)[:8]} finalized as {status}")
    
    async def _handle_process_failure(self, process_id: UUID, error: Exception):
        """Handle process failure"""
        if process_id in self.processes:
            process_state = self.processes[process_id]
            process_state.process.fail(str(error))
            process_state.process.finalized = True
            self.repo.save_process(process_state.process)
            
            self.event_bus.publish(Event(
                type=EventType.PROCESS_FAILED,
                pid=process_id,
                metadata={"error": str(error)}
            ))
    

    def _check_expired_leases(self):
        """Check for expired worker leases"""
        expired = self.lease_manager.get_expired()
        
        for process_id, step_id in expired:
            logger.warning(f"[LEASE] Step {step_id} expired")
            
            process_state = self.processes.get(process_id)
            if not process_state:
                continue
            
            step = process_state.get_step(step_id)
            if not step:
                continue
            
            # Reset step
            step.status = StepStatus.READY
            step.retries += 1
            step.assigned_worker = None
            self.repo.save_step(step)
            
            # Cancel future
            future = self.step_futures.get(step_id)
            if future and not future.done():
                future.set_exception(Exception("Lease expired"))
            
            # Release worker
            worker_id = self._lease_worker_map.get(step_id)
            if worker_id:
                self.worker_registry.release_worker(worker_id)
            
            # Cleanup mappings
            self._lease_worker_map.pop(step_id, None)
            if worker_id:
                self._worker_step_map.pop(worker_id, None)
            
            self.lease_manager.complete_lease(step_id)
            
            # Wake scheduler for retry
            self._scheduler_event.set()
    
    async def _artifact_cleanup_loop(self):
        """Periodic artifact cleanup"""
        while self._running:
            try:
                await asyncio.sleep(self.artifact_ttl)
                
                # Clean old artifacts
                cutoff = datetime.now().timestamp() - self.artifact_ttl
                # Implementation depends on artifact storage
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Artifact cleanup error: {e}")
    
    async def _wait_for_completion(self, process_id: UUID) -> Dict:
        """Wait for process completion and return results"""
        # In production, you'd use a future/callback system
        # This is simplified
        while process_id in self.processes:
            await asyncio.sleep(0.5)
        
        # Return cached results
        return {
            "process_id": str(process_id),
            "status": "completed",
            "metrics": self.metrics.get_metrics()
        }
    
    # ==================== PUBLIC API METHODS ====================
    
    async def get_process_metrics(self, process_id: UUID) -> Dict[str, Any]:
        """Get metrics for a specific process"""
        if process_id not in self.processes:
            return {}
        
        process_state = self.processes[process_id]
        steps = process_state.steps
        
        return {
            "total_steps": len(steps),
            "completed": sum(1 for s in steps if s.status == StepStatus.SUCCESS),
            "failed": sum(1 for s in steps if s.status == StepStatus.FAILED),
            "skipped": sum(1 for s in steps if s.status == StepStatus.SKIPPED),
            "running": sum(1 for s in steps if s.status == StepStatus.RUNNING),
            "pending": sum(1 for s in steps if s.status == StepStatus.PENDING),
            "budget_used": process_state.process.budget_used,
            "budget_limit": process_state.process.budget_limit,
            "duration": (datetime.now() - process_state.created_at).total_seconds(),
            "active_parallel": sum(1 for s in steps if s.status == StepStatus.RUNNING)
        }
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """Get system-wide metrics"""
        base_metrics = self.metrics.get_metrics()
        
        return {
            **base_metrics,
            "global_active_steps": self._global_active_steps,
            "global_max_parallel": self.global_max_parallel,
            "total_processes": len(self.processes),
            "active_processes": self._active_process_count,
            "queued_processes": self.process_queue.qsize(),
            "workers": len(self.worker_registry.get_live_workers()),
            "paused_processes": len(self.paused_processes),
            "cancelled_processes": len(self.cancelled_processes),
            "pending_retries": len(self.retry_heap),
            "step_futures": len(self.step_futures)
        }
    
    def _normalize_tool_name(self, tool_name: str) -> str:
        """
        Normalize tool names from LLM to match security policy and registry
        
        Examples:
        "SCAN Tool" -> "scan"
        "Git Tool" -> "git"
        "Test Tool" -> "test"
        "Security Scan" -> "security_scan"
        "Send Email" -> "send_email"
        """
        if not tool_name:
            return tool_name
        
        # Convert to lowercase
        normalized = tool_name.lower()
        
        # Remove "tool" suffix
        normalized = normalized.replace(' tool', '')
        
        # Replace spaces with underscores
        normalized = normalized.replace(' ', '_')
        
        # Remove any other special characters
        normalized = ''.join(c for c in normalized if c.isalnum() or c in ['_', '.'])
       
        # Map to actual tool names
        tool_mapping = {
            'scan': 'sast.scan',
            'security_scan': 'sast.scan',
            'vulnerability_scan': 'sast.scan',
            'git': 'git.clone',
            'git_clone': 'git.clone',
            'test': 'test.run',
            'testing': 'test.run',
            'build': 'build',
            'deploy': 'deploy.service',
            'email': 'send_email',
            'send_email': 'send_email',
            'report': 'report.generate',
            'report_generation': 'report.generate',
            'dependency': 'dependency.check',
            'dependency_check': 'dependency.check',
            'lint': 'lint',
        }
        
        # Return mapped name or normalized original
        return tool_mapping.get(normalized, normalized)