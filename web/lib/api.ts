// lib/api.ts
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

export interface Process {
  pid: string;
  state: string;
  budget_used: number;
  budget_limit: number;
  steps: ProcessStep[];
}

export interface ProcessStep {
  step_id: string;
  syscall: string;
  status: string;
  priority: number;
  retries?: number;
  cost_estimate?: number;
  worker?: string | null;
  assigned_worker?: string | null;
}

export interface StepDetail extends ProcessStep {
  pid: string;
  failure_policy?: string;
  lease_active?: boolean;
  output?: any;
}

export interface Agent {
  agent_id: string;
  name: string;
  model: string;
  capabilities: string[];
  status: 'idle' | 'planning' | 'busy';
  plans_created: number;
  success_rate: number;
  avg_planning_time: number;
  last_seen: number;
  is_live: boolean;
}

export interface Worker {
  worker_id: string;
  tools: string[];
  capacity: number;
  running: number;
  last_seen: number;
  is_live: boolean;
  latency_ms: number;
}

export interface DashboardMetrics {
  total_processes: number;
  worker_count: number;
  active_steps_per_process: Record<string, number>;
  workers: Record<string, any>;
}

export interface Tool {
  name: string;
  description: string;
  // ... other tool properties
}

export interface Event {
  event_type: string;
  step_id: string | null;
  timestamp: string;
  metadata: any;
}

// API Functions
export const api = {
  // Processes
  async getProcesses(): Promise<{ count: number; processes: Process[] }> {
    const res = await axios.get(`${API_BASE}/processes`);
    return res.data;
  },

  async getProcess(pid: string): Promise<Process> {
    const res = await axios.get(`${API_BASE}/processes/${pid}`);
    return res.data;
  },

  async cancelProcess(pid: string): Promise<{ status: string; pid: string }> {
    const res = await axios.get(`${API_BASE}/processes/${pid}/cancel`);
    return res.data;
  },

  async pauseProcess(pid: string): Promise<{ status: string; pid: string }> {
    const res = await axios.get(`${API_BASE}/processes/${pid}/pause`);
    return res.data;
  },

  async resumeProcess(pid: string): Promise<{ status: string; pid: string }> {
    const res = await axios.get(`${API_BASE}/processes/${pid}/resume`);
    return res.data;
  },

  // Steps
  async getStep(stepId: string): Promise<StepDetail> {
    const res = await axios.get(`${API_BASE}/processes/steps/${stepId}`);
    return res.data;
  },

  async retryStep(stepId: string): Promise<{ message: string; step_id: string; retries: number; pid: string }> {
    const res = await axios.get(`${API_BASE}/processes/steps/${stepId}/retry`);
    return res.data;
  },

  // Tasks
  async submitTask(goal: string): Promise<{ pid: string; plan: any; step_count: number }> {
    const res = await axios.post(`${API_BASE}/tasks`, { goal });
    return res.data;
  },

  async getTask(pid: string): Promise<any> {
    const res = await axios.get(`${API_BASE}/tasks/${pid}`);
    return res.data;
  },

  // Agents
  async getAgents(): Promise<{ count: number; agents: Agent[] }> {
    const res = await axios.get(`${API_BASE}/agents`);
    return res.data;
  },

  async getAgent(agentId: string): Promise<Agent> {
    const res = await axios.get(`${API_BASE}/agents/${agentId}`);
    return res.data;
  },

  async createPlan(goal: string, agentId?: string): Promise<any> {
    const res = await axios.post(`${API_BASE}/agents/plan`, { goal, agent_id: agentId });
    return res.data;
  },

  // Workers
  async getWorkers(): Promise<{ count: number; workers: Worker[] }> {
    const res = await axios.get(`${API_BASE}/workers`);
    return res.data;
  },

  async getWorker(workerId: string): Promise<Worker> {
    const res = await axios.get(`${API_BASE}/workers/${workerId}`);
    return res.data;
  },

  // Tools
  async getTools(): Promise<{ tools: Tool[] }> {
    const res = await axios.get(`${API_BASE}/tools`);
    return res.data;
  },

  // Dashboard
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const res = await axios.get(`${API_BASE}/dashboard`);
    return res.data;
  },

  // Events
  async getEvents(pid: string): Promise<Event[]> {
    const res = await axios.get(`${API_BASE}/events/${pid}`);
    return res.data;
  },

  // Policies
  async getPolicy(): Promise<{ policy: string }> {
    const res = await axios.get(`${API_BASE}/policies`);
    return res.data;
  },

  // Health
  async healthCheck(): Promise<{ status: string; workers: number; agents: number; processes: number }> {
    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  }
};

// Re-export for backward compatibility
export const getProcesses = api.getProcesses;
export const getProcess = api.getProcess;
export const submitTask = api.submitTask;
// ... etc