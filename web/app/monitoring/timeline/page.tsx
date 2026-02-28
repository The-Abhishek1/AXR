// app/monitoring/timeline/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  ArrowLeft,
  Calendar,
  Filter,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Timeline } from '@/components/monitoring/Timeline';
import { format } from 'date-fns';

// Mock timeline data
const generateTimelineData = () => {
  const processes = ['workflow-1', 'workflow-2', 'workflow-3', 'workflow-4'];
  const steps = ['git.clone', 'sast.scan', 'lint', 'deploy.service', 'test.run', 'build.image'];
  const statuses = ['success', 'failed', 'running', 'pending'];
  
  const now = Date.now();
  const data = [];
  
  for (let i = 0; i < 20; i++) {
    const startTime = now - Math.random() * 3600000 * 24;
    const duration = Math.random() * 300000 + 60000;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    data.push({
      id: `step-${i}`,
      processId: processes[Math.floor(Math.random() * processes.length)],
      name: steps[Math.floor(Math.random() * steps.length)],
      startTime,
      endTime: status === 'running' ? 0 : startTime + duration,
      status,
      duration: status === 'running' ? 0 : duration,
    });
  }
  
  return data.sort((a, b) => b.startTime - a.startTime);
};

export default function TimelinePage() {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [zoom, setZoom] = useState(1);
  const [selectedProcess, setSelectedProcess] = useState('all');

  useEffect(() => {
    fetchTimelineData();
    const interval = setInterval(fetchTimelineData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTimelineData = async () => {
    try {
      // In production, replace with actual API call
      // const data = await api.getTimeline();
      const data = generateTimelineData();
      setTimelineData(data);
    } catch (error) {
      console.error('Failed to fetch timeline data');
    } finally {
      setLoading(false);
    }
  };

  const processes = ['all', ...new Set(timelineData.map((d: any) => d.processId))];

  const filteredData = timelineData.filter((d: any) => 
    selectedProcess === 'all' || d.processId === selectedProcess
  );

  const stats = {
    total: timelineData.length,
    success: timelineData.filter((d: any) => d.status === 'success').length,
    failed: timelineData.filter((d: any) => d.status === 'failed').length,
    running: timelineData.filter((d: any) => d.status === 'running').length,
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
        <span className="text-sm text-white">Execution Timeline</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">
            <span className="gradient-text-primary">Execution Timeline</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm lg:text-base">
            Visualize process execution over time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-lg border border-indigo-500/20">
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
              className="p-1.5 rounded hover:bg-indigo-500/10 transition-colors"
            >
              <ZoomOut className="w-4 h-4 text-indigo-400" />
            </button>
            <span className="text-xs text-zinc-400 px-1">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-1.5 rounded hover:bg-indigo-500/10 transition-colors"
            >
              <ZoomIn className="w-4 h-4 text-indigo-400" />
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
          </select>

          <button
            onClick={() => {/* Export timeline */}}
            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            <Download className="w-5 h-5 text-indigo-400" />
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
      >
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Total Steps</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Activity className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Successful</p>
                <p className="text-xl font-bold text-emerald-400">{stats.success}</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-rose-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Failed</p>
                <p className="text-xl font-bold text-rose-400">{stats.failed}</p>
              </div>
              <div className="p-2 rounded-lg bg-rose-500/10">
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Running</p>
                <p className="text-xl font-bold text-amber-400">{stats.running}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <PlayCircle className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-wrap gap-3">
        <select
          value={selectedProcess}
          onChange={(e) => setSelectedProcess(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          {processes.map((p) => (
            <option key={p} value={p}>
              {p === 'all' ? 'All Processes' : `Process: ${p.slice(0, 8)}...`}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(), 'MMM dd, yyyy')}</span>
        </div>
      </motion.div>

      {/* Timeline */}
      <motion.div variants={item}>
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4 lg:p-6">
            {loading ? (
              <div className="h-96 bg-slate-800/50 rounded-lg animate-pulse" />
            ) : (
              <Timeline data={filteredData} zoom={zoom} />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}