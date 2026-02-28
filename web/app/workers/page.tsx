// app/workers/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Server,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Cpu,
  Zap,
  HardDrive,
  Wifi,
  WifiOff,
  ChevronDown,
  Grid3x3,
  List,
  Gauge,
  Thermometer,
  Network
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, Worker } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

export default function WorkersPage() {
  const router = useRouter();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'load' | 'latency'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchWorkers();
    const interval = setInterval(fetchWorkers, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchWorkers = async () => {
    try {
      const data = await api.getWorkers();
      setWorkers(data.workers);
    } catch (error) {
      toast.error('Failed to fetch workers');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort workers
  const filteredWorkers = workers
    .filter((w) => {
      const matchesSearch = 
        w.worker_id.toLowerCase().includes(search.toLowerCase()) ||
        w.tools.some(t => t.toLowerCase().includes(search.toLowerCase()));
      
      const matchesFilter = filter === 'all' || 
        (filter === 'live' && w.is_live) ||
        (filter === 'dead' && !w.is_live) ||
        (filter === 'high-load' && (w.running / w.capacity) > 0.8) ||
        (filter === 'medium-load' && (w.running / w.capacity) > 0.5 && (w.running / w.capacity) <= 0.8) ||
        (filter === 'low-load' && (w.running / w.capacity) <= 0.5);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.worker_id.localeCompare(b.worker_id)
          : b.worker_id.localeCompare(a.worker_id);
      }
      if (sortBy === 'load') {
        const loadA = a.capacity > 0 ? (a.running / a.capacity) * 100 : 0;
        const loadB = b.capacity > 0 ? (b.running / b.capacity) * 100 : 0;
        return sortOrder === 'asc' ? loadA - loadB : loadB - loadA;
      }
      if (sortBy === 'latency') {
        return sortOrder === 'asc'
          ? a.latency_ms - b.latency_ms
          : b.latency_ms - a.latency_ms;
      }
      return 0;
    });

  const stats = {
    total: workers.length,
    live: workers.filter(w => w.is_live).length,
    dead: workers.filter(w => !w.is_live).length,
    totalCapacity: workers.reduce((acc, w) => acc + w.capacity, 0),
    activeTasks: workers.reduce((acc, w) => acc + w.running, 0),
    avgLatency: workers.length > 0
      ? Math.round(workers.reduce((acc, w) => acc + w.latency_ms, 0) / workers.length)
      : 0,
  };

  const generateChartData = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      time: i,
      load: Math.random() * 100,
    }));
  };

  const getLoadColor = (running: number, capacity: number) => {
    const load = capacity > 0 ? (running / capacity) * 100 : 0;
    if (load > 80) return 'text-rose-400';
    if (load > 50) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getLoadBarColor = (running: number, capacity: number) => {
    const load = capacity > 0 ? (running / capacity) * 100 : 0;
    if (load > 80) return 'bg-rose-500';
    if (load > 50) return 'bg-amber-500';
    return 'bg-emerald-500';
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
            <span className="gradient-text-primary">Execution Workers</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm lg:text-base">
            Monitor and manage your task execution workers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/workers/add')}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Worker
          </Button>
          
          <button
            onClick={fetchWorkers}
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
                <p className="text-xs text-zinc-400">Total Workers</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Server className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Live</p>
                <p className="text-xl font-bold text-emerald-400">{stats.live}</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Wifi className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-rose-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Dead</p>
                <p className="text-xl font-bold text-rose-400">{stats.dead}</p>
              </div>
              <div className="p-2 rounded-lg bg-rose-500/10">
                <WifiOff className="w-4 h-4 text-rose-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Capacity</p>
                <p className="text-xl font-bold text-amber-400">{stats.totalCapacity}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Gauge className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Avg Latency</p>
                <p className="text-xl font-bold text-indigo-400">{stats.avgLatency}ms</p>
              </div>
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={item} className="space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
            <Input
              type="text"
              placeholder="Search workers by ID or tool..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-900/50 border-indigo-500/20 focus:border-indigo-500/40"
            />
          </div>

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
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="all">All Workers</option>
                    <option value="live">Live</option>
                    <option value="dead">Dead</option>
                    <option value="high-load">High Load (&gt;80%)</option>
                    <option value="medium-load">Medium Load (50-80%)</option>
                    <option value="low-load">Low Load (&lt;50%)</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="name">Sort by ID</option>
                    <option value="load">Sort by Load</option>
                    <option value="latency">Sort by Latency</option>
                  </select>

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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-sm text-zinc-400">
          Showing {filteredWorkers.length} of {workers.length} workers • {stats.activeTasks} active tasks
        </div>
      </motion.div>

      {/* Workers Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-slate-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredWorkers.length === 0 ? (
        <motion.div
          variants={item}
          className="text-center py-12 bg-slate-900/30 rounded-lg border border-indigo-500/20"
        >
          <Server className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No workers found</p>
          <Button
            onClick={() => router.push('/workers/add')}
            className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add your first worker
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
          {filteredWorkers.map((worker) => {
            const loadPercent = worker.capacity > 0 
              ? (worker.running / worker.capacity) * 100 
              : 0;
            const chartData = generateChartData();
            const loadColor = getLoadColor(worker.running, worker.capacity);
            const loadBarColor = getLoadBarColor(worker.running, worker.capacity);

            return (
              <motion.div key={worker.worker_id} variants={item}>
                <Link href={`/workers/${worker.worker_id}`}>
                  <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer group h-full">
                    <CardContent className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'p-2 rounded-lg',
                            worker.is_live ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                          )}>
                            <Cpu className={cn(
                              'w-5 h-5',
                              worker.is_live ? 'text-emerald-400' : 'text-rose-400'
                            )} />
                          </div>
                          <div>
                            <p className="font-mono text-sm text-white group-hover:text-indigo-400 transition-colors">
                              {worker.worker_id.slice(0, 8)}...{worker.worker_id.slice(-4)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={worker.is_live ? 'success' : 'destructive'}>
                                {worker.is_live ? 'LIVE' : 'DEAD'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {worker.latency_ms}ms
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Activity className="w-4 h-4 text-zinc-400" />
                      </div>

                      {/* Load Bar */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-400">Load</span>
                          <span className={cn('font-medium', loadColor)}>
                            {worker.running}/{worker.capacity}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${loadPercent}%` }}
                            transition={{ duration: 0.5 }}
                            className={cn('h-full rounded-full', loadBarColor)}
                          />
                        </div>
                      </div>

                      {/* Mini Chart */}
                      <div className="h-12 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <Line
                              type="monotone"
                              dataKey="load"
                              stroke={worker.is_live ? '#6366f1' : '#6b7280'}
                              strokeWidth={2}
                              dot={false}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #6366f1',
                                borderRadius: '8px',
                                fontSize: '10px',
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Tools */}
                      <div className="mb-4">
                        <p className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          Tools ({worker.tools.length})
                        </p>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                          {worker.tools.slice(0, 5).map((tool, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-slate-800/50">
                              {tool.length > 15 ? `${tool.slice(0, 12)}...` : tool}
                            </Badge>
                          ))}
                          {worker.tools.length > 5 && (
                            <Badge variant="outline" className="text-xs bg-slate-800/50">
                              +{worker.tools.length - 5}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-indigo-500/20 pt-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Last seen: {formatDate(worker.last_seen * 1000)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Network className="w-3 h-3" />
                          {worker.latency_ms}ms
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        // List View
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {filteredWorkers.map((worker) => {
            const loadPercent = worker.capacity > 0 
              ? (worker.running / worker.capacity) * 100 
              : 0;
            const loadColor = getLoadColor(worker.running, worker.capacity);

            return (
              <motion.div key={worker.worker_id} variants={item}>
                <Link href={`/workers/${worker.worker_id}`}>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/30 border border-indigo-500/20 hover:border-indigo-500/40 transition-all group">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn(
                        'p-2 rounded-lg',
                        worker.is_live ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                      )}>
                        <Cpu className={cn(
                          'w-5 h-5',
                          worker.is_live ? 'text-emerald-400' : 'text-rose-400'
                        )} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-mono text-sm text-white group-hover:text-indigo-400 transition-colors">
                            {worker.worker_id}
                          </p>
                          <Badge variant={worker.is_live ? 'success' : 'destructive'}>
                            {worker.is_live ? 'Live' : 'Dead'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex-1 max-w-xs">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={cn('h-full rounded-full', loadColor.replace('text', 'bg'))}
                                  style={{ width: `${loadPercent}%` }}
                                />
                              </div>
                              <span className={cn('text-xs font-medium', loadColor)}>
                                {worker.running}/{worker.capacity}
                              </span>
                            </div>
                          </div>
                          
                          <span className="text-xs text-zinc-400">
                            {worker.tools.length} tools
                          </span>
                          
                          <span className="text-xs text-indigo-400">
                            {worker.latency_ms}ms
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronDown className="w-4 h-4 text-indigo-400 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}