// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Activity, 
  Cpu, 
  CheckCircle, 
  XCircle,
  ArrowUp,
  ArrowDown,
  Clock,
  Zap,
  Server,
  Brain,
  Sparkles,
  TrendingUp,
  Users,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api, Process, Worker } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

// Mock chart data
const chartData = [
  { time: '00:00', value: 12 },
  { time: '04:00', value: 18 },
  { time: '08:00', value: 24 },
  { time: '12:00', value: 32 },
  { time: '16:00', value: 28 },
  { time: '20:00', value: 20 },
];

export default function DashboardPage() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [processesData, workersData] = await Promise.all([
        api.getProcesses(),
        api.getWorkers()
      ]);
      setProcesses(processesData.processes);
      setWorkers(workersData.workers);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    activeProcesses: processes.filter(p => p.state === 'RUNNING').length,
    totalAgents: workers.length,
    tasksCompleted: processes.filter(p => p.state === 'TERMINATED').length,
    failedProcesses: processes.filter(p => p.state === 'FAILED').length,
  };

  const recentProcesses = processes.slice(0, 5);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'RUNNING': return 'bg-emerald-500';
      case 'TERMINATED': return 'bg-blue-500';
      case 'FAILED': return 'bg-rose-500';
      case 'PENDING': return 'bg-amber-500';
      default: return 'bg-zinc-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'RUNNING': return 'success';
      case 'TERMINATED': return 'info';
      case 'FAILED': return 'destructive';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">
            <span className="gradient-text-primary">Dashboard</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm lg:text-base">
            Welcome back to AXR Control Panel
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 px-3 py-1.5 neon-border">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Live System
          </Badge>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs lg:text-sm text-zinc-400">Active Processes</p>
                <p className="text-xl lg:text-3xl font-bold text-white mt-1">{stats.activeProcesses}</p>
                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" />
                  12% vs last period
                </p>
              </div>
              <div className="p-2 lg:p-3 rounded-xl bg-indigo-500/10">
                <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs lg:text-sm text-zinc-400">Total Agents</p>
                <p className="text-xl lg:text-3xl font-bold text-white mt-1">{stats.totalAgents}</p>
                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" />
                  8% vs last period
                </p>
              </div>
              <div className="p-2 lg:p-3 rounded-xl bg-indigo-500/10">
                <Brain className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs lg:text-sm text-zinc-400">Tasks Completed</p>
                <p className="text-xl lg:text-3xl font-bold text-white mt-1">{stats.tasksCompleted}</p>
                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" />
                  23% vs last period
                </p>
              </div>
              <div className="p-2 lg:p-3 rounded-xl bg-indigo-500/10">
                <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs lg:text-sm text-zinc-400">Failed</p>
                <p className="text-xl lg:text-3xl font-bold text-white mt-1">{stats.failedProcesses}</p>
                <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                  <ArrowDown className="w-3 h-3" />
                  5% vs last period
                </p>
              </div>
              <div className="p-2 lg:p-3 rounded-xl bg-rose-500/10">
                <XCircle className="w-4 h-4 lg:w-5 lg:h-5 text-rose-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts & Recent */}
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
        {/* System Activity */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-base lg:text-lg">
                <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-400" />
                System Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 lg:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: '1px solid #6366f1',
                        borderRadius: '12px',
                        color: '#fff',
                        boxShadow: '0 8px 32px rgba(99,102,241,0.2)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      fill="url(#colorIndigo)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Processes */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2 text-base lg:text-lg">
                  <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-400" />
                  Recent Processes
                </CardTitle>
                <Link href="/workflows" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  View All →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-slate-800/50 rounded-lg animate-pulse" />
                  ))
                ) : recentProcesses.length > 0 ? (
                  recentProcesses.map((process, idx) => (
                    <Link key={process.pid} href={`/workflows/${process.pid}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-indigo-500/10 hover:border-indigo-500/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn('w-2 h-2 rounded-full', getStatusColor(process.state))} />
                          <div>
                            <p className="font-mono text-xs lg:text-sm text-white">
                              {process.pid.slice(0, 8)}...{process.pid.slice(-4)}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {process.steps.length} steps • {formatDate(new Date())}
                            </p>
                          </div>
                        </div>
                        <Badge variant={getStatusBadge(process.state)}>
                          {process.state}
                        </Badge>
                      </motion.div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Layers className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-zinc-400">No processes found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-base lg:text-lg">
              <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'New Task', icon: Zap, href: '/tasks/new', gradient: 'from-amber-500 to-orange-500' },
                { label: 'View Agents', icon: Brain, href: '/agents', gradient: 'from-pink-500 to-rose-500' },
                { label: 'Workers', icon: Server, href: '/workers', gradient: 'from-cyan-500 to-blue-500' },
                { label: 'Monitoring', icon: Activity, href: '/monitoring', gradient: 'from-purple-500 to-indigo-500' },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href}>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex flex-col items-center gap-2 p-3 lg:p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-all border border-indigo-500/10 hover:border-indigo-500/30 group"
                    >
                      <div className={cn(
                        'p-2 rounded-lg bg-gradient-to-br',
                        action.gradient,
                        'shadow-lg'
                      )}>
                        <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                      <span className="text-xs lg:text-sm text-white font-medium">{action.label}</span>
                    </motion.button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Metrics Footer */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'AI Agents', value: stats.totalAgents, icon: Brain, color: 'text-pink-400' },
          { label: 'Workers', value: workers.length, icon: Server, color: 'text-cyan-400' },
          { label: 'Active Tasks', value: stats.activeProcesses, icon: Zap, color: 'text-amber-400' },
          { label: 'System Health', value: '98.5%', icon: Activity, color: 'text-emerald-400' },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="bg-slate-900/30 border-indigo-500/10">
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-2">
                  <Icon className={cn('w-4 h-4', metric.color)} />
                  <div>
                    <p className="text-xs text-zinc-400">{metric.label}</p>
                    <p className="text-sm font-semibold text-white">{metric.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>
    </motion.div>
  );
}