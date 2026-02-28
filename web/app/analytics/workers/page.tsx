// app/analytics/workers/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Server,
  Cpu,
  HardDrive,
  Network,
  Activity,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Star,
  Award,
  Target,
  BarChart3,
  LineChart,
  PieChart,
  Gauge,
  Thermometer,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  MoreVertical,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Filter,
  Calendar,
  Wifi,
  WifiOff,
  Loader,
  Hash,
  Globe,
  Shield,
  Database,
  Cloud,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart as ReLineChart,
  Line,
  PieChart as RePieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { format, subDays, subHours } from 'date-fns';
import toast from 'react-hot-toast';

// Mock worker analytics data
const mockWorkerAnalytics = {
  overview: {
    totalWorkers: 24,
    activeWorkers: 18,
    idleWorkers: 4,
    offlineWorkers: 2,
    totalCapacity: 240,
    currentLoad: 156,
    avgUtilization: 65,
    totalTasksProcessed: 156789,
    avgTaskDuration: 234,
    successRate: 97.8,
    errorRate: 2.2,
  },
  workerPerformance: [
    {
      id: 'worker-1',
      name: 'worker-1.prod.axr.io',
      region: 'us-east-1',
      status: 'active',
      load: 78,
      capacity: 10,
      running: 8,
      tasksCompleted: 23456,
      successRate: 98.5,
      avgResponseTime: 189,
      cpu: 65,
      memory: 72,
      disk: 45,
      network: 34,
      uptime: 99.95,
      lastSeen: new Date().toISOString(),
      tools: ['git.clone', 'sast.scan', 'deploy.service'],
    },
    {
      id: 'worker-2',
      name: 'worker-2.prod.axr.io',
      region: 'us-east-1',
      status: 'active',
      load: 92,
      capacity: 10,
      running: 9,
      tasksCompleted: 21345,
      successRate: 97.2,
      avgResponseTime: 245,
      cpu: 82,
      memory: 88,
      disk: 52,
      network: 67,
      uptime: 99.92,
      lastSeen: new Date().toISOString(),
      tools: ['git.clone', 'lint', 'test.run'],
    },
    {
      id: 'worker-3',
      name: 'worker-3.prod.axr.io',
      region: 'us-west-2',
      status: 'active',
      load: 45,
      capacity: 10,
      running: 4,
      tasksCompleted: 18765,
      successRate: 99.1,
      avgResponseTime: 156,
      cpu: 38,
      memory: 42,
      disk: 28,
      network: 23,
      uptime: 99.98,
      lastSeen: new Date().toISOString(),
      tools: ['git.clone', 'build', 'deploy.service'],
    },
    {
      id: 'worker-4',
      name: 'worker-4.staging.axr.io',
      region: 'eu-west-1',
      status: 'active',
      load: 56,
      capacity: 8,
      running: 4,
      tasksCompleted: 15678,
      successRate: 96.8,
      avgResponseTime: 278,
      cpu: 45,
      memory: 51,
      disk: 34,
      network: 29,
      uptime: 99.87,
      lastSeen: new Date().toISOString(),
      tools: ['git.clone', 'sast.scan', 'lint'],
    },
    {
      id: 'worker-5',
      name: 'worker-5.staging.axr.io',
      region: 'ap-southeast-1',
      status: 'idle',
      load: 12,
      capacity: 8,
      running: 1,
      tasksCompleted: 12345,
      successRate: 98.9,
      avgResponseTime: 167,
      cpu: 18,
      memory: 22,
      disk: 15,
      network: 8,
      uptime: 99.93,
      lastSeen: subHours(new Date(), 2).toISOString(),
      tools: ['git.clone', 'test.run'],
    },
    {
      id: 'worker-6',
      name: 'worker-6.dev.axr.io',
      region: 'us-east-1',
      status: 'offline',
      load: 0,
      capacity: 4,
      running: 0,
      tasksCompleted: 8765,
      successRate: 95.6,
      avgResponseTime: 312,
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0,
      uptime: 98.45,
      lastSeen: subHours(new Date(), 5).toISOString(),
      tools: ['git.clone', 'lint'],
    },
  ],
  loadDistribution: [
    { time: '00:00', load: 45, capacity: 240, active: 12 },
    { time: '02:00', load: 38, capacity: 240, active: 10 },
    { time: '04:00', load: 42, capacity: 240, active: 11 },
    { time: '06:00', load: 58, capacity: 240, active: 14 },
    { time: '08:00', load: 89, capacity: 240, active: 18 },
    { time: '10:00', load: 134, capacity: 240, active: 22 },
    { time: '12:00', load: 156, capacity: 240, active: 24 },
    { time: '14:00', load: 178, capacity: 240, active: 24 },
    { time: '16:00', load: 167, capacity: 240, active: 23 },
    { time: '18:00', load: 145, capacity: 240, active: 21 },
    { time: '20:00', load: 112, capacity: 240, active: 19 },
    { time: '22:00', load: 78, capacity: 240, active: 15 },
  ],
  regionDistribution: [
    { name: 'US East', workers: 8, load: 78, capacity: 80, color: '#6366f1' },
    { name: 'US West', workers: 5, load: 45, capacity: 50, color: '#8b5cf6' },
    { name: 'EU West', workers: 4, load: 56, capacity: 40, color: '#d946ef' },
    { name: 'AP Southeast', workers: 3, load: 12, capacity: 30, color: '#ec4899' },
    { name: 'AP Northeast', workers: 2, load: 34, capacity: 20, color: '#f43f5e' },
    { name: 'SA East', workers: 2, load: 23, capacity: 20, color: '#f97316' },
  ],
  toolDistribution: [
    { name: 'git.clone', workers: 24, load: 89, percentage: 35, color: '#6366f1' },
    { name: 'sast.scan', workers: 18, load: 67, percentage: 26, color: '#8b5cf6' },
    { name: 'deploy.service', workers: 15, load: 45, percentage: 18, color: '#d946ef' },
    { name: 'lint', workers: 22, load: 56, percentage: 22, color: '#ec4899' },
    { name: 'test.run', workers: 16, load: 34, percentage: 13, color: '#f43f5e' },
    { name: 'build', workers: 12, load: 28, percentage: 11, color: '#f97316' },
  ],
  capacityPlanning: {
    currentCapacity: 240,
    peakLoad: 178,
    avgLoad: 112,
    recommendedCapacity: 200,
    projectedGrowth: '+15%',
    nextMilestone: 276,
    utilizationThresholds: {
      warning: 80,
      critical: 90,
    },
  },
  healthMetrics: [
    { worker: 'worker-1', cpu: 65, memory: 72, disk: 45, latency: 189, status: 'healthy' },
    { worker: 'worker-2', cpu: 82, memory: 88, disk: 52, latency: 245, status: 'warning' },
    { worker: 'worker-3', cpu: 38, memory: 42, disk: 28, latency: 156, status: 'healthy' },
    { worker: 'worker-4', cpu: 45, memory: 51, disk: 34, latency: 278, status: 'healthy' },
    { worker: 'worker-5', cpu: 18, memory: 22, disk: 15, latency: 167, status: 'idle' },
    { worker: 'worker-6', cpu: 0, memory: 0, disk: 0, latency: 0, status: 'offline' },
  ],
  alerts: [
    {
      id: 'a1',
      severity: 'warning',
      worker: 'worker-2',
      message: 'High CPU usage (82%) on worker-2',
      timestamp: new Date().toISOString(),
      value: 82,
      threshold: 80,
    },
    {
      id: 'a2',
      severity: 'warning',
      worker: 'worker-2',
      message: 'High memory usage (88%) on worker-2',
      timestamp: subHours(new Date(), 1).toISOString(),
      value: 88,
      threshold: 85,
    },
    {
      id: 'a3',
      severity: 'critical',
      worker: 'worker-6',
      message: 'Worker offline for 5 hours',
      timestamp: subHours(new Date(), 5).toISOString(),
      value: 300,
      threshold: 60,
    },
  ],
  recommendations: [
    {
      id: 'r1',
      title: 'Scale US East Region',
      description: 'Workers in US East are at 97.5% capacity',
      impact: 'high',
      savings: 'Reduce queue time by 45%',
      action: 'Add 2 workers',
    },
    {
      id: 'r2',
      title: 'Optimize worker-2',
      description: 'High resource usage detected, consider redistributing load',
      impact: 'medium',
      savings: 'Improve response time by 30%',
      action: 'Rebalance tasks',
    },
    {
      id: 'r3',
      title: 'Replace offline worker',
      description: 'worker-6 has been offline for 5 hours',
      impact: 'high',
      savings: 'Restore 4% capacity',
      action: 'Restart worker',
    },
  ],
  performanceTrends: {
    dailyGrowth: '+5.2%',
    weeklyGrowth: '+12.8%',
    monthlyGrowth: '+34.5%',
    efficiencyGain: '+8.3%',
  },
};

