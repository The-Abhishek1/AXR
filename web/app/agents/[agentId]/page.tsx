'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Brain,
  RefreshCw,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
  Zap,
  BarChart3,
  TrendingUp,
  Target,
  Award,
  Cpu,
  Sparkles,
  Rocket,
  Download,
  Mail,
  MessageSquare,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api, Agent } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import toast from 'react-hot-toast';

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'history'>('overview');

  useEffect(() => {
    fetchAgent();
    const interval = setInterval(fetchAgent, 10000);
    return () => clearInterval(interval);
  }, [agentId]);

  const fetchAgent = async () => {
    try {
      const data = await api.getAgent(agentId);
      setAgent(data);
    } catch (error) {
      toast.error('Failed to fetch agent details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Mock data for charts
  const performanceData = [
    { time: '00:00', success: 95, plans: 12 },
    { time: '04:00', success: 98, plans: 18 },
    { time: '08:00', success: 92, plans: 24 },
    { time: '12:00', success: 96, plans: 32 },
    { time: '16:00', success: 94, plans: 28 },
    { time: '20:00', success: 97, plans: 20 },
  ];

  const capabilityData = agent?.capabilities.map((cap, i) => ({
    name: cap,
    value: Math.floor(Math.random() * 100) + 50,
    color: ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'][i % 5]
  })) || [];

  const historyData = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    time: new Date(Date.now() - i * 3600000).toLocaleTimeString(),
    action: 'Created plan',
    details: `Workflow plan for deployment #${i + 1}`,
    success: Math.random() > 0.1,
  }));

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-32 bg-slate-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-24 bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-24 bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="h-64 bg-slate-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <Card className="bg-slate-900/50 border-indigo-500/20 max-w-md">
          <CardContent className="p-8 text-center">
            <Brain className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Agent Not Found</h2>
            <p className="text-zinc-400 mb-4">The requested AI agent could not be found.</p>
            <Button onClick={() => router.push('/agents')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Agents
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Back Navigation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-indigo-400" />
        </button>
        <span className="text-zinc-400">/</span>
        <Link href="/agents" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">
          AI Agents
        </Link>
        <span className="text-zinc-400">/</span>
        <span className="text-sm text-white">{agent.name}</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            'p-3 rounded-xl',
            agent.is_live ? 'bg-emerald-500/10' : 'bg-rose-500/10'
          )}>
            <Brain className={cn(
              'w-8 h-8',
              agent.is_live ? 'text-emerald-400' : 'text-rose-400'
            )} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text-primary">
                {agent.name}
              </h1>
              <Badge variant={agent.is_live ? 'success' : 'destructive'}>
                {agent.is_live ? 'Live' : 'Offline'}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-zinc-400">ID: {agent.agent_id}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-indigo-400">{agent.model}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(`/agents/${agentId}/chat`)}
            className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/agents/${agentId}/settings`)}
            className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
          <button
            onClick={() => {
              setRefreshing(true);
              fetchAgent();
            }}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            <RefreshCw className={cn('w-5 h-5 text-indigo-400', refreshing && 'animate-spin')} />
          </button>
        </div>
      </motion.div>

      {/* Status Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
      >
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Activity className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Status</p>
                <p className="text-lg font-semibold capitalize text-white">{agent.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Target className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Success Rate</p>
                <p className="text-lg font-semibold text-emerald-400">{agent.success_rate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Rocket className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Plans Created</p>
                <p className="text-lg font-semibold text-white">{agent.plans_created}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Avg Time</p>
                <p className="text-lg font-semibold text-white">{agent.avg_planning_time}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-b border-indigo-500/20"
      >
        <div className="flex gap-6">
          {['overview', 'analytics', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                'pb-3 text-sm font-medium capitalize transition-colors relative',
                activeTab === tab
                  ? 'text-indigo-400'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Agent Info */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-400" />
                  Agent Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-zinc-400">Model</p>
                    <p className="text-sm font-semibold text-white">{agent.model}</p>
                  </div>
                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-zinc-400">Last Seen</p>
                    <p className="text-sm font-semibold text-white">
                      {formatDate(agent.last_seen * 1000)}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-zinc-400">Registered</p>
                    <p className="text-sm font-semibold text-white">
                      {formatDate(agent.registered_at * 1000)}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-zinc-400">Current Task</p>
                    <p className="text-sm font-semibold text-white">
                      {agent.current_task || 'None'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-zinc-400 mb-2">Capabilities</p>
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities.map((cap, i) => (
                      <Badge key={i} variant="outline" className="bg-slate-800/50">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
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
                        dataKey="success"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fill="url(#colorSuccess)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Capability Distribution */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  Capability Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={capabilityData}>
                      <XAxis dataKey="name" stroke="#71717a" />
                      <YAxis stroke="#71717a" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #6366f1',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                        {capabilityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Success Rate */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  Success Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 mb-4">
                    <div className="text-3xl font-bold text-white">
                      {agent.success_rate.toFixed(0)}%
                    </div>
                  </div>
                  <p className="text-zinc-400 text-sm">Overall Success Rate</p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Plans Today</p>
                      <p className="text-lg font-bold text-white">12</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Avg Time</p>
                      <p className="text-lg font-bold text-white">{agent.avg_planning_time}ms</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'history' && (
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {historyData.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {item.success ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <div>
                        <p className="text-sm text-white">{item.action}</p>
                        <p className="text-xs text-zinc-400">{item.details}</p>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-500">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}