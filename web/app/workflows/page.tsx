// app/workflows/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Workflow,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  StopCircle,
  ChevronDown,
  Grid3x3,
  List,
  Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BudgetBar from '@/components/ui/BudgetBar';
import { api, Process } from '@/lib/api';
import { cn, formatDate, getStatusColor, getStatusVariant } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WorkflowsPage() {
  const router = useRouter();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch processes
  useEffect(() => {
    fetchProcesses();
    const interval = setInterval(fetchProcesses, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchProcesses = async () => {
    try {
      const data = await api.getProcesses();
      setProcesses(data.processes);
    } catch (error) {
      toast.error('Failed to fetch processes');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort processes
  const filteredProcesses = processes
    .filter((p) => {
      const matchesSearch = p.pid.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' || p.state === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' ? -1 : 1;
      }
      if (sortBy === 'name') {
        return sortOrder === 'desc' 
          ? b.pid.localeCompare(a.pid)
          : a.pid.localeCompare(b.pid);
      }
      if (sortBy === 'status') {
        return sortOrder === 'desc'
          ? b.state.localeCompare(a.state)
          : a.state.localeCompare(b.state);
      }
      return 0;
    });

  // Stats
  const stats = {
    total: processes.length,
    running: processes.filter(p => p.state === 'RUNNING').length,
    completed: processes.filter(p => p.state === 'TERMINATED').length,
    failed: processes.filter(p => p.state === 'FAILED').length,
    paused: processes.filter(p => p.state === 'PAUSED').length,
    pending: processes.filter(p => p.state === 'PENDING').length,
  };

  // Bulk actions
  const handleBulkAction = async (action: 'pause' | 'resume' | 'cancel') => {
    if (selectedProcesses.length === 0) {
      toast.error('No processes selected');
      return;
    }

    try {
      await Promise.all(
        selectedProcesses.map(pid => 
          action === 'pause' ? api.pauseProcess(pid) :
          action === 'resume' ? api.resumeProcess(pid) :
          api.cancelProcess(pid)
        )
      );
      toast.success(`${selectedProcesses.length} processes ${action}ed`);
      setSelectedProcesses([]);
      fetchProcesses();
    } catch (error) {
      toast.error(`Failed to ${action} processes`);
    }
  };

  // Toggle selection
  const toggleSelect = (pid: string) => {
    setSelectedProcesses(prev =>
      prev.includes(pid)
        ? prev.filter(p => p !== pid)
        : [...prev, pid]
    );
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">
            <span className="gradient-text-primary">Workflows</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm lg:text-base">
            Monitor and manage your automation workflows
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/tasks/new')}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
          
          <button
            onClick={fetchProcesses}
            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-indigo-400" />
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4"
      >
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Total</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Workflow className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Running</p>
                <p className="text-xl font-bold text-emerald-400">{stats.running}</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <PlayCircle className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Completed</p>
                <p className="text-xl font-bold text-blue-400">{stats.completed}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <CheckCircle className="w-4 h-4 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-rose-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Failed</p>
                <p className="text-xl font-bold text-rose-400">{stats.failed}</p>
              </div>
              <div className="p-2 rounded-lg bg-rose-500/10">
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Paused</p>
                <p className="text-xl font-bold text-amber-400">{stats.paused}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <PauseCircle className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={item} className="space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
            <Input
              type="text"
              placeholder="Search by PID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-900/50 border-indigo-500/20 focus:border-indigo-500/40"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'px-4 py-2 rounded-lg border transition-all flex items-center gap-2',
              showFilters
                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                : 'bg-slate-900/50 border-indigo-500/20 text-zinc-400 hover:text-indigo-400'
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-lg border border-indigo-500/20">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded transition-colors',
                viewMode === 'grid'
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-zinc-400 hover:text-indigo-400'
              )}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded transition-colors',
                viewMode === 'list'
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-zinc-400 hover:text-indigo-400'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-slate-900/30 rounded-lg border border-indigo-500/20 space-y-3">
                <div className="flex flex-wrap gap-3">
                  {/* Status Filter */}
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="all">All Status</option>
                    <option value="RUNNING">Running</option>
                    <option value="TERMINATED">Completed</option>
                    <option value="FAILED">Failed</option>
                    <option value="PAUSED">Paused</option>
                    <option value="PENDING">Pending</option>
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                    <option value="status">Sort by Status</option>
                  </select>

                  {/* Sort Order */}
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/10 transition-colors flex items-center gap-2"
                  >
                    <ChevronDown className={cn(
                      'w-4 h-4 transition-transform',
                      sortOrder === 'desc' && 'rotate-180'
                    )} />
                    <span className="text-sm">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                  </button>
                </div>

                {/* Bulk Actions */}
                {selectedProcesses.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-indigo-500/20">
                    <span className="text-sm text-zinc-400">
                      {selectedProcesses.length} selected
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('pause')}
                      className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                    >
                      <PauseCircle className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('resume')}
                      className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('cancel')}
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    >
                      <StopCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="text-sm text-zinc-400">
          Showing {filteredProcesses.length} of {processes.length} workflows
        </div>
      </motion.div>

      {/* Processes Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredProcesses.length === 0 ? (
        <motion.div
          variants={item}
          className="text-center py-12 bg-slate-900/30 rounded-lg border border-indigo-500/20"
        >
          <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No workflows found</p>
          <Button
            onClick={() => router.push('/tasks/new')}
            className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create your first workflow
          </Button>
        </motion.div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {filteredProcesses.map((process) => (
            <motion.div key={process.pid} variants={item}>
              <Link href={`/workflows/${process.pid}`}>
                <Card className={cn(
                  'bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer group',
                  selectedProcesses.includes(process.pid) && 'ring-2 ring-indigo-500'
                )}>
                  <CardContent className="p-5">
                    {/* Checkbox for bulk actions */}
                    <div className="absolute top-3 right-3">
                      <input
                        type="checkbox"
                        checked={selectedProcesses.includes(process.pid)}
                        onChange={(e) => {
                          e.preventDefault();
                          toggleSelect(process.pid);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-indigo-500/30 bg-slate-900 text-indigo-500 focus:ring-indigo-500/50"
                      />
                    </div>

                    <div className="flex items-start gap-3 mb-3">
                      <div className={cn('w-2 h-2 mt-2 rounded-full', getStatusColor(process.state))} />
                      <div className="flex-1">
                        <p className="font-mono text-sm text-white group-hover:text-indigo-400 transition-colors">
                          {process.pid.slice(0, 8)}...{process.pid.slice(-4)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getStatusVariant(process.state)}>
                            {process.state}
                          </Badge>
                          <span className="text-xs text-zinc-400">
                            {process.steps.length} steps
                          </span>
                        </div>
                      </div>
                    </div>

                    <BudgetBar used={process.budget_used} limit={process.budget_limit} />

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">
                        Created {formatDate(new Date())}
                      </span>
                      <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        View Details →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        // List View
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {filteredProcesses.map((process) => (
            <motion.div key={process.pid} variants={item}>
              <Link href={`/workflows/${process.pid}`}>
                <div className={cn(
                  'flex items-center justify-between p-4 rounded-lg bg-slate-900/30 border border-indigo-500/20 hover:border-indigo-500/40 transition-all group',
                  selectedProcesses.includes(process.pid) && 'ring-2 ring-indigo-500'
                )}>
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedProcesses.includes(process.pid)}
                      onChange={(e) => {
                        e.preventDefault();
                        toggleSelect(process.pid);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-indigo-500/30 bg-slate-900 text-indigo-500"
                    />
                    
                    <div className={cn('w-2 h-2 rounded-full', getStatusColor(process.state))} />
                    
                    <div className="flex-1">
                      <p className="font-mono text-sm text-white group-hover:text-indigo-400 transition-colors">
                        {process.pid}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant={getStatusVariant(process.state)}>
                          {process.state}
                        </Badge>
                        <span className="text-xs text-zinc-400">
                          {process.steps.length} steps
                        </span>
                        <span className="text-xs text-zinc-400">
                          Budget: {process.budget_used}/{process.budget_limit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-400">
                      {formatDate(new Date())}
                    </span>
                    <ChevronDown className="w-4 h-4 text-indigo-400 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}