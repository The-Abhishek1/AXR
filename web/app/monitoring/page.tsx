// app/monitoring/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  BarChart2,
  Cpu,
  Memory,
  Network,
  Server,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

// Mock data - replace with real API data
const systemMetrics = [
  { time: '00:00', cpu: 45, memory: 60, network: 30, processes: 12 },
  { time: '04:00', cpu: 52, memory: 65, network: 45, processes: 18 },
  { time: '08:00', cpu: 78, memory: 72, network: 80, processes: 24 },
  { time: '12:00', cpu: 82, memory: 80, network: 95, processes: 32 },
  { time: '16:00', cpu: 74, memory: 75, network: 70, processes: 28 },
  { time: '20:00', cpu: 58, memory: 68, network: 40, processes: 20 },
];

const stepStatusData = [
  { name: 'Success', value: 1245, color: theme.colors.success },
  { name: 'Running', value: 342, color: theme.colors.info },
  { name: 'Failed', value: 123, color: theme.colors.destructive },
  { name: 'Pending', value: 567, color: theme.colors.muted },
  { name: 'Retry', value: 89, color: theme.colors.warning },
];

const topTools = [
  { name: 'git.clone', executions: 423, success: 98, time: 234 },
  { name: 'sast.scan', executions: 356, success: 92, time: 567 },
  { name: 'lint', executions: 298, success: 95, time: 123 },
  { name: 'deploy.service', executions: 245, success: 88, time: 892 },
  { name: 'test.run', executions: 189, success: 91, time: 345 },
  { name: 'build.image', executions: 156, success: 94, time: 678 },
];

const agentMetrics = [
  { name: 'agent-1', load: 45, capacity: 100, status: 'healthy' },
  { name: 'agent-2', load: 78, capacity: 100, status: 'warning' },
  { name: 'agent-3', load: 23, capacity: 100, status: 'healthy' },
  { name: 'agent-4', load: 92, capacity: 100, status: 'critical' },
  { name: 'agent-5', load: 34, capacity: 100, status: 'healthy' },
];

export default function MonitoringPage() {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('cpu');

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
            Monitoring
          </h1>
          <p className="text-zinc-400 mt-2">Real-time system metrics and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <div className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <span className="text-emerald-400 text-sm font-medium">Live</span>
          </div>
        </div>
      </motion.div>

      {/* System Health Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-4"
      >
        {[
          { label: 'System Health', value: '98.5%', icon: Server, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Avg Response', value: '234ms', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Active Alerts', value: '3', icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'Uptime', value: '99.9%', icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={item}>
              <Card className="group hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={cn('p-3 rounded-xl', stat.bg)}>
                      <Icon className={cn('w-6 h-6', stat.color)} />
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* System Performance */}
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
                  System Performance
                </CardTitle>
                <div className="flex items-center gap-2">
                  {['cpu', 'memory', 'network'].map((metric) => (
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
                  <AreaChart data={systemMetrics}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNetwork" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="time" stroke="#71717a" />
                    <YAxis stroke="#71717a" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.colors.card,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '8px',
                        color: theme.colors.foreground,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke={
                        selectedMetric === 'cpu' ? '#10b981' :
                        selectedMetric === 'memory' ? '#3b82f6' : '#f59e0b'
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

        {/* Step Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-purple-400" />
                Step Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stepStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
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
                        backgroundColor: theme.colors.card,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Tools Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-400" />
              Top Tools Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">Tool</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Executions</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Success Rate</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Avg Duration</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {topTools.map((tool, idx) => (
                    <motion.tr
                      key={tool.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-sm text-white">{tool.name}</td>
                      <td className="py-3 px-4 text-right text-white">{tool.executions}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-emerald-400">{tool.success}%</span>
                      </td>
                      <td className="py-3 px-4 text-right text-zinc-400">{tool.time}ms</td>
                      <td className="py-3 px-4 text-right">
                        <div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden ml-auto">
                          <div 
                            className="h-full bg-emerald-500"
                            style={{ width: `${Math.min(100, tool.success)}%` }}
                          />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}