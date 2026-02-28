// app/analytics/costs/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Server,
  Database,
  Globe,
  Shield,
  Cpu,
  HardDrive,
  Network,
  Cloud,
  ShoppingCart,
  CreditCard,
  PiggyBank,
  Target,
  Award,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  MoreVertical,
  Eye,
  EyeOff,
  Star,
  Settings,
  Users,
  Info
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
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
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
  ComposedChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { format, subDays, subMonths } from 'date-fns';
import toast from 'react-hot-toast';

// Mock cost data
const mockCostData = {
  overview: {
    totalSpend: 15234.56,
    monthlyBudget: 20000,
    dailyAverage: 508.15,
    projectedMonthly: 15752.67,
    savings: 2345.67,
    trends: {
      daily: '+12.3%',
      weekly: '+5.6%',
      monthly: '+8.9%',
      yearly: '+23.4%',
    }
  },
  dailyCosts: Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const baseCost = 450 + Math.random() * 200;
    return {
      date: format(date, 'MMM dd'),
      compute: Math.round(baseCost * 0.6),
      storage: Math.round(baseCost * 0.2),
      network: Math.round(baseCost * 0.1),
      api: Math.round(baseCost * 0.05),
      other: Math.round(baseCost * 0.05),
      total: Math.round(baseCost),
    };
  }),
  byService: [
    { name: 'Compute', value: 8234.56, percentage: 54, color: '#6366f1', trend: '+15.2%' },
    { name: 'Storage', value: 3245.67, percentage: 21, color: '#8b5cf6', trend: '+8.4%' },
    { name: 'Network', value: 1876.54, percentage: 12, color: '#d946ef', trend: '+5.1%' },
    { name: 'API Calls', value: 987.65, percentage: 6, color: '#ec4899', trend: '+12.8%' },
    { name: 'Other', value: 890.14, percentage: 7, color: '#f43f5e', trend: '+3.2%' },
  ],
  byTool: [
    { name: 'sast.scan', cost: 2345.67, count: 45678, avgCost: 0.051, trend: '+8.2%' },
    { name: 'deploy.service', cost: 1876.54, count: 12345, avgCost: 0.152, trend: '+12.5%' },
    { name: 'git.clone', cost: 1234.56, count: 89234, avgCost: 0.014, trend: '+5.3%' },
    { name: 'build', cost: 987.65, count: 23456, avgCost: 0.042, trend: '+7.8%' },
    { name: 'test.run', cost: 876.54, count: 34567, avgCost: 0.025, trend: '+4.6%' },
    { name: 'lint', cost: 654.32, count: 56789, avgCost: 0.012, trend: '+3.9%' },
  ],
  byProject: [
    { name: 'Production', cost: 8234.56, budget: 10000, percentage: 82, trend: '+12.3%' },
    { name: 'Staging', cost: 3245.67, budget: 5000, percentage: 65, trend: '+8.7%' },
    { name: 'Development', cost: 2345.67, budget: 4000, percentage: 59, trend: '+15.2%' },
    { name: 'Testing', cost: 1408.66, budget: 2000, percentage: 70, trend: '+5.8%' },
  ],
  byTeam: [
    { name: 'Engineering', cost: 6234.56, budget: 8000, percentage: 78, trend: '+10.2%' },
    { name: 'Data Science', cost: 3245.67, budget: 4000, percentage: 81, trend: '+14.5%' },
    { name: 'DevOps', cost: 2987.65, budget: 3500, percentage: 85, trend: '+9.8%' },
    { name: 'Security', cost: 1543.21, budget: 2000, percentage: 77, trend: '+6.7%' },
    { name: 'Product', cost: 1223.47, budget: 2500, percentage: 49, trend: '+4.2%' },
  ],
  alerts: [
    {
      id: 'a1',
      severity: 'critical',
      message: 'Monthly budget at 85% with 10 days remaining',
      timestamp: '2024-01-20T10:30:00Z',
      threshold: 80,
      current: 85,
    },
    {
      id: 'a2',
      severity: 'warning',
      message: 'Compute costs increased by 15% this week',
      timestamp: '2024-01-19T14:20:00Z',
      threshold: 10,
      current: 15,
    },
    {
      id: 'a3',
      severity: 'info',
      message: 'New cost-saving opportunity identified',
      timestamp: '2024-01-18T09:15:00Z',
      savings: 450,
    },
  ],
  recommendations: [
    {
      id: 'r1',
      title: 'Right-size Compute Instances',
      description: 'Several instances are underutilized. Consider downsizing.',
      savings: 1234.56,
      effort: 'low',
      category: 'compute',
      confidence: 95,
    },
    {
      id: 'r2',
      title: 'Clean Up Old Storage',
      description: '45% of storage costs come from data older than 90 days.',
      savings: 876.54,
      effort: 'medium',
      category: 'storage',
      confidence: 88,
    },
    {
      id: 'r3',
      title: 'Use Spot Instances',
      description: 'Non-critical workloads can use spot instances for 70% savings.',
      savings: 2345.67,
      effort: 'high',
      category: 'compute',
      confidence: 92,
    },
    {
      id: 'r4',
      title: 'Optimize API Calls',
      description: 'Reduce redundant API calls with caching.',
      savings: 543.21,
      effort: 'medium',
      category: 'api',
      confidence: 85,
    },
  ],
  forecasts: {
    nextMonth: 16500,
    nextQuarter: 48500,
    nextYear: 185000,
    confidence: 85,
    factors: [
      { name: 'Seasonal growth', impact: '+8%' },
      { name: 'New features', impact: '+12%' },
      { name: 'Optimizations', impact: '-5%' },
    ],
  },
};

