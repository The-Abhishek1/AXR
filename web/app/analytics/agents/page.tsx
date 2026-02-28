// app/analytics/agents/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Brain,
  TrendingUp,
  TrendingDown,
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
  PieChart,
  LineChart,
  Cpu,
  Server,
  Database,
  Globe,
  Shield,
  MessageSquare,
  Sparkles,
  Rocket,
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
  Calendar
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
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';

// Mock agent analytics data
const mockAgentAnalytics = {
  overview: {
    totalAgents: 12,
    activeAgents: 8,
    idleAgents: 3,
    offlineAgents: 1,
    totalTasks: 15432,
    avgSuccessRate: 96.5,
    avgResponseTime: 234,
    totalCost: 4567.89,
  },
  agentPerformance: [
    {
      id: 'agent-1',
      name: 'DevSecOps Agent',
      model: 'GPT-4o',
      status: 'active',
      tasksCompleted: 3456,
      successRate: 98.2,
      avgResponseTime: 189,
      cost: 876.54,
      capabilities: ['security', 'ci/cd', 'deployment'],
      utilization: 85,
      rating: 4.9,
      trend: '+12%',
    },
    {
      id: 'agent-2',
      name: 'Data Pipeline Agent',
      model: 'GPT-4o-mini',
      status: 'active',
      tasksCompleted: 2789,
      successRate: 95.8,
      avgResponseTime: 267,
      cost: 654.32,
      capabilities: ['etl', 'data-processing', 'analytics'],
      utilization: 72,
      rating: 4.7,
      trend: '+8%',
    },
    {
      id: 'agent-3',
      name: 'Infrastructure Agent',
      model: 'Claude-3',
      status: 'active',
      tasksCompleted: 2345,
      successRate: 97.1,
      avgResponseTime: 156,
      cost: 543.21,
      capabilities: ['terraform', 'kubernetes', 'cloud'],
      utilization: 78,
      rating: 4.8,
      trend: '+15%',
    },
    {
      id: 'agent-4',
      name: 'Security Agent',
      model: 'GPT-4',
      status: 'active',
      tasksCompleted: 1987,
      successRate: 99.1,
      avgResponseTime: 234,
      cost: 432.10,
      capabilities: ['vulnerability-scan', 'compliance', 'audit'],
      utilization: 91,
      rating: 4.9,
      trend: '+10%',
    },
    {
      id: 'agent-5',
      name: 'Testing Agent',
      model: 'GPT-3.5',
      status: 'idle',
      tasksCompleted: 1654,
      successRate: 94.3,
      avgResponseTime: 123,
      cost: 321.09,
      capabilities: ['unit-test', 'integration-test', 'e2e'],
      utilization: 45,
      rating: 4.5,
      trend: '+5%',
    },
    {
      id: 'agent-6',
      name: 'ML Agent',
      model: 'Claude-3.5',
      status: 'active',
      tasksCompleted: 1432,
      successRate: 96.7,
      avgResponseTime: 345,
      cost: 298.76,
      capabilities: ['training', 'inference', 'model-deployment'],
      utilization: 67,
      rating: 4.6,
      trend: '+18%',
    },
  ],
  dailyActivity: Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return {
      date: format(date, 'MMM dd'),
      tasks: Math.floor(Math.random() * 200) + 100,
      success: Math.floor(Math.random() * 180) + 90,
      agents: Math.floor(Math.random() * 8) + 4,
      responseTime: Math.floor(Math.random() * 100) + 150,
    };
  }),
  capabilityUsage: [
    { name: 'Security', count: 4567, percentage: 28, color: '#6366f1' },
    { name: 'Data Processing', count: 3890, percentage: 24, color: '#8b5cf6' },
    { name: 'Infrastructure', count: 3210, percentage: 20, color: '#d946ef' },
    { name: 'Testing', count: 2345, percentage: 15, color: '#ec4899' },
    { name: 'ML/AI', count: 1420, percentage: 9, color: '#f43f5e' },
    { name: 'Monitoring', count: 890, percentage: 4, color: '#f97316' },
  ],
  agentRankings: [
    { name: 'Security Agent', score: 99, tasks: 1987, efficiency: 98 },
    { name: 'DevSecOps Agent', score: 98, tasks: 3456, efficiency: 95 },
    { name: 'Infrastructure Agent', score: 97, tasks: 2345, efficiency: 92 },
    { name: 'ML Agent', score: 96, tasks: 1432, efficiency: 89 },
    { name: 'Data Agent', score: 95, tasks: 2789, efficiency: 91 },
  ],
  efficiencyMetrics: {
    avgTasksPerAgent: 1286,
    avgCostPerTask: 0.30,
    peakHour: '14:00',
    peakLoad: 245,
    bestPerformer: 'Security Agent',
    mostImproved: 'ML Agent',
  },
  healthMetrics: [
    { agent: 'DevSecOps', cpu: 45, memory: 62, latency: 189, status: 'healthy' },
    { agent: 'Data', cpu: 38, memory: 55, latency: 267, status: 'healthy' },
    { agent: 'Infrastructure', cpu: 52, memory: 48, latency: 156, status: 'healthy' },
    { agent: 'Security', cpu: 63, memory: 71, latency: 234, status: 'degraded' },
    { agent: 'Testing', cpu: 22, memory: 31, latency: 123, status: 'healthy' },
    { agent: 'ML', cpu: 78, memory: 82, latency: 345, status: 'warning' },
  ],
  bottlenecks: [
    {
      id: 'b1',
      agent: 'Security Agent',
      issue: 'High memory usage',
      impact: 'Slower response times',
      value: 82,
      threshold: 70,
      recommendation: 'Increase memory allocation',
    },
    {
      id: 'b2',
      agent: 'ML Agent',
      issue: 'CPU saturation',
      impact: 'Queue buildup',
      value: 78,
      threshold: 75,
      recommendation: 'Scale horizontally',
    },
  ],
  trends: {
    weeklyGrowth: '+8.5%',
    monthlyGrowth: '+23.4%',
    efficiencyGain: '+5.2%',
    costReduction: '-3.8%',
  },
};

