"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);

  const fetchAgents = async () => {
    const res = await axios.get("http://127.0.0.1:8000/agents");
    setAgents(res.data.agents);
  };

  function latencyColor(ms: number) {
    if (ms < 1000) return "text-emerald-400";
    if (ms < 5000) return "text-yellow-400";
    return "text-red-400";
  }

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 3000); // live polling
    return () => clearInterval(interval);
  }, []);

 return (
  <div className="p-6 text-white">
    <h1 className="text-xl font-bold mb-6">Agents</h1>

    <div className="grid grid-cols-3 gap-4">
      {agents.map((agent) => {
        const capacityPercent =
          agent.capacity > 0 ? Math.min(100, (1 / agent.capacity) * 100) : 0;

        return (
          <div
            key={agent.agent_id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3
                       transition-all duration-200 hover:-translate-y-1
                       hover:shadow-[0_0_0_1px_#10b98144]"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <div className="font-mono text-sm">{agent.agent_id}</div>

              <div
                className={`text-xs px-2 py-1 rounded font-medium border ${
                  agent.is_live
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/20 text-red-400 border-red-500/30"
                }`}
              >
                {agent.is_live ? "LIVE" : "DEAD"}
              </div>
            </div>

            {/* LATENCY */}
            <div>
              <div className="text-xs text-zinc-400">Latency</div>
              <div className={`text-sm ${latencyColor(agent.latency_ms)}`}>
                {agent.latency_ms} ms
              </div>
            </div>

            {/* CAPACITY */}
            <div>
              <div className="text-xs text-zinc-400 mb-1">Capacity</div>
              <div className="w-full bg-zinc-800 h-2 rounded">
                <div
                  className="bg-emerald-500 h-2 rounded transition-all"
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
            </div>

            {/* TOOLS */}
            <div>
              <div className="text-xs text-zinc-400 mb-1">Tools</div>
              <div className="flex flex-wrap gap-1">
                {agent.tools?.map((tool: any, idx: number) => {
                  const toolName =
                    typeof tool === "string" ? tool : tool.name;

                  return (
                    <span
                      key={`${agent.agent_id}-${toolName}-${idx}`}
                      className="text-xs bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded"
                    >
                      🛠 {toolName}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
}