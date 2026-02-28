// app/workers/[workerId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Server,
  RefreshCw,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  Zap,
  Cpu,
  HardDrive,
  Wifi,
  WifiOff,
  Gauge,
  Thermometer,
  Network,
  Download,
  Settings,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api, Worker } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line
} from 'recharts';
import toast from 'react-hot-toast';

export default function WorkerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workerId = params.workerId as string;

  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'tasks'>('overview');

  useEffect(() => {
    fetchWorker();
    const interval = setInterval(fetchWorker, 5000);
    return () => clearInterval(interval);
  }, [workerId]);

  const fetchWorker = async () => {
    try {
      const data = await api.getWorker(workerId);
      setWorker(data);
    } catch (error) {
      toast.error('Failed to fetch worker details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mock data for charts
  const performanceData = Array.from({ length: 24 }, (_, i) => ({
    time: `${i}:00`,
    cpu: Math.floor(Math.random() * 60) + 20,
    memory: Math.floor(Math.random() * 50) + 30,
    tasks: Math.floor(Math.random() * 8) + 1,
  }));

  const taskHistory = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    time: new Date(Date.now() - i * 3600000).toLocaleTimeString(),
    task: `Task-${Math.floor(Math.random() * 1000)}`,
    duration: Math.floor(Math.random() * 5000) + 500,
    status: Math.random() > 0.2 ? 'success' : 'failed',
  }));

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-32 bg-slate-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <Card className="bg-slate-900/50 border-indigo-500/20 max-w-md">
          <CardContent className="p-8 text-center">
            <Server className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Worker Not Found</h2>
            <p className="text-zinc-400 mb-4">The requested worker could not be found.</p>
            <Button onClick={() => router.push('/workers')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Workers
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const loadPercent = worker.capacity > 0 
    ? (worker.running / worker.capacity) * 100 
    : 0;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Back Navigation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-indigo-400" />
        </button>
        <span className="text-zinc-400">/</span>
        <Link href="/workers" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">
          Workers
        </Link>
        <span className="text-zinc-400">/</span>
        <span className="text-sm text-white font-mono">{worker?.worker_id?.slice(0, 8)}...</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            'p-3 rounded-xl',
            worker.is_live ? 'bg-emerald-500/10' : 'bg-rose-500/10'
          )}>
            <Server className={cn(
              'w-8 h-8',
              worker.is_live ? 'text-emerald-400' : 'text-rose-400'
            )} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text-primary">
                Worker Details
              </h1>
              <Badge variant={worker.is_live ? 'success' : 'destructive'}>
                {worker.is_live ? 'Live' : 'Offline'}
              </Badge>
            </div>
            <p className="text-sm text-zinc-400 font-mono">{worker.worker_id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/workers/${workerId}/settings`)}
            className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
          <Button
            variant="outline"
            onClick={() => {/* Delete worker */}}
            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </Button>
          <button
            onClick={() => {
              setRefreshing(true);
              fetchWorker();
            }}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            <RefreshCw className={cn('w-5 h-5 text-indigo-400', refreshing && 'animate-spin')} />
          </button>
        </div>
      </motion.div>

      {/* Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
      >
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Activity className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Status</p>
                <p className="text-lg font-semibold capitalize text-white">
                  {worker.is_live ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Gauge className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Load</p>
                <p className="text-lg font-semibold text-white">{loadPercent.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Tasks</p>
                <p className="text-lg font-semibold text-white">{worker.running}/{worker.capacity}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Latency</p>
                <p className="text-lg font-semibold text-white">{worker.latency_ms}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-b border-indigo-500/20"
      >
        <div className="flex gap-6">
          {['overview', 'metrics', 'tasks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                'pb-3 text-sm font-medium capitalize transition-colors relative',
                activeTab === tab
                  ? 'text-indigo-400'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Worker Info */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  Worker Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-zinc-400">Worker ID</p>
                    <p className="text-sm font-mono text-white">{worker.worker_id}</p>
                  </div>
                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-zinc-400">Last Seen</p>
                    <p className="text-sm text-white">{formatDate(worker.last_seen * 1000)}</p>
                  </div>
                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-zinc-400">Capacity</p>
                    <p className="text-sm text-white">{worker.capacity} tasks</p>
                  </div>
                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-zinc-400">Running Tasks</p>
                    <p className="text-sm text-white">{worker.running}</p>
                  </div>
                </div>

                {/* Load Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Current Load</span>
                    <span className={cn(
                      'font-medium',
                      loadPercent > 80 ? 'text-rose-400' : 'text-emerald-400'
                    )}>
                      {loadPercent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${loadPercent}%` }}
                      transition={{ duration: 0.5 }}
                      className={cn(
                        'h-full rounded-full',
                        loadPercent > 80 ? 'bg-rose-500' : 'bg-emerald-500'
                      )}
                    />
                  </div>
                </div>

                {/* Tools */}
                <div>
                  <p className="text-sm text-zinc-400 mb-2">Supported Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {worker.tools.map((tool, i) => (
                      <Badge key={i} variant="outline" className="bg-slate-800/50">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Performance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={(performanceData || []).slice(0, 12)}>
                      <defs>
                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#71717a" />
                      <YAxis stroke="#71717a" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #6366f1',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="cpu"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fill="url(#colorCpu)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'metrics' && (
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-indigo-400" />
                System Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <XAxis dataKey="time" stroke="#71717a" />
                    <YAxis stroke="#71717a" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #6366f1',
                        borderRadius: '8px',
                      }}
                    />
                    <Line type="monotone" dataKey="cpu" stroke="#6366f1" strokeWidth={2} />
                    <Line type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} />
                    <Line type="monotone" dataKey="tasks" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'tasks' && (
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                Recent Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {taskHistory.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {task.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <div>
                        <p className="text-sm text-white">{task.task}</p>
                        <p className="text-xs text-zinc-400">Duration: {task.duration}ms</p>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500">{task.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}