const timeRanges = [
  { id: '24h', name: 'Last 24 Hours' },
  { id: '7d', name: 'Last 7 Days' },
  { id: '30d', name: 'Last 30 Days' },
  { id: '90d', name: 'Last 90 Days' },
];

const metricCategories = [
  { id: 'all', name: 'All Metrics', icon: Activity },
  { id: 'performance', name: 'Performance', icon: Gauge },
  { id: 'health', name: 'Health', icon: Thermometer },
  { id: 'cost', name: 'Cost', icon: Database },
  { id: 'utilization', name: 'Utilization', icon: Cpu },
];

export default function AgentAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [showHealth, setShowHealth] = useState(true);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'healthy': return 'text-emerald-400 bg-emerald-500/10';
      case 'degraded': return 'text-amber-400 bg-amber-500/10';
      case 'warning': return 'text-rose-400 bg-rose-500/10';
      default: return 'text-zinc-400 bg-zinc-500/10';
    }
  };

  const getAgentInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">
            <span className="gradient-text-primary">Agent Analytics</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm lg:text-base">
            Monitor and analyze AI agent performance
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
            onClick={() => toast.success('Agent data refreshed')}
            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-indigo-400" />
          </button>

          <button
            onClick={() => toast.success('Agent report downloaded')}
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
              <Brain className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs text-zinc-400">Total Agents</p>
                <p className="text-lg font-bold text-white">{mockAgentAnalytics.overview.totalAgents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs text-zinc-400">Active Agents</p>
                <p className="text-lg font-bold text-emerald-400">{mockAgentAnalytics.overview.activeAgents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs text-zinc-400">Success Rate</p>
                <p className="text-lg font-bold text-amber-400">{mockAgentAnalytics.overview.avgSuccessRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs text-zinc-400">Avg Response</p>
                <p className="text-lg font-bold text-purple-400">{mockAgentAnalytics.overview.avgResponseTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trends */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-zinc-400">Weekly Growth</p>
                <p className="text-lg font-semibold text-emerald-400">{mockAgentAnalytics.trends.weeklyGrowth}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Monthly Growth</p>
                <p className="text-lg font-semibold text-emerald-400">{mockAgentAnalytics.trends.monthlyGrowth}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Efficiency Gain</p>
                <p className="text-lg font-semibold text-emerald-400">{mockAgentAnalytics.trends.efficiencyGain}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Cost Reduction</p>
                <p className="text-lg font-semibold text-emerald-400">{mockAgentAnalytics.trends.costReduction}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Activity Chart */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <LineChart className="w-5 h-5 text-indigo-400" />
                Daily Agent Activity
              </CardTitle>
              <div className="flex items-center gap-2">
                {['tasks', 'responseTime', 'agents'].map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={cn(
                      'px-3 py-1 text-xs rounded-lg capitalize transition-all',
                      selectedMetric === metric
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-slate-800 text-zinc-400 hover:text-indigo-400'
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
                <ComposedChart data={mockAgentAnalytics.dailyActivity}>
                  <XAxis dataKey="date" stroke="#71717a" />
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
                  <Bar
                    yAxisId="left"
                    dataKey="tasks"
                    fill="#6366f1"
                    name="Tasks"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Response Time (ms)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="agents"
                    stroke="#d946ef"
                    strokeWidth={2}
                    name="Active Agents"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Agent Performance Table */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-indigo-500/20">
                    <th className="text-left py-3 text-sm font-medium text-zinc-400">Agent</th>
                    <th className="text-left py-3 text-sm font-medium text-zinc-400">Model</th>
                    <th className="text-right py-3 text-sm font-medium text-zinc-400">Tasks</th>
                    <th className="text-right py-3 text-sm font-medium text-zinc-400">Success Rate</th>
                    <th className="text-right py-3 text-sm font-medium text-zinc-400">Response Time</th>
                    <th className="text-right py-3 text-sm font-medium text-zinc-400">Utilization</th>
                    <th className="text-right py-3 text-sm font-medium text-zinc-400">Cost</th>
                    <th className="text-right py-3 text-sm font-medium text-zinc-400">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAgentAnalytics.agentPerformance.map((agent) => (
                    <tr
                      key={agent.id}
                      className="border-b border-indigo-500/10 hover:bg-slate-800/30 cursor-pointer"
                      onClick={() => setSelectedAgent(agent.id)}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs">
                              {getAgentInitials(agent.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-white">{agent.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className="border-indigo-500/30">
                          {agent.model}
                        </Badge>
                      </td>
                      <td className="py-3 text-right text-sm text-white">{agent.tasksCompleted}</td>
                      <td className="py-3 text-right">
                        <span className={agent.successRate > 97 ? 'text-emerald-400' : 'text-amber-400'}>
                          {agent.successRate}%
                        </span>
                      </td>
                      <td className="py-3 text-right text-sm text-white">{agent.avgResponseTime}ms</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm text-white">{agent.utilization}%</span>
                          <Progress
                            value={agent.utilization}
                            className="w-16 h-1.5 bg-slate-800"
                          />
                        </div>
                      </td>
                      <td className="py-3 text-right text-sm text-white">${agent.cost}</td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-white">{agent.rating}</span>
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

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Capability Usage */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-400" />
                Capability Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAgentAnalytics.capabilityUsage.map((cap) => (
                  <div key={cap.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cap.color }} />
                        <span className="text-sm text-white">{cap.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">{cap.count.toLocaleString()}</span>
                        <span className="text-xs text-zinc-400">{cap.percentage}%</span>
                      </div>
                    </div>
                    <Progress
                      value={cap.percentage}
                      className="h-2 bg-slate-800"
                      indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Agent Rankings */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                Agent Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAgentAnalytics.agentRankings.map((agent, index) => (
                  <div key={agent.name} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs text-white">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{agent.name}</span>
                        <span className="text-sm text-emerald-400">{agent.score}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-400">
                        <span>{agent.tasks} tasks</span>
                        <span>{agent.efficiency}% efficiency</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Health Metrics */}
      {showHealth && (
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Agent Health
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHealth(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <EyeOff className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {mockAgentAnalytics.healthMetrics.map((metric) => (
                  <div
                    key={metric.agent}
                    className="p-3 bg-slate-800/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{metric.agent}</span>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-400">CPU</span>
                          <span className="text-white">{metric.cpu}%</span>
                        </div>
                        <Progress value={metric.cpu} className="h-1 bg-slate-800" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-400">Memory</span>
                          <span className="text-white">{metric.memory}%</span>
                        </div>
                        <Progress value={metric.memory} className="h-1 bg-slate-800" />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Latency</span>
                        <span className="text-white">{metric.latency}ms</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Bottlenecks */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-400" />
              Performance Bottlenecks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAgentAnalytics.bottlenecks.map((bottleneck) => (
                <div
                  key={bottleneck.id}
                  className="p-3 bg-slate-800/30 rounded-lg border border-amber-500/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-medium text-white">{bottleneck.agent}</h4>
                      <p className="text-xs text-zinc-400 mt-1">{bottleneck.issue}</p>
                    </div>
                    <Badge variant="warning">
                      {bottleneck.value}% / {bottleneck.threshold}%
                    </Badge>
                  </div>
                  <p className="text-xs text-amber-400 mb-2">Impact: {bottleneck.impact}</p>
                  <div className="p-2 bg-indigo-500/10 rounded">
                    <p className="text-xs text-indigo-400">💡 {bottleneck.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Efficiency Metrics */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              Efficiency Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-zinc-400">Avg Tasks/Agent</p>
                <p className="text-xl font-bold text-white">{mockAgentAnalytics.efficiencyMetrics.avgTasksPerAgent}</p>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-zinc-400">Avg Cost/Task</p>
                <p className="text-xl font-bold text-emerald-400">${mockAgentAnalytics.efficiencyMetrics.avgCostPerTask}</p>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-zinc-400">Peak Hour</p>
                <p className="text-xl font-bold text-amber-400">{mockAgentAnalytics.efficiencyMetrics.peakHour}</p>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-zinc-400">Peak Load</p>
                <p className="text-xl font-bold text-amber-400">{mockAgentAnalytics.efficiencyMetrics.peakLoad}</p>
              </div>
              <div className="text-center p-3 bg-slate-800/30 rounded-lg">
                <p className="text-xs text-zinc-400">Best Performer</p>
                <p className="text-sm font-bold text-emerald-400">{mockAgentAnalytics.efficiencyMetrics.bestPerformer}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Agent Details Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedAgent(null)}
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
                  <CardTitle className="text-white">Agent Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockAgentAnalytics.agentPerformance
                    .filter(a => a.id === selectedAgent)
                    .map((agent) => (
                      <div key={agent.id} className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                              {getAgentInitials(agent.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                            <p className="text-sm text-zinc-400">{agent.model}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-800/30 rounded-lg">
                            <p className="text-xs text-zinc-400">Tasks</p>
                            <p className="text-xl font-bold text-white">{agent.tasksCompleted}</p>
                          </div>
                          <div className="p-3 bg-slate-800/30 rounded-lg">
                            <p className="text-xs text-zinc-400">Success Rate</p>
                            <p className="text-xl font-bold text-emerald-400">{agent.successRate}%</p>
                          </div>
                          <div className="p-3 bg-slate-800/30 rounded-lg">
                            <p className="text-xs text-zinc-400">Response Time</p>
                            <p className="text-xl font-bold text-amber-400">{agent.avgResponseTime}ms</p>
                          </div>
                          <div className="p-3 bg-slate-800/30 rounded-lg">
                            <p className="text-xs text-zinc-400">Cost</p>
                            <p className="text-xl font-bold text-purple-400">${agent.cost}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-zinc-400 mb-2">Capabilities</p>
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities.map((cap) => (
                              <Badge key={cap} variant="outline" className="border-indigo-500/30">
                                {cap}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            onClick={() => setSelectedAgent(null)}
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