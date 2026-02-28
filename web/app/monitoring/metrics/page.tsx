// app/monitoring/metrics/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Zap,
  Clock,
  TrendingUp,
  BarChart3,
  LineChart,
  Gauge,
  Server,
  Database,
  Globe,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  LineChart as ReLineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ComposedChart,
  Scatter
} from 'recharts';

// Mock metrics data
const cpuData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  user: Math.floor(Math.random() * 40) + 20,
  system: Math.floor(Math.random() * 20) + 10,
  iowait: Math.floor(Math.random() * 10) + 5,
}));

const memoryData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  used: Math.floor(Math.random() * 60) + 30,
  cached: Math.floor(Math.random() * 20) + 10,
  free: Math.floor(Math.random() * 20) + 10,
}));

const networkData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}:00`,
  rx: Math.floor(Math.random() * 80) + 20,
  tx: Math.floor(Math.random() * 60) + 20,
}));

const diskData = Array.from({ length: 10 }, (_, i) => ({
  name: `disk${i + 1}`,
  read: Math.floor(Math.random() * 100) + 50,
  write: Math.floor(Math.random() * 80) + 30,
  iops: Math.floor(Math.random() * 1000) + 500,
}));

const metrics = [
  { label: 'CPU Usage', value: '45%', icon: Cpu, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { label: 'Memory', value: '6.2/16 GB', icon: HardDrive, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Network', value: '1.2 Gbps', icon: Network, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { label: 'Disk I/O', value: '234 MB/s', icon: Database, color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

export default function MetricsPage() {
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
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Back Navigation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        <Link href="/monitoring" className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-indigo-400" />
        </Link>
        <span className="text-zinc-400">/</span>
        <span className="text-sm text-white">System Metrics</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">
            <span className="gradient-text-primary">System Metrics</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm lg:text-base">
            Detailed system performance metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>

          <button
            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-indigo-400" />
          </button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="bg-slate-900/50 border-indigo-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg', metric.bg)}>
                    <Icon className={cn('w-5 h-5', metric.color)} />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">{metric.label}</p>
                    <p className="text-lg font-semibold text-white">{metric.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* CPU Usage */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                CPU Usage
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">
                  User
                </Badge>
                <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                  System
                </Badge>
                <Badge variant="outline" className="border-amber-500/30 text-amber-400">
                  I/O Wait
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cpuData}>
                  <XAxis dataKey="time" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #6366f1',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="user"
                    stackId="1"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="system"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="iowait"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Memory Usage */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-indigo-400" />
                Memory Usage
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                  Used
                </Badge>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  Cached
                </Badge>
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  Free
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={memoryData}>
                  <XAxis dataKey="time" stroke="#71717a" />
                  <YAxis stroke="#71717a" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #6366f1',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="used"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="cached"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="free"
                    stackId="1"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Network & Disk */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Network I/O */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Network className="w-5 h-5 text-indigo-400" />
                  Network I/O
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">
                    RX
                  </Badge>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                    TX
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* ... inside Network I/O CardContent */}
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {/* ✅ Use ReLineChart here */}
                  <ReLineChart data={networkData}> 
                    <XAxis dataKey="time" stroke="#71717a" />
                    <YAxis stroke="#71717a" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #6366f1',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="rx" stroke="#6366f1" strokeWidth={2} />
                    <Line type="monotone" dataKey="tx" stroke="#8b5cf6" strokeWidth={2} />
                  </ReLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Disk I/O */}
        <motion.div variants={item}>
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                Disk I/O
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={diskData}>
                    <XAxis dataKey="name" stroke="#71717a" />
                    <YAxis stroke="#71717a" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #6366f1',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="read" fill="#6366f1" />
                    <Bar dataKey="write" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}