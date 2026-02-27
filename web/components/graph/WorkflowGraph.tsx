"use client";

import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import StepNode from "./StepNode";


const nodeTypes = {
  stepNode: StepNode,
};

export default function WorkflowGraph({
  nodes,
  edges,
  onNodeClick,
}: any) {
  return (
    <div className="w-full h-[650px] bg-zinc-950 border border-zinc-800 rounded-xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const status = node.data?.status;
            if (status === "SUCCESS") return "#10b981";
            if (status === "RUNNING") return "#3b82f6";
            if (status === "FAILED") return "#ef4444";
            return "#6b7280";
          }}
          className="bg-zinc-900"
        />
        <Controls />
      </ReactFlow>
    </div>
  );
}