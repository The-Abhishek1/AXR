"use client";

export default function StepDetailsPanel({ step , stepList}: any) {
  if (!step) {
    return (
      <div className="w-80 bg-zinc-900/80 backdrop-blur border border-zinc-800 p-4 rounded-xl text-sm text-gray-400">
        Click a step to view details
      </div>
    );
  }

  return (
    <div className="w-80 bg-zinc-900/80 backdrop-blur border border-zinc-800 p-4 rounded-xl">
      <h2 className="text-lg font-semibold mb-3">{step.syscall}</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-400">Step ID</span>
          <span className="font-mono text-xs">{step.step_id}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">Status</span>
          <span className="text-emerald-400">{step.status}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-zinc-400">Priority</span>
          <span>{step.priority}</span>
        </div>
      </div>
      <div className="mt-6">
      <div className="text-xs text-zinc-400 mb-2">Execution Order</div>
      <div className="space-y-2">
        {stepList?.map((s: any, i: number) => (
          <div
            key={s.step_id}
            className="flex items-center gap-2 text-xs"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="truncate">{s.syscall}</span>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}