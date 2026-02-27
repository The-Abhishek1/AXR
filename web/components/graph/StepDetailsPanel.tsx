// components/graph/StepDetailsPanel.tsx
'use client';

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Step {
  step_id: string;
  syscall: string;
  status: string;
  priority: number;
}

interface StepDetailsPanelProps {
  step: Step | null;
  stepList: Step[];
}

export default function StepDetailsPanel({ step, stepList }: StepDetailsPanelProps) {
  if (!step) {
    return (
      <Card className="h-full">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <p className="text-zinc-400 text-center">
            Click a step to view details
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      PENDING: "bg-zinc-500",
      RUNNING: "bg-blue-500",
      SUCCESS: "bg-emerald-500",
      FAILED: "bg-red-500",
      RETRY: "bg-yellow-500",
    };
    return colors[status] || "bg-zinc-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full"
    >
      <Card className="h-full">
        <CardContent className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-white">{step.syscall}</h2>
            <Badge variant="outline" className="text-xs">
              Step Details
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Step ID</span>
              <span className="font-mono text-sm text-white">
                {step.step_id.slice(0, 8)}...
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Status</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(step.status)}`} />
                <span className="text-emerald-400">{step.status}</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Priority</span>
              <span className="text-white">{step.priority}</span>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-sm font-medium text-zinc-400 mb-3">Execution Order</h3>
            <div className="space-y-2">
              {stepList?.map((s, i) => (
                <motion.div
                  key={s.step_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    s.step_id === step.step_id ? 'bg-emerald-500/10 border border-emerald-500/30' : ''
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(s.status)}`} />
                  <span className="text-sm flex-1 text-white">{s.syscall}</span>
                  <span className="text-xs text-zinc-400">{s.status}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}