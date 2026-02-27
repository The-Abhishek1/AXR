"use client";

import { Handle, Position } from "reactflow";
import * as Tooltip from "@radix-ui/react-tooltip";

const statusColors: Record<string, string> = {
  PENDING: "#6b7280",
  RUNNING: "#3b82f6",
  SUCCESS: "#10b981",
  FAILED: "#ef4444",
  RETRY: "#f59e0b",
};

export default function StepNode({ data }: any) {
  const color = statusColors[data.status] || "#6b7280";
  const isRunning = data.status === "RUNNING";

return (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div
          className={`px-4 py-2 rounded-xl text-white text-sm shadow-md transition ${
            data.status === "RUNNING"
              ? "animate-pulse ring-2 ring-blue-400"
              : ""
          }`}
          style={{ backgroundColor: color }}
        >
          <Handle type="target" position={Position.Top} />
          <div className="font-semibold">{data.label}</div>
          <div className="text-xs opacity-80">{data.status}</div>
          <Handle type="source" position={Position.Bottom} />
        </div>
      </Tooltip.Trigger>

      <Tooltip.Content className="bg-zinc-800 text-xs px-2 py-1 rounded shadow">
        {data.label} • {data.status}
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
);
}