const timeRanges = [
  { id: '1h', name: 'Last Hour' },
  { id: '6h', name: 'Last 6 Hours' },
  { id: '24h', name: 'Last 24 Hours' },
  { id: '7d', name: 'Last 7 Days' },
  { id: '30d', name: 'Last 30 Days' },
];

const statusFilters = [
  { id: 'all', name: 'All Workers' },
  { id: 'active', name: 'Active' },
  { id: 'idle', name: 'Idle' },
  { id: 'offline', name: 'Offline' },
];

export default function WorkerAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('24h');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'capacity'>('overview');
  const [showAlerts, setShowAlerts] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('load');

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'text-emerald-400 bg-emerald-500/10';
      case 'idle': return 'text-amber-400 bg-amber-500/10';
      case 'offline': return 'text-rose-400 bg-rose-500/10';
      case 'healthy': return 'text-emerald-400 bg-emerald-500/10';
      case 'warning': return 'text-amber-400 bg-amber-500/10';
      case 'degraded': return 'text-rose-400 bg-rose-500/10';
      default: return 'text-zinc-400 bg-zinc-500/10';
    }
  };

  const getLoadColor = (load: number) => {
    if (load >= 90) return 'text-rose-400';
    if (load >= 70) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getProgressColor = (value: number) => {
    if (value >= 90) return 'bg-rose-500';
    if (value >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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

  // Filter workers based on status
  const filteredWorkers = mockWorkerAnalytics.workerPerformance.filter(worker => {
    if (statusFilter === 'all') return true;
    return worker.status === statusFilter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">
            <span className="gradient-text-primary">Worker Analytics</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm lg:text-base">
            Monitor and optimize worker performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            {timeRanges.map((range) => (
              <option key={range.id} value={range.id}>{range.name}</option>
            ))}
          </select>

          <button
            onClick={() => toast.success('Worker data refreshed')}
            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-indigo-400" />
          </button>

          <button
            onClick={() => toast.success('Worker report downloaded')}
            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            <Download className="w-5 h-5 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs text-zinc-400">Total Workers</p>
                <p className="text-lg font-bold text-white">{mockWorkerAnalytics.overview.totalWorkers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs text-zinc-400">Active Workers</p>
                <p className="text-lg font-bold text-emerald-400">{mockWorkerAnalytics.overview.activeWorkers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs text-zinc-400">Avg Utilization</p>
                <p className="text-lg font-bold text-amber-400">{mockWorkerAnalytics.overview.avgUtilization}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs text-zinc-400">Success Rate</p>
                <p className="text-lg font-bold text-purple-400">{mockWorkerAnalytics.overview.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Performance Trends */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-zinc-400">Daily Growth</p>
                <p className="text-lg font-semibold text-emerald-400">{mockWorkerAnalytics.performanceTrends.dailyGrowth}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Weekly Growth</p>
                <p className="text-lg font-semibold text-emerald-400">{mockWorkerAnalytics.performanceTrends.weeklyGrowth}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Monthly Growth</p>
                <p className="text-lg font-semibold text-emerald-400">{mockWorkerAnalytics.performanceTrends.monthlyGrowth}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Efficiency Gain</p>
                <p className="text-lg font-semibold text-emerald-400">{mockWorkerAnalytics.performanceTrends.efficiencyGain}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Load Distribution Chart */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <LineChart className="w-5 h-5 text-indigo-400" />
                Load Distribution
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-indigo-500/30">
                  Current Load: {mockWorkerAnalytics.overview.currentLoad}/{mockWorkerAnalytics.overview.totalCapacity}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={mockWorkerAnalytics.loadDistribution}>
                  <XAxis dataKey="time" stroke="#71717a" />
                  <YAxis yAxisId="left" stroke="#71717a" />
                  <YAxis yAxisId="right" orientation="right" stroke="#71717a" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #6366f1',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="load"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.3}
                    name="Load"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="active"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Active Workers"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Worker Status Filter */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm transition-all',
                statusFilter === filter.id
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-slate-900/50 text-zinc-400 hover:text-indigo-400 border border-indigo-500/20'
              )}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Workers Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {filteredWorkers.map((worker) => (
          <motion.div
            key={worker.id}
            variants={item}
            className="cursor-pointer"
            onClick={() => setSelectedWorker(worker.id)}
          >
            <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'p-2 rounded-lg',
                      worker.status === 'active' ? 'bg-emerald-500/10' :
                      worker.status === 'idle' ? 'bg-amber-500/10' : 'bg-rose-500/10'
                    )}>
                      <Server className={cn(
                        'w-4 h-4',
                        worker.status === 'active' ? 'text-emerald-400' :
                        worker.status === 'idle' ? 'text-amber-400' : 'text-rose-400'
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{worker.name}</p>
                      <p className="text-xs text-zinc-400">{worker.region}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(worker.status)}>
                    {worker.status}
                  </Badge>
                </div>

                {/* Load Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">Load</span>
                    <span className={getLoadColor(worker.load)}>
                      {worker.running}/{worker.capacity} ({worker.load}%)
                    </span>
                  </div>
                  <Progress
                    value={worker.load}
                    className="h-2 bg-slate-800"
                    indicatorClassName={getProgressColor(worker.load)}
                  />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 bg-slate-800/30 rounded">
                    <p className="text-xs text-zinc-400">CPU</p>
                    <p className="text-sm font-medium text-white">{worker.cpu}%</p>
                  </div>
                  <div className="p-2 bg-slate-800/30 rounded">
                    <p className="text-xs text-zinc-400">Memory</p>
                    <p className="text-sm font-medium text-white">{worker.memory}%</p>
                  </div>
                  <div className="p-2 bg-slate-800/30 rounded">
                    <p className="text-xs text-zinc-400">Tasks</p>
                    <p className="text-sm font-medium text-white">{formatNumber(worker.tasksCompleted)}</p>
                  </div>
                  <div className="p-2 bg-slate-800/30 rounded">
                    <p className="text-xs text-zinc-400">Latency</p>
                    <p className="text-sm font-medium text-white">{worker.avgResponseTime}ms</p>
                  </div>
                </div>

                {/* Tools */}
                <div className="flex flex-wrap gap-1">
                  {worker.tools.slice(0, 3).map((tool) => (
                    <Badge key={tool} variant="outline" className="border-indigo-500/30 text-xs">
                      {tool}
                    </Badge>
                  ))}
                  {worker.tools.length > 3 && (
                    <Badge variant="outline" className="border-indigo-500/30 text-xs">
                      +{worker.tools.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Last Seen */}
                <p className="text-xs text-zinc-500 mt-2">
                  Last seen: {format(new Date(worker.lastSeen), 'HH:mm:ss')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Region Distribution */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                Region Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWorkerAnalytics.regionDistribution.map((region) => (
                  <div key={region.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: region.color }} />
                        <span className="text-sm text-white">{region.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">{region.workers} workers</span>
                        <span className="text-xs text-zinc-400">{region.load}/{region.capacity}</span>
                      </div>
                    </div>
                    <Progress
                      value={(region.load / region.capacity) * 100}
                      className="h-2 bg-slate-800"
                      indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tool Distribution */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                Tool Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockWorkerAnalytics.toolDistribution.map((tool) => (
                  <div key={tool.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tool.color }} />
                        <span className="text-sm text-white">{tool.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">{tool.workers} workers</span>
                        <span className="text-xs text-zinc-400">{tool.percentage}%</span>
                      </div>
                    </div>
                    <Progress
                      value={tool.percentage * 2}
                      className="h-2 bg-slate-800"
                      indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Capacity Planning */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              Capacity Planning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-5 gap-4">
              <div className="p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-zinc-400">Current Capacity</p>
                <p className="text-lg font-bold text-white">{mockWorkerAnalytics.capacityPlanning.currentCapacity}</p>
              </div>
              <div className="p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-zinc-400">Peak Load</p>
                <p className="text-lg font-bold text-amber-400">{mockWorkerAnalytics.capacityPlanning.peakLoad}</p>
              </div>
              <div className="p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-zinc-400">Avg Load</p>
                <p className="text-lg font-bold text-emerald-400">{mockWorkerAnalytics.capacityPlanning.avgLoad}</p>
              </div>
              <div className="p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-zinc-400">Recommended</p>
                <p className="text-lg font-bold text-indigo-400">{mockWorkerAnalytics.capacityPlanning.recommendedCapacity}</p>
              </div>
              <div className="p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-zinc-400">Projected Growth</p>
                <p className="text-lg font-bold text-emerald-400">{mockWorkerAnalytics.capacityPlanning.projectedGrowth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alerts */}
      {showAlerts && (
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-indigo-400" />
                  Active Alerts
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAlerts(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <EyeOff className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockWorkerAnalytics.alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      getSeverityColor(alert.severity)
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {alert.severity === 'critical' ? (
                        <AlertCircle className="w-5 h-5 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {alert.worker} • {format(new Date(alert.timestamp), 'HH:mm:ss')}
                        </p>
                        <p className="text-xs text-amber-400 mt-1">
                          Value: {alert.value}% / Threshold: {alert.threshold}%
                        </p>
                      </div>
                    </div>
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'warning'}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recommendations */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-3 gap-4">
              {mockWorkerAnalytics.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 bg-slate-800/30 rounded-lg"
                >
                  <h4 className="text-sm font-medium text-white mb-1">{rec.title}</h4>
                  <p className="text-xs text-zinc-400 mb-3">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant={rec.impact === 'high' ? 'destructive' : 'warning'}>
                      {rec.impact} impact
                    </Badge>
                    <span className="text-xs text-emerald-400">{rec.savings}</span>
                  </div>
                  <p className="text-xs text-indigo-400 mt-2">→ {rec.action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Worker Details Modal */}
      <AnimatePresence>
        {selectedWorker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedWorker(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-slate-900 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Worker Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockWorkerAnalytics.workerPerformance
                    .filter(w => w.id === selectedWorker)
                    .map((worker) => (
                      <div key={worker.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{worker.name}</h3>
                            <p className="text-sm text-zinc-400">{worker.region}</p>
                          </div>
                          <Badge className={getStatusColor(worker.status)}>
                            {worker.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-800/30 rounded-lg">
                            <p className="text-xs text-zinc-400">Tasks Completed</p>
                            <p className="text-xl font-bold text-white">{formatNumber(worker.tasksCompleted)}</p>
                          </div>
                          <div className="p-3 bg-slate-800/30 rounded-lg">
                            <p className="text-xs text-zinc-400">Success Rate</p>
                            <p className="text-xl font-bold text-emerald-400">{worker.successRate}%</p>
                          </div>
                          <div className="p-3 bg-slate-800/30 rounded-lg">
                            <p className="text-xs text-zinc-400">Avg Response</p>
                            <p className="text-xl font-bold text-amber-400">{worker.avgResponseTime}ms</p>
                          </div>
                          <div className="p-3 bg-slate-800/30 rounded-lg">
                            <p className="text-xs text-zinc-400">Uptime</p>
                            <p className="text-xl font-bold text-purple-400">{worker.uptime}%</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-zinc-400 mb-1">CPU</p>
                            <div className="flex items-center gap-2">
                              <Progress value={worker.cpu} className="flex-1 h-2 bg-slate-800" />
                              <span className="text-sm text-white">{worker.cpu}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-400 mb-1">Memory</p>
                            <div className="flex items-center gap-2">
                              <Progress value={worker.memory} className="flex-1 h-2 bg-slate-800" />
                              <span className="text-sm text-white">{worker.memory}%</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-400 mb-1">Disk</p>
                            <div className="flex items-center gap-2">
                              <Progress value={worker.disk} className="flex-1 h-2 bg-slate-800" />
                              <span className="text-sm text-white">{worker.disk}%</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-zinc-400 mb-2">Supported Tools</p>
                          <div className="flex flex-wrap gap-1">
                            {worker.tools.map((tool) => (
                              <Badge key={tool} variant="outline" className="border-indigo-500/30">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            onClick={() => setSelectedWorker(null)}
                            className="bg-gradient-to-r from-indigo-500 to-purple-500"
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}