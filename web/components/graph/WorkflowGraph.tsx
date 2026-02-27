// components/graph/WorkflowGraph.tsx
'use client';

import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  Node,
  Edge,
  OnNodeClick
} from 'reactflow';
import 'reactflow/dist/style.css';
import StepNode from './StepNode';

const nodeTypes = {
  stepNode: StepNode,
};

interface WorkflowGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: OnNodeClick;
}

export default function WorkflowGraph({ nodes, edges, onNodeClick }: WorkflowGraphProps) {
  return (
    <div className="w-full h-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        className="bg-zinc-950"
      >
        <Background color="#27272a" gap={16} />
        <Controls className="bg-zinc-900 border-zinc-800 text-white [&_button]:hover:bg-zinc-800" />
        <MiniMap
          nodeColor={(node) => {
            const status = node.data?.status;
            if (status === "SUCCESS") return "#10b981";
            if (status === "RUNNING") return "#3b82f6";
            if (status === "FAILED") return "#ef4444";
            return "#6b7280";
          }}
          className="bg-zinc-900 border border-zinc-800"
        />
      </ReactFlow>
    </div>
  );
}