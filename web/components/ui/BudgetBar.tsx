export default function BudgetBar({
  used,
  limit,
}: {
  used: number;
  limit: number;
}) {
  const percent = (used / limit) * 100;

  return (
    <div>
      <div className="text-xs text-zinc-400 mb-1">
        Budget: {used} / {limit}
      </div>
      <div className="w-full h-2 bg-zinc-800 rounded">
        <div
          className="h-2 bg-emerald-500 rounded"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}