'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BudgetBar from '@/components/ui/BudgetBar';
import { getProcesses } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Search, Filter, RefreshCw, Layers, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function WorkflowsPage() {
  const { processes, setProcesses } = useAppStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProcesses = async () => {
    setIsRefreshing(true);
    try {
      const data = await getProcesses();
      setProcesses(data.processes);
    } catch (error) {
      toast.error('Failed to fetch processes');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredProcesses = processes.filter((proc) => {
    const matchesSearch = proc.pid.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || proc.state === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: processes.length,
    running: processes.filter((p) => p.state === 'RUNNING').length,
    completed: processes.filter((p) => p.state === 'TERMINATED').length,
    failed: processes.filter((p) => p.state === 'FAILED').length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            Workflows
          </h1>
          <p className="text-zinc-400 mt-1">Monitor and manage your automation workflows</p>
        </div>
        <button
          onClick={fetchProcesses}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/20">
                <Layers className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-zinc-400">Total Workflows</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-500/20">
                <div className="w-5 h-5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.running}</p>
                <p className="text-xs text-zinc-400">Running</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-500/20">
                <Layers className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-zinc-400">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.failed}</p>
                <p className="text-xs text-zinc-400">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by PID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <option value="all">All Status</option>
          <option value="RUNNING">Running</option>
          <option value="TERMINATED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      {/* Process Grid */}
      <motion.div
        layout
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence>
          {filteredProcesses.map((proc) => (
            <motion.div
              key={proc.pid}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Link href={`/workflows/${proc.pid}`}>
                <Card className="hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-mono text-sm text-zinc-300 group-hover:text-emerald-400 transition-colors">
                          {proc.pid.slice(0, 8)}...{proc.pid.slice(-4)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getStatusVariant(proc.state)}>
                            {proc.state}
                          </Badge>
                          <span className="text-xs text-zinc-400">
                            {proc.steps.length} steps
                          </span>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(proc.state)} animate-pulse`} />
                    </div>

                    <BudgetBar used={proc.budget_used} limit={proc.budget_limit} />

                    <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                      <span>Budget: {proc.budget_used}/{proc.budget_limit}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProcesses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400">No workflows found</p>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors = {
    RUNNING: 'bg-blue-500',
    TERMINATED: 'bg-emerald-500',
    FAILED: 'bg-red-500',
    PENDING: 'bg-zinc-500',
  };
  return colors[status as keyof typeof colors] || 'bg-zinc-500';
}

function getStatusVariant(status: string): any {
  const variants = {
    RUNNING: 'info',
    TERMINATED: 'success',
    FAILED: 'destructive',
    PENDING: 'default',
  };
  return variants[status as keyof typeof variants] || 'default';
}