import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-56 border-r border-zinc-800 bg-zinc-950 p-4 space-y-2">
      <Link href="/workflows" className="block text-zinc-300 hover:text-white">
        Workflows
      </Link>
      <Link href="/agents" className="block text-zinc-300 hover:text-white">
        Agents
      </Link>
      <Link href="/retry-queue" className="block text-zinc-300 hover:text-white">
        Retry Queue
      </Link>
      <Link href="/monitoring" className="block text-zinc-300 hover:text-white">
        Monitoring
      </Link>
    </div>
  );
}