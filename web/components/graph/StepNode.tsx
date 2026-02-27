// components/graph/StepNode.tsx
'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import * as Tooltip from '@radix-ui/react-tooltip';

const statusColors: Record<string, string> = {
  PENDING: "#6b7280",
  RUNNING: "#3b82f6",
  SUCCESS: "#10b981",
  FAILED: "#ef4444",
  RETRY: "#f59e0b",
  SKIPPED: "#8b5cf6",
};

export default function StepNode({ data }: NodeProps) {
  const color = statusColors[data.status] || "#6b7280";
  const isRunning = data.status === "RUNNING";

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div
            className={`px-4 py-2 rounded-xl text-white text-sm shadow-lg transition-all hover:scale-105 ${
              isRunning ? "animate-pulse ring-2 ring-blue-400" : ""
            }`}
            style={{ backgroundColor: color }}
          >
            <Handle 
              type="target" 
              position={Position.Top} 
              className="w-2 h-2 bg-white border-2 border-zinc-900" 
            />
            <div className="font-semibold">{data.label}</div>
            <div className="text-xs opacity-80 mt-1">{data.status}</div>
            <Handle 
              type="source" 
              position={Position.Bottom} 
              className="w-2 h-2 bg-white border-2 border-zinc-900" 
            />
          </div>
        </Tooltip.Trigger>

        <Tooltip.Content 
          className="bg-zinc-900 text-xs px-2 py-1 rounded-lg shadow-xl border border-zinc-700 text-white z-50"
          sideOffset={5}
        >
          {data.label} • {data.status}
          <Tooltip.Arrow className="fill-zinc-900" />
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}