const timeRanges = [
  { id: '7d', name: 'Last 7 Days' },
  { id: '30d', name: 'Last 30 Days' },
  { id: '90d', name: 'Last 90 Days' },
  { id: '1y', name: 'This Year' },
];

const categories = [
  { id: 'all', name: 'All Costs', icon: DollarSign },
  { id: 'compute', name: 'Compute', icon: Cpu },
  { id: 'storage', name: 'Storage', icon: HardDrive },
  { id: 'network', name: 'Network', icon: Network },
  { id: 'api', name: 'API Calls', icon: Zap },
];

export default function CostsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForecast, setShowForecast] = useState(true);
  const [budgetMode, setBudgetMode] = useState<'overview' | 'details' | 'alerts'>('overview');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'warning': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'info': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-rose-500';
    if (percentage >= 75) return 'bg-amber-500';
    if (percentage >= 50) return 'bg-emerald-500';
    return 'bg-blue-500';
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
            <span className="gradient-text-primary">Cost Analytics</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm lg:text-base">
            Track, analyze, and optimize your spending
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
            onClick={() => toast.success('Cost data refreshed')}
            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-indigo-400" />
          </button>

          <button
            onClick={() => toast.success('Cost report downloaded')}
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
              <DollarSign className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs text-zinc-400">Total Spend</p>
                <p className="text-lg font-bold text-white">{formatCurrency(mockCostData.overview.totalSpend)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs text-zinc-400">Monthly Budget</p>
                <p className="text-lg font-bold text-emerald-400">{formatCurrency(mockCostData.overview.monthlyBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs text-zinc-400">Daily Average</p>
                <p className="text-lg font-bold text-amber-400">{formatCurrency(mockCostData.overview.dailyAverage)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs text-zinc-400">Potential Savings</p>
                <p className="text-lg font-bold text-purple-400">{formatCurrency(mockCostData.overview.savings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Budget Progress */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Monthly Budget Usage</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(mockCostData.overview.totalSpend)} / {formatCurrency(mockCostData.overview.monthlyBudget)}
                  </p>
                </div>
                <Badge className={getSeverityColor(
                  (mockCostData.overview.totalSpend / mockCostData.overview.monthlyBudget) * 100 >= 90 ? 'critical' :
                  (mockCostData.overview.totalSpend / mockCostData.overview.monthlyBudget) * 100 >= 75 ? 'warning' : 'info'
                )}>
                  {((mockCostData.overview.totalSpend / mockCostData.overview.monthlyBudget) * 100).toFixed(1)}% Used
                </Badge>
              </div>

              <Progress
                value={(mockCostData.overview.totalSpend / mockCostData.overview.monthlyBudget) * 100}
                className="h-3 bg-slate-800"
              />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-zinc-400">Projected Monthly</p>
                  <p className="text-sm font-medium text-amber-400">{formatCurrency(mockCostData.overview.projectedMonthly)}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Daily Trend</p>
                  <p className="text-sm font-medium text-emerald-400">{mockCostData.overview.trends.daily}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Weekly Trend</p>
                  <p className="text-sm font-medium text-emerald-400">{mockCostData.overview.trends.weekly}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Monthly Trend</p>
                  <p className="text-sm font-medium text-emerald-400">{mockCostData.overview.trends.monthly}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cost Trends Chart */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-indigo-400" />
              Cost Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockCostData.dailyCosts}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #6366f1',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="compute"
                    stackId="1"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.6}
                    name="Compute"
                  />
                  <Area
                    type="monotone"
                    dataKey="storage"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.6}
                    name="Storage"
                  />
                  <Area
                    type="monotone"
                    dataKey="network"
                    stackId="1"
                    stroke="#d946ef"
                    fill="#d946ef"
                    fillOpacity={0.6}
                    name="Network"
                  />
                  <Area
                    type="monotone"
                    dataKey="api"
                    stackId="1"
                    stroke="#ec4899"
                    fill="#ec4899"
                    fillOpacity={0.6}
                    name="API"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cost by Service */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-400" />
                Cost by Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCostData.byService.map((service) => (
                  <div key={service.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: service.color }} />
                        <span className="text-sm text-white">{service.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{formatCurrency(service.value)}</span>
                        <span className={service.trend.startsWith('+') ? 'text-rose-400' : 'text-emerald-400'}>
                          {service.trend}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={service.percentage}
                      className="h-2 bg-slate-800"
                      indicatorClassName={getProgressColor(service.percentage)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cost by Tool */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                Cost by Tool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCostData.byTool.map((tool) => (
                  <div
                    key={tool.name}
                    className="flex items-center justify-between p-2 hover:bg-slate-800/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{tool.name}</span>
                        <Badge variant="outline" className="border-indigo-500/30">
                          {tool.count.toLocaleString()} calls
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-400">
                        <span>Total: {formatCurrency(tool.cost)}</span>
                        <span>Avg: {formatCurrency(tool.avgCost)}/call</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {tool.trend}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Project and Team Costs */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Cost by Project */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                Cost by Project
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCostData.byProject.map((project) => (
                  <div
                    key={project.name}
                    className="p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 cursor-pointer"
                    onClick={() => setSelectedProject(project.name)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{project.name}</span>
                      <Badge className={getProgressColor(project.percentage)}>
                        {project.percentage}% of budget
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-400">Spent</span>
                      <span className="text-sm text-white">{formatCurrency(project.cost)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-400">Budget</span>
                      <span className="text-sm text-white">{formatCurrency(project.budget)}</span>
                    </div>
                    <Progress
                      value={project.percentage}
                      className="h-2 bg-slate-800"
                      indicatorClassName={getProgressColor(project.percentage)}
                    />
                    <div className="flex justify-end mt-1">
                      <span className={project.trend.startsWith('+') ? 'text-rose-400' : 'text-emerald-400'}>
                        {project.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cost by Team */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Cost by Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCostData.byTeam.map((team) => (
                  <div key={team.name} className="p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">{team.name}</span>
                      <span className="text-xs text-zinc-400">Budget: {formatCurrency(team.budget)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-400">Spent</span>
                      <span className="text-sm font-medium text-white">{formatCurrency(team.cost)}</span>
                    </div>
                    <Progress
                      value={team.percentage}
                      className="h-2 bg-slate-800"
                      indicatorClassName={getProgressColor(team.percentage)}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-zinc-400">{team.percentage}% used</span>
                      <span className={team.trend.startsWith('+') ? 'text-rose-400' : 'text-emerald-400'}>
                        {team.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alerts */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-400" />
              Cost Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCostData.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    getSeverityColor(alert.severity)
                  )}
                >
                  <div className="flex items-start gap-3">
                    {alert.severity === 'critical' && <AlertCircle className="w-5 h-5 mt-0.5" />}
                    {alert.severity === 'warning' && <AlertCircle className="w-5 h-5 mt-0.5" />}
                    {alert.severity === 'info' && <Info className="w-5 h-5 mt-0.5" />}
                    <div>
                      <p className="text-sm font-medium">{alert.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {format(new Date(alert.timestamp), 'MMM d, h:mm a')}
                      </p>
                      {alert.savings && (
                        <p className="text-xs text-emerald-400 mt-1">
                          Potential savings: {formatCurrency(alert.savings)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'warning' ? 'warning' : 'info'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Forecast */}
      {showForecast && (
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Cost Forecast
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForecast(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <EyeOff className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-xs text-zinc-400">Next Month</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(mockCostData.forecasts.nextMonth)}</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-xs text-zinc-400">Next Quarter</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(mockCostData.forecasts.nextQuarter)}</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-xs text-zinc-400">Next Year</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(mockCostData.forecasts.nextYear)}</p>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-xs text-zinc-400">Confidence</p>
                  <p className="text-lg font-bold text-emerald-400">{mockCostData.forecasts.confidence}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-zinc-400 mb-2">Contributing Factors</p>
                {mockCostData.forecasts.factors.map((factor) => (
                  <div key={factor.name} className="flex items-center justify-between">
                    <span className="text-sm text-white">{factor.name}</span>
                    <span className={factor.impact.startsWith('+') ? 'text-rose-400' : 'text-emerald-400'}>
                      {factor.impact}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cost Optimization Recommendations */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-indigo-400" />
              Cost Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-4">
              {mockCostData.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{rec.title}</h4>
                    <Badge variant={rec.effort === 'low' ? 'success' : rec.effort === 'medium' ? 'warning' : 'destructive'}>
                      {rec.effort} effort
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400 mb-3">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-indigo-500/30">
                        {rec.category}
                      </Badge>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                        {rec.confidence}% confidence
                      </Badge>
                    </div>
                    <span className="text-sm font-medium text-emerald-400">
                      Save {formatCurrency(rec.savings)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedProject(null)}
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
                  <CardTitle className="text-white">Project Details: {selectedProject}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Total Cost</p>
                      <p className="text-2xl font-bold text-white">$8,234.56</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Budget</p>
                      <p className="text-2xl font-bold text-emerald-400">$10,000.00</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-zinc-400 mb-2">Cost Breakdown</p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-white">Compute</span>
                        <span className="text-sm text-white">$4,940.74</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-white">Storage</span>
                        <span className="text-sm text-white">$1,647.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-white">Network</span>
                        <span className="text-sm text-white">$988.15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-white">API</span>
                        <span className="text-sm text-white">$658.67</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setSelectedProject(null)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500"
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}