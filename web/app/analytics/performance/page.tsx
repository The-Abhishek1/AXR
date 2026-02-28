// app/analytics/performance/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Zap,
  Cpu,
  Server,
  Database,
  Globe,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  BarChart3,
  LineChart,
  PieChart,
  Gauge,
  Timer,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  MoreVertical,
  Eye,
  EyeOff,
  Star,
  Award,
  Target,
  ZapOff,
  Thermometer,
  HardDrive,
  Network,
  Wifi,
  WifiOff
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
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Mock performance data
const mockPerformanceData = {
  overview: {
    avgResponseTime: 234,
    p95ResponseTime: 456,
    p99ResponseTime: 789,
    throughput: 1250,
    errorRate: 2.3,
    successRate: 97.7,
    totalRequests: 1250000,
    peakLoad: 2500,
    uptime: 99.95,
    latency: {
      p50: 234,
      p75: 345,
      p90: 456,
      p95: 567,
      p99: 789,
    }
  },
  timeSeriesData: [
    { timestamp: '00:00', responseTime: 220, throughput: 980, errors: 12 },
    { timestamp: '01:00', responseTime: 235, throughput: 1020, errors: 15 },
    { timestamp: '02:00', responseTime: 245, throughput: 890, errors: 8 },
    { timestamp: '03:00', responseTime: 215, throughput: 760, errors: 5 },
    { timestamp: '04:00', responseTime: 205, throughput: 820, errors: 7 },
    { timestamp: '05:00', responseTime: 225, throughput: 1100, errors: 18 },
    { timestamp: '06:00', responseTime: 255, throughput: 1450, errors: 25 },
    { timestamp: '07:00', responseTime: 278, throughput: 1680, errors: 32 },
    { timestamp: '08:00', responseTime: 298, throughput: 1950, errors: 38 },
    { timestamp: '09:00', responseTime: 312, throughput: 2100, errors: 42 },
    { timestamp: '10:00', responseTime: 325, throughput: 2250, errors: 45 },
    { timestamp: '11:00', responseTime: 334, throughput: 2350, errors: 48 },
    { timestamp: '12:00', responseTime: 356, throughput: 2450, errors: 52 },
    { timestamp: '13:00', responseTime: 345, throughput: 2380, errors: 49 },
    { timestamp: '14:00', responseTime: 323, throughput: 2200, errors: 43 },
    { timestamp: '15:00', responseTime: 298, throughput: 1980, errors: 35 },
    { timestamp: '16:00', responseTime: 278, throughput: 1850, errors: 30 },
    { timestamp: '17:00', responseTime: 289, throughput: 1920, errors: 33 },
    { timestamp: '18:00', responseTime: 302, throughput: 2050, errors: 40 },
    { timestamp: '19:00', responseTime: 295, throughput: 1880, errors: 36 },
    { timestamp: '20:00', responseTime: 267, throughput: 1650, errors: 28 },
    { timestamp: '21:00', responseTime: 245, throughput: 1420, errors: 22 },
    { timestamp: '22:00', responseTime: 234, throughput: 1250, errors: 18 },
    { timestamp: '23:00', responseTime: 223, throughput: 1100, errors: 14 },
  ],
  byEndpoint: [
    { endpoint: '/api/workflows', avgResponseTime: 145, requests: 345000, errors: 345, p95: 234 },
    { endpoint: '/api/tasks', avgResponseTime: 234, requests: 456000, errors: 678, p95: 389 },
    { endpoint: '/api/agents', avgResponseTime: 89, requests: 234000, errors: 123, p95: 156 },
    { endpoint: '/api/workers', avgResponseTime: 167, requests: 189000, errors: 234, p95: 278 },
    { endpoint: '/api/templates', avgResponseTime: 123, requests: 156000, errors: 167, p95: 198 },
  ],
  byTool: [
    { tool: 'git.clone', avgResponseTime: 23, requests: 234567, successRate: 99.2, p95: 45 },
    { tool: 'sast.scan', avgResponseTime: 456, requests: 123456, successRate: 94.5, p95: 678 },
    { tool: 'lint', avgResponseTime: 89, requests: 345678, successRate: 98.7, p95: 134 },
    { tool: 'deploy.service', avgResponseTime: 567, requests: 98765, successRate: 92.3, p95: 789 },
    { tool: 'test.run', avgResponseTime: 234, requests: 234567, successRate: 96.8, p95: 345 },
  ],
  bottlenecks: [
    {
      id: 'b1',
      name: 'SAST Scan Performance',
      description: 'SAST scans are taking longer than expected due to large codebase size',
      impact: 'high',
      currentValue: 456,
      targetValue: 300,
      recommendation: 'Implement incremental scanning and caching',
      savings: '35% faster scans',
    },
    {
      id: 'b2',
      name: 'Database Connection Pool',
      description: 'Connection pool exhaustion during peak hours',
      impact: 'medium',
      currentValue: 85,
      targetValue: 70,
      recommendation: 'Increase connection pool size and implement connection pooling',
      savings: 'Reduced latency by 200ms',
    },
    {
      id: 'b3',
      name: 'API Rate Limiting',
      description: 'Rate limiting causing retries and increased latency',
      impact: 'low',
      currentValue: 12,
      targetValue: 5,
      recommendation: 'Adjust rate limits based on usage patterns',
      savings: 'Reduce error rate by 50%',
    },
  ],
  recommendations: [
    {
      id: 'r1',
      title: 'Optimize SAST Scanning',
      description: 'Implement incremental scanning for faster results',
      impact: 'high',
      effort: 'medium',
      roi: '+35% performance',
      category: 'optimization',
    },
    {
      id: 'r2',
      title: 'Database Indexing',
      description: 'Add indexes to frequently queried fields',
      impact: 'medium',
      effort: 'low',
      roi: '-45% query time',
      category: 'database',
    },
    {
      id: 'r3',
      title: 'CDN Implementation',
      description: 'Use CDN for static assets',
      impact: 'medium',
      effort: 'low',
      roi: '-60% load time',
      category: 'infrastructure',
    },
    {
      id: 'r4',
      title: 'Caching Layer',
      description: 'Implement Redis caching for API responses',
      impact: 'high',
      effort: 'high',
      roi: '-70% response time',
      category: 'caching',
    },
  ],
  healthChecks: [
    {
      id: 'hc1',
      name: 'API Gateway',
      status: 'healthy',
      latency: 45,
      uptime: 99.99,
      lastCheck: '2024-01-20T15:45:00Z',
    },
    {
      id: 'hc2',
      name: 'Database',
      status: 'healthy',
      latency: 23,
      uptime: 99.95,
      lastCheck: '2024-01-20T15:45:00Z',
    },
    {
      id: 'hc3',
      name: 'Redis Cache',
      status: 'degraded',
      latency: 89,
      uptime: 98.5,
      lastCheck: '2024-01-20T15:44:00Z',
    },
    {
      id: 'hc4',
      name: 'Message Queue',
      status: 'healthy',
      latency: 12,
      uptime: 99.98,
      lastCheck: '2024-01-20T15:45:00Z',
    },
  ],
};

