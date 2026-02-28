// app/analytics/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Activity,
  Brain,
  Cpu,
  Clock,
  Users,
  Zap,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
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

// Mock data
const overviewStats = [
  {
    label: 'Total Executions',
    value: '24,567',
    change: '+12.3%',
    trend: 'up',
    icon: Activity,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    label: 'Total Cost',
    value: '$1,234',
    change: '+8.2%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    label: 'Success Rate',
    value: '94.2%',
    change: '+2.1%',
    trend: 'up',
    icon: Target,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
  },
  {
    label: 'Avg Duration',
    value: '234ms',
    change: '-5.3%',
    trend: 'down',
    icon: Clock,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
];

const dailyExecutions = [
  { day: 'Mon', executions: 345, cost: 45, success: 320 },
  { day: 'Tue', executions: 432, cost: 56, success: 408 },
  { day: 'Wed', executions: 389, cost: 48, success: 367 },
  { day: 'Thu', executions: 478, cost: 62, success: 451 },
  { day: 'Fri', executions: 523, cost: 68, success: 492 },
  { day: 'Sat', executions: 289, cost: 34, success: 271 },
  { day: 'Sun', executions: 234, cost: 28, success: 220 },
];

const topTools = [
  { name: 'git.clone', executions: 8456, cost: 422.8, success: 98 },
  { name: 'sast.scan', executions: 6234, cost: 935.1, success: 92 },
  { name: 'lint', executions: 5432, cost: 271.6, success: 95 },
  { name: 'deploy.service', executions: 4321, cost: 864.2, success: 88 },
  { name: 'test.run', executions: 3456, cost: 172.8, success: 91 },
  { name: 'build', executions: 2876, cost: 143.8, success: 94 },
];

const agentPerformance = [
  { name: 'DevSecOps', tasks: 1234, success: 98, cost: 123.4 },
  { name: 'Data Agent', tasks: 987, success: 94, cost: 98.7 },
  { name: 'Infra Agent', tasks: 876, success: 96, cost: 87.6 },
  { name: 'Security', tasks: 765, success: 99, cost: 76.5 },
  { name: 'Testing', tasks: 654, success: 92, cost: 65.4 },
];

const costBreakdown = [
  { name: 'Compute', value: 567, color: '#6366f1' },
  { name: 'Storage', value: 234, color: '#8b5cf6' },
  { name: 'Network', value: 123, color: '#d946ef' },
  { name: 'API Calls', value: 89, color: '#ec4899' },
  { name: 'Other', value: 45, color: '#f43f5e' },
];

export default function AnalyticsOverviewPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('executions');

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-primary">Analytics Overview</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Key metrics and performance indicators
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          <button className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors">
            <Download className="w-5 h-5 text-indigo-400" />
          </button>
          <button className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors">
            <RefreshCw className="w-5 h-5 text-indigo-400" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {overviewStats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUp : ArrowDown;
          
          return (
            <motion.div key={stat.label} variants={item}>
              <Card className="bg-slate-900/50 border-indigo-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-zinc-400">{stat.label}</p>
                      <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <TrendIcon className={cn(
                          'w-3 h-3',
                          stat.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
                        )} />
                        <span className={cn(
                          'text-xs font-medium',
                          stat.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'
                        )}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div className={cn('p-3 rounded-lg', stat.bgColor)}>
                      <Icon className={cn('w-5 h-5', stat.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Daily Executions Chart */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                Daily Executions
              </CardTitle>
              <div className="flex items-center gap-2">
                {['executions', 'cost', 'success'].map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-lg capitalize transition-all',
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
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyExecutions}>
                  <XAxis dataKey="day" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #6366f1',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey={selectedMetric}
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Tools */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                Top Tools by Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTools.map((tool, index) => (
                  <div key={tool.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{tool.name}</span>
                        <Badge variant="outline" className="border-indigo-500/30">
                          {tool.success}% success
                        </Badge>
                      </div>
                      <span className="text-sm text-zinc-400">{tool.executions.toLocaleString()} runs</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${(tool.executions / 10000) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cost Breakdown */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-400" />
                Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {costBreakdown.map((entry, index) => (
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Agent Performance */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-400" />
              Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-indigo-500/20">
                    <th className="text-left py-2 text-sm font-medium text-zinc-400">Agent</th>
                    <th className="text-right py-2 text-sm font-medium text-zinc-400">Tasks</th>
                    <th className="text-right py-2 text-sm font-medium text-zinc-400">Success Rate</th>
                    <th className="text-right py-2 text-sm font-medium text-zinc-400">Cost</th>
                    <th className="text-right py-2 text-sm font-medium text-zinc-400">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {agentPerformance.map((agent, index) => (
                    <tr key={agent.name} className="border-b border-indigo-500/10">
                      <td className="py-3 text-sm text-white">{agent.name}</td>
                      <td className="py-3 text-sm text-right text-zinc-300">{agent.tasks}</td>
                      <td className="py-3 text-sm text-right">
                        <span className={agent.success > 95 ? 'text-emerald-400' : 'text-amber-400'}>
                          {agent.success}%
                        </span>
                      </td>
                      <td className="py-3 text-sm text-right text-zinc-300">${agent.cost}</td>
                      <td className="py-3 text-right">
                        <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-auto">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            style={{ width: `${agent.success}%` }}
                          />
                        </div>
                      </td>
                    </tr>
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