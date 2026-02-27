export interface AXRStep {
  step_id: string;
  syscall: string;
  status: string;
  priority: number;
}

export interface AXRProcess {
  pid: string;
  state: string;
  budget_used: number;
  budget_limit: number;
  steps: AXRStep[];
}

export interface AXRProcessList {
  count: number;
  processes: AXRProcess[];
}

export type StepStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "RETRY";