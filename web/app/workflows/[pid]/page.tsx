"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WorkflowGraph from "@/components/graph/WorkflowGraph";
import StepDetailsPanel from "@/components/graph/StepDetailsPanel";
import { getProcesses } from "@/lib/api";
import { mapStepsToGraph } from "@/lib/graph-mapper";
import StatusBadge from "@/components/ui/StatusBadge";
import BudgetBar from "@/components/ui/BudgetBar";
import * as Resizable from "react-resizable-panels";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { PanelResizeHandle } from "react-resizable-panels";


export default function WorkflowDetailPage() {
  const params = useParams();
  const pid = params.pid as string;

  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [selectedStep, setSelectedStep] = useState<any>(null);
  const [process, setProcess] = useState<any>(null);

useEffect(() => {
  let interval: NodeJS.Timeout;

  async function fetchData() {
    const data = await getProcesses();
    const proc = data.processes.find(
      (p: any) => p.pid === decodeURIComponent(pid)
    );

    if (!proc) return;

    setProcess(proc);
    setSteps(proc.steps);

    const { nodes, edges } = mapStepsToGraph(proc.steps);
    setNodes(nodes);
    setEdges(edges);
  }

  fetchData(); // initial load
  interval = setInterval(fetchData, 2000); // 🔁 poll every 2s

  return () => clearInterval(interval);
}, [pid]);

  function handleNodeClick(_: any, node: any) {
    const step = steps.find((s) => s.step_id === node.id);
    setSelectedStep(step);
  }
  
  
if (!process) {
  return (
    <div className="p-6 space-y-4">
      <Skeleton height={80} />
      <Skeleton height={120} />
      <Skeleton height={500} />
    </div>
  );
}

return (
    <Resizable.Group direction="horizontal" className="p-6 text-white">
      {/* LEFT */}
      <Resizable.Panel defaultSize={70} minSize={50}>
        <div className="pr-3">
              {/* LEFT COLUMN */}
              <div className="flex-1">
                {/* Process Header Card */}
                <div className="mb-4 p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-mono text-sm">{process.pid}</div>
                    <StatusBadge status={process.state} />
                  </div>
                  <BudgetBar
                    used={process.budget_used}
                    limit={process.budget_limit}
                  />
                </div>

                {/* 🔢 Metrics Row */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                    <div className="text-xs text-zinc-400">Steps</div>
                    <div className="text-xl font-bold">
                      {process.steps.length}
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                    <div className="text-xs text-zinc-400">Budget Used</div>
                    <div className="text-xl font-bold">
                      {process.budget_used}
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                    <div className="text-xs text-zinc-400">Budget Limit</div>
                    <div className="text-xl font-bold">
                      {process.budget_limit}
                    </div>
                  </div>
                </div>

                {/* Graph */}
                <WorkflowGraph
                  nodes={nodes}
                  edges={edges}
                  onNodeClick={handleNodeClick}
                />
              </div>
          </div>
        </Resizable.Panel>

        <Resizable.Separator className="w-1 bg-zinc-800 hover:bg-emerald-500 transition" />

            {/* RIGHT */}
        <Resizable.Panel defaultSize={30} minSize={20}>
          <StepDetailsPanel step={selectedStep} stepList={steps}/>
        </Resizable.Panel>
      </Resizable.Group>
);
}