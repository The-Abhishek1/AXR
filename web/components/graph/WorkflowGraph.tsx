// components/graph/WorkflowGraph.tsx
'use client';

import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  OnNodeClick,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import StepNode from './StepNode';
import { theme } from '@/lib/theme';

const nodeTypes = {
  stepNode: StepNode,
};

interface WorkflowGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick: OnNodeClick;
}

export default function WorkflowGraph({ nodes: initialNodes, edges: initialEdges, onNodeClick }: WorkflowGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background 
          color={theme.colors.border} 
          gap={16} 
          size={1}
          className="opacity-25"
        />
        <Controls 
          className="bg-zinc-900 border-zinc-700 text-white shadow-xl [&_button]:hover:bg-zinc-800 [&_button]:border-zinc-700"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={(node) => {
            const status = node.data?.status;
            return theme.statusColors[status as keyof typeof theme.statusColors] || theme.colors.muted;
          }}
          className="bg-zinc-900/90 border border-zinc-800 rounded-lg shadow-xl backdrop-blur-sm"
          maskColor="rgba(0, 0, 0, 0.3)"
        />
      </ReactFlow>
    </div>
  );
}