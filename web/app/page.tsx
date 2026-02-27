// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Activity, 
  Cpu, 
  TrendingUp, 
  Clock, 
  Layers,
  ArrowUp,
  ArrowDown,
  Zap,
  Server,
  Shield,
  GitBranch,
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { getProcesses } from '@/lib/api';
import { formatDate, getStatusColor, getStatusVariant, cn } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';

const chartData = [
  { time: '00:00', processes: 12, agents: 8, cpu: 45, memory: 60 },
  { time: '04:00', processes: 18, agents: 10, cpu: 52, memory: 65 },
  { time: '08:00', processes: 24, agents: 12, cpu: 78, memory: 72 },
  { time: '12:00', processes: 32, agents: 14, cpu: 82, memory: 80 },
  { time: '16:00', processes: 28, agents: 13, cpu: 74, memory: 75 },
  { time: '20:00', processes: 20, agents: 11, cpu: 58, memory: 68 },
];

const stats = [
  { 
    label: 'Active Processes', 
    value: '24', 
    icon: Activity, 
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    change: '+12%',
    trend: 'up' as const
  },
  { 
    label: 'Total Agents', 
    value: '12', 
    icon: Cpu, 
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    change: '+8%',
    trend: 'up' as const
  },
  { 
    label: 'Tasks Completed', 
    value: '1,423', 
    icon: TrendingUp, 
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    change: '+23%',
    trend: 'up' as const
  },
  { 
    label: 'Avg Response Time', 
    value: '234ms', 
    icon: Clock, 
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    change: '-5%',
    trend: 'down' as const
  },
];

const quickActions = [
  { label: 'Create Workflow', icon: Zap, color: 'text-emerald-400', href: '/workflows/new' },
  { label: 'Deploy Agent', icon: Server, color: 'text-blue-400', href: '/agents/deploy' },
  { label: 'View Analytics', icon: BarChart3, color: 'text-purple-400', href: '/monitoring' },
  { label: 'Security Scan', icon: Shield, color: 'text-rose-400', href: '/security' },
  { label: 'Git Ops', icon: GitBranch, color: 'text-cyan-400', href: '/gitops' },
];

export default function DashboardPage() {
  const { processes, setProcesses } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('processes');
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProcesses();
        setProcesses(data.processes);
      } catch (error) {
        toast.error('Failed to fetch processes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [setProcesses]);

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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-zinc-400 mt-2">Welcome back to AXR Control Panel</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success" className="px-3 py-1.5">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            System Online
          </Badge>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUp : ArrowDown;
          const trendColor = stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400';
          
          return (
            <motion.div key={stat.label} variants={item}>
              <Card className="group hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2 text-white">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-3">
                        <TrendIcon className={cn('w-3 h-3', trendColor)} />
                        <span className={cn('text-xs font-medium', trendColor)}>
                          {stat.change}
                        </span>
                        <span className="text-xs text-zinc-500">vs last period</span>
                      </div>
                    </div>
                    <div className={cn(
                      'p-3 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
                      stat.bgColor
                    )}>
                      <Icon className={cn('w-6 h-6', stat.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  System Activity
                </CardTitle>
                <div className="flex items-center gap-2">
                  {['processes', 'agents', 'cpu'].map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setSelectedMetric(metric)}
                      className={cn(
                        'px-3 py-1 text-xs rounded-lg capitalize transition-all',
                        selectedMetric === metric
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      )}
                    >
                      {metric}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorProcesses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAgents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="time" 
                      stroke="#71717a"
                      tick={{ fill: '#71717a', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#71717a"
                      tick={{ fill: '#71717a', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                      labelStyle={{ color: '#a1a1aa' }}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke={
                        selectedMetric === 'processes' ? '#10b981' :
                        selectedMetric === 'agents' ? '#3b82f6' : '#f59e0b'
                      }
                      strokeWidth={2}
                      fill={`url(#color${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Processes */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  Recent Processes
                </CardTitle>
                <Link 
                  href="/workflows"
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  View All →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-zinc-800/50 rounded-lg animate-pulse" />
                  ))
                ) : processes.slice(0, 5).length > 0 ? (
                  processes.slice(0, 5).map((process, idx) => (
                    <motion.div
                      key={process.pid}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Link href={`/workflows/${process.pid}`}>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/80 transition-all duration-200 group border border-transparent hover:border-emerald-500/30">
                          <div className="flex items-center gap-4">
                            <div className={cn('w-2.5 h-2.5 rounded-full', getStatusColor(process.state))} />
                            <div>
                              <p className="font-mono text-sm group-hover:text-emerald-400 transition-colors text-white">
                                {process.pid.slice(0, 8)}...{process.pid.slice(-4)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-zinc-500">
                                  {process.steps.length} steps
                                </span>
                                <span className="text-xs text-zinc-600">•</span>
                                <span className="text-xs text-zinc-500">
                                  {formatDate(new Date())}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={getStatusVariant(process.state)}>
                            {process.state}
                          </Badge>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">No processes found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* System Health Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid gap-6 lg:grid-cols-3"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">System Health</p>
                <p className="text-xl font-bold text-emerald-400">98.5%</p>
                <p className="text-xs text-zinc-500 mt-1">All systems operational</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Active Alerts</p>
                <p className="text-xl font-bold text-yellow-400">3</p>
                <p className="text-xs text-zinc-500 mt-1">2 critical, 1 warning</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Server className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Uptime</p>
                <p className="text-xl font-bold text-blue-400">99.9%</p>
                <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href}>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full flex flex-col items-center gap-3 p-4 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/80 transition-all duration-200 border border-transparent hover:border-emerald-500/30 group"
                    >
                      <div className={cn(
                        'p-3 rounded-xl transition-all duration-300 group-hover:scale-110',
                        action.color === 'text-emerald-400' && 'bg-emerald-500/10',
                        action.color === 'text-blue-400' && 'bg-blue-500/10',
                        action.color === 'text-purple-400' && 'bg-purple-500/10',
                        action.color === 'text-rose-400' && 'bg-rose-500/10',
                        action.color === 'text-cyan-400' && 'bg-cyan-500/10',
                      )}>
                        <Icon className={cn('w-6 h-6', action.color)} />
                      </div>
                      <span className="text-sm font-medium text-center text-white">{action.label}</span>
                    </motion.button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}