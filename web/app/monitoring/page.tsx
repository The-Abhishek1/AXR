// app/monitoring/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Activity,
  Bell,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart,
  Gauge,
  Server,
  Cpu,
  HardDrive,
  Network,
  Zap,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart as ReLineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import toast from 'react-hot-toast';

// Mock data for charts
const systemMetrics = [
  { time: '00:00', cpu: 45, memory: 60, network: 30, processes: 12 },
  { time: '04:00', cpu: 52, memory: 65, network: 45, processes: 18 },
  { time: '08:00', cpu: 78, memory: 72, network: 80, processes: 24 },
  { time: '12:00', cpu: 82, memory: 80, network: 95, processes: 32 },
  { time: '16:00', cpu: 74, memory: 75, network: 70, processes: 28 },
  { time: '20:00', cpu: 58, memory: 68, network: 40, processes: 20 },
];

const stepStatusData = [
  { name: 'Success', value: 1245, color: '#10b981' },
  { name: 'Running', value: 342, color: '#6366f1' },
  { name: 'Failed', value: 123, color: '#ef4444' },
  { name: 'Pending', value: 567, color: '#f59e0b' },
  { name: 'Retry', value: 89, color: '#8b5cf6' },
];

const topTools = [
  { name: 'git.clone', executions: 423, success: 98, time: 234 },
  { name: 'sast.scan', executions: 356, success: 92, time: 567 },
  { name: 'lint', executions: 298, success: 95, time: 123 },
  { name: 'deploy.service', executions: 245, success: 88, time: 892 },
  { name: 'test.run', executions: 189, success: 91, time: 345 },
];

const alerts = [
  { id: 1, severity: 'critical', message: 'Worker agent-3 has high latency', time: '2 min ago', status: 'active' },
  { id: 2, severity: 'warning', message: 'Process budget exceeded for workflow f8c3...', time: '15 min ago', status: 'active' },
  { id: 3, severity: 'info', message: 'New agent registered: agent-11', time: '1 hour ago', status: 'resolved' },
  { id: 4, severity: 'critical', message: 'Step deploy.service failed repeatedly', time: '2 hours ago', status: 'active' },
  { id: 5, severity: 'warning', message: 'High memory usage on worker agent-7', time: '3 hours ago', status: 'resolved' },
];

export default function MonitoringPage() {
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('cpu');
  const [showResolved, setShowResolved] = useState(false);
  const [stats, setStats] = useState({
    systemHealth: 98.5,
    activeAlerts: alerts.filter(a => a.status === 'active').length,
    totalExecutions: 2345,
    avgResponseTime: 234,
  });

  const filteredAlerts = alerts.filter(a => showResolved || a.status === 'active');

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'info': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
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
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">
            <span className="gradient-text-primary">Monitoring</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm lg:text-base">
            Real-time system metrics and analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-lg border border-indigo-500/20">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                'p-2 rounded transition-colors flex items-center gap-2',
                autoRefresh
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-zinc-400 hover:text-indigo-400'
              )}
            >
              {autoRefresh ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="text-xs hidden lg:inline">Auto-refresh</span>
            </button>
          </div>

          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          <button
            onClick={() => toast.success('Data refreshed')}
            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-indigo-400" />
          </button>
        </div>
      </motion.div>

      {/* System Health Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
      >
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Activity className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">System Health</p>
                <p className="text-xl font-bold text-emerald-400">{stats.systemHealth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <Bell className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Active Alerts</p>
                <p className="text-xl font-bold text-rose-400">{stats.activeAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Zap className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Total Executions</p>
                <p className="text-xl font-bold text-indigo-400">{stats.totalExecutions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Avg Response</p>
                <p className="text-xl font-bold text-amber-400">{stats.avgResponseTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* System Performance */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  System Performance
                </CardTitle>
                <div className="flex items-center gap-2">
                  {['cpu', 'memory', 'network'].map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setSelectedMetric(metric)}
                      className={cn(
                        'px-2 py-1 text-xs rounded-lg capitalize transition-all',
                        selectedMetric === metric
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-slate-800 text-zinc-400 hover:bg-slate-700'
                      )}
                    >
                      {metric}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={systemMetrics}>
                    <defs>
                      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
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
                      dataKey={selectedMetric}
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#colorMetric)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Step Status Distribution */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-400" />
                Step Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={stepStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stepStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #6366f1',
                        borderRadius: '8px',
                      }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Second Row - Additional Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Tools */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Top Tools by Execution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topTools} layout="vertical">
                    <XAxis type="number" stroke="#71717a" />
                    <YAxis dataKey="name" type="category" stroke="#71717a" width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #6366f1',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="executions" fill="#6366f1" radius={[0, 4, 4, 0]}>
                      {topTools.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${260 + index * 20}, 70%, 60%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tool Performance Table */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <LineChart className="w-5 h-5 text-indigo-400" />
                Tool Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-indigo-500/20">
                      <th className="text-left py-2 text-xs font-medium text-zinc-400">Tool</th>
                      <th className="text-right py-2 text-xs font-medium text-zinc-400">Executions</th>
                      <th className="text-right py-2 text-xs font-medium text-zinc-400">Success</th>
                      <th className="text-right py-2 text-xs font-medium text-zinc-400">Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTools.map((tool, idx) => (
                      <tr key={tool.name} className="border-b border-indigo-500/10 hover:bg-slate-800/30">
                        <td className="py-2 text-sm text-white">{tool.name}</td>
                        <td className="py-2 text-right text-sm text-white">{tool.executions}</td>
                        <td className="py-2 text-right text-sm text-emerald-400">{tool.success}%</td>
                        <td className="py-2 text-right text-sm text-zinc-400">{tool.time}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alerts Section */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-400" />
                Active Alerts
              </CardTitle>
              <button
                onClick={() => setShowResolved(!showResolved)}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Filter className="w-3 h-3" />
                {showResolved ? 'Hide Resolved' : 'Show Resolved'}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    getSeverityColor(alert.severity)
                  )}
                >
                  <div className="flex items-center gap-3">
                    {alert.severity === 'critical' && <AlertCircle className="w-4 h-4" />}
                    {alert.severity === 'warning' && <AlertCircle className="w-4 h-4" />}
                    {alert.severity === 'info' && <Bell className="w-4 h-4" />}
                    <div>
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs opacity-70">{alert.time}</p>
                    </div>
                  </div>
                  <Badge variant={alert.status === 'active' ? 'destructive' : 'secondary'}>
                    {alert.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}