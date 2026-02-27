import dagre from "dagre"
import { Node, Edge } from "reactflow";

export function mapStepsToGraph(steps: any[]) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR" });

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  steps.forEach((step) => {
    g.setNode(step.step_id, { width: 180, height: 60 });
  });

  for (let i = 1; i < steps.length; i++) {
    g.setEdge(steps[i - 1].step_id, steps[i].step_id);
  }

  dagre.layout(g);

  steps.forEach((step) => {
    const node = g.node(step.step_id);

    nodes.push({
      id: step.step_id,
      position: { x: node.x, y: node.y },
      data: {
        label: step.syscall,
        status: step.status,
      },
      type: "stepNode",
    });
  });

  for (let i = 1; i < steps.length; i++) {
    edges.push({
      id: `${steps[i - 1].step_id}-${steps[i].step_id}`,
      source: steps[i - 1].step_id,
      target: steps[i].step_id,
      animated: true,
    });
  }

  return { nodes, edges };
}