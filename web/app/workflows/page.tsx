import Link from "next/link";
import { getProcesses } from "@/lib/api";
import StatusBadge from "@/components/ui/StatusBadge";
import BudgetBar from "@/components/ui/BudgetBar";

export default async function WorkflowsPage() {
  const data = await getProcesses();

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">AXR Processes</h1>

      <div className="grid gap-4">
        {data.processes.map((proc: any) => (
          <Link
            key={proc.pid}
            href={`/workflows/${proc.pid}`}
            className="p-4 bg-zinc-900 rounded-xl hover:bg-zinc-800 border border-zinc-800"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="font-mono text-sm text-zinc-300">{proc.pid}</div>
              <StatusBadge status={proc.state} />
            </div>

            <div className="text-xs text-zinc-400 mb-2">
              Steps: {proc.steps.length}
            </div>

            <BudgetBar used={proc.budget_used} limit={proc.budget_limit} />
          </Link>
        ))}
      </div>
    </div>
  );
}