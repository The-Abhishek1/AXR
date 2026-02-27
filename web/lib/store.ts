import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Agent {
  agent_id: string;
  tools: string[];
  capacity: number;
  is_live: boolean;
  latency_ms: number;
  running: number;
}

interface Process {
  pid: string;
  state: string;
  budget_used: number;
  budget_limit: number;
  steps: any[];
}

interface AppState {
  agents: Agent[];
  processes: Process[];
  selectedProcess: Process | null;
  selectedStep: any | null;
  isLoading: boolean;
  error: string | null;
  setAgents: (agents: Agent[]) => void;
  setProcesses: (processes: Process[]) => void;
  setSelectedProcess: (process: Process | null) => void;
  setSelectedStep: (step: any | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>()(
  devtools((set) => ({
    agents: [],
    processes: [],
    selectedProcess: null,
    selectedStep: null,
    isLoading: false,
    error: null,
    setAgents: (agents) => set({ agents }),
    setProcesses: (processes) => set({ processes }),
    setSelectedProcess: (process) => set({ selectedProcess: process }),
    setSelectedStep: (step) => set({ selectedStep: step }),
    setIsLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
  }))
);