const metricCategories = [
  { id: 'all', name: 'All Metrics', icon: Activity },
  { id: 'latency', name: 'Latency', icon: Clock },
  { id: 'throughput', name: 'Throughput', icon: Zap },
  { id: 'errors', name: 'Errors', icon: AlertCircle },
  { id: 'resources', name: 'Resources', icon: Cpu },
];

const timeRanges = [
  { id: '1h', name: 'Last Hour' },
  { id: '6h', name: 'Last 6 Hours' },
  { id: '24h', name: 'Last 24 Hours' },
  { id: '7d', name: 'Last 7 Days' },
  { id: '30d', name: 'Last 30 Days' },
];

export default function PerformancePage() {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'comparison'>('overview');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showBottlenecks, setShowBottlenecks] = useState(true);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'healthy': return 'text-emerald-400 bg-emerald-500/10';
      case 'degraded': return 'text-amber-400 bg-amber-500/10';
      case 'down': return 'text-rose-400 bg-rose-500/10';
      default: return 'text-zinc-400 bg-zinc-500/10';
    }
  };

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'high': return 'text-rose-400 bg-rose-500/10';
      case 'medium': return 'text-amber-400 bg-amber-500/10';
      case 'low': return 'text-emerald-400 bg-emerald-500/10';
      default: return 'text-zinc-400 bg-zinc-500/10';
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">
            <span className="gradient-text-primary">Performance Analytics</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm lg:text-base">
            Monitor and optimize system performance
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
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              autoRefresh
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-900/50 text-zinc-400 hover:text-indigo-400'
            )}
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={() => toast.success('Performance data exported')}
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
              <Timer className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs text-zinc-400">Avg Response</p>
                <p className="text-lg font-bold text-white">{mockPerformanceData.overview.avgResponseTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs text-zinc-400">Throughput</p>
                <p className="text-lg font-bold text-emerald-400">{formatNumber(mockPerformanceData.overview.throughput)}/s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs text-zinc-400">Success Rate</p>
                <p className="text-lg font-bold text-amber-400">{mockPerformanceData.overview.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs text-zinc-400">Uptime</p>
                <p className="text-lg font-bold text-purple-400">{mockPerformanceData.overview.uptime}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Latency Percentiles */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gauge className="w-5 h-5 text-indigo-400" />
              Latency Percentiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(mockPerformanceData.overview.latency).map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-xs text-zinc-400 uppercase">{key}</p>
                  <p className="text-xl font-bold text-white">{value}ms</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Performance Chart */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <LineChart className="w-5 h-5 text-indigo-400" />
                Performance Trends
              </CardTitle>
              <div className="flex items-center gap-2">
                {['responseTime', 'throughput', 'errors'].map((metric) => (
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
                <ComposedChart data={mockPerformanceData.timeSeriesData}>
                  <XAxis dataKey="timestamp" stroke="#71717a" />
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
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#6366f1"
                    strokeWidth={2}
                    name="Response Time (ms)"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="throughput"
                    fill="#8b5cf6"
                    name="Throughput (req/s)"
                    opacity={0.5}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="errors"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Errors"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Endpoint Performance */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                Endpoint Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPerformanceData.byEndpoint.map((endpoint) => (
                  <div
                    key={endpoint.endpoint}
                    className="flex items-center justify-between p-2 hover:bg-slate-800/30 rounded-lg cursor-pointer"
                    onClick={() => setSelectedEndpoint(endpoint.endpoint)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{endpoint.endpoint}</span>
                        <Badge variant="outline" className="border-indigo-500/30">
                          {formatNumber(endpoint.requests)} req
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-400">
                        <span>Avg: {endpoint.avgResponseTime}ms</span>
                        <span>P95: {endpoint.p95}ms</span>
                        <span>Errors: {endpoint.errors}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {endpoint.avgResponseTime}ms
                      </div>
                      <Progress
                        value={(endpoint.avgResponseTime / 500) * 100}
                        className="w-20 h-1 bg-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tool Performance */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                Tool Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPerformanceData.byTool.map((tool) => (
                  <div key={tool.tool} className="flex items-center justify-between p-2 hover:bg-slate-800/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{tool.tool}</span>
                        <Badge variant="outline" className="border-indigo-500/30">
                          {tool.successRate}% success
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-zinc-400">
                        <span>Avg: {tool.avgResponseTime}ms</span>
                        <span>P95: {tool.p95}ms</span>
                        <span>{formatNumber(tool.requests)} calls</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">
                        {tool.avgResponseTime}ms
                      </div>
                      <Progress
                        value={(tool.avgResponseTime / 800) * 100}
                        className="w-20 h-1 bg-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Health Checks */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {mockPerformanceData.healthChecks.map((check) => (
                <div
                  key={check.id}
                  className="p-3 bg-slate-800/30 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">{check.name}</span>
                    <Badge className={getStatusColor(check.status)}>
                      {check.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Latency</span>
                      <span className="text-white">{check.latency}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Uptime</span>
                      <span className="text-white">{check.uptime}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Last Check</span>
                      <span className="text-white">
                        {format(new Date(check.lastCheck), 'HH:mm:ss')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottlenecks & Recommendations */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Performance Bottlenecks */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-400" />
                Performance Bottlenecks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPerformanceData.bottlenecks.map((bottleneck) => (
                  <div
                    key={bottleneck.id}
                    className="p-3 bg-slate-800/30 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-white">{bottleneck.name}</h4>
                        <p className="text-xs text-zinc-400 mt-1">{bottleneck.description}</p>
                      </div>
                      <Badge className={getImpactColor(bottleneck.impact)}>
                        {bottleneck.impact} impact
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="p-2 bg-slate-900/50 rounded">
                        <p className="text-xs text-zinc-400">Current</p>
                        <p className="text-sm font-medium text-white">{bottleneck.currentValue}ms</p>
                      </div>
                      <div className="p-2 bg-slate-900/50 rounded">
                        <p className="text-xs text-zinc-400">Target</p>
                        <p className="text-sm font-medium text-emerald-400">{bottleneck.targetValue}ms</p>
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-indigo-500/10 rounded">
                      <p className="text-xs text-indigo-400">💡 {bottleneck.recommendation}</p>
                      <p className="text-xs text-emerald-400 mt-1">✨ Potential savings: {bottleneck.savings}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Optimization Recommendations */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPerformanceData.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-start justify-between p-3 bg-slate-800/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-white">{rec.title}</h4>
                      <p className="text-xs text-zinc-400 mt-1">{rec.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getImpactColor(rec.impact)}>
                          {rec.impact} impact
                        </Badge>
                        <Badge variant="outline" className="border-indigo-500/30">
                          {rec.effort} effort
                        </Badge>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                          ROI: {rec.roi}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Metrics Modal */}
      <AnimatePresence>
        {selectedEndpoint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedEndpoint(null)}
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
                  <CardTitle className="text-white">Endpoint Details: {selectedEndpoint}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Average Response Time</p>
                      <p className="text-2xl font-bold text-white">234ms</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Requests (24h)</p>
                      <p className="text-2xl font-bold text-white">45.6K</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Error Rate</p>
                      <p className="text-2xl font-bold text-rose-400">2.3%</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Peak Load</p>
                      <p className="text-2xl font-bold text-amber-400">1.2K req/s</p>
                    </div>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockPerformanceData.timeSeriesData.slice(0, 12)}>
                        <XAxis dataKey="timestamp" stroke="#71717a" />
                        <YAxis stroke="#71717a" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            border: '1px solid #6366f1',
                            borderRadius: '8px',
                          }}
                        />
                        <Line type="monotone" dataKey="responseTime" stroke="#6366f1" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setSelectedEndpoint(null)}
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