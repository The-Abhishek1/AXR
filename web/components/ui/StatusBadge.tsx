const colors: Record<string, string> = {
  READY: "bg-gray-500",
  RUNNING: "bg-blue-500",
  TERMINATED: "bg-emerald-500",
  FAILED: "bg-red-500",
  BLOCKED: "bg-yellow-500",
  PAUSED: "bg-orange-500",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-2 py-1 text-xs rounded-md text-white ${
        colors[status] || "bg-gray-500"
      }`}
    >
      {status}
    </span>
  );
}