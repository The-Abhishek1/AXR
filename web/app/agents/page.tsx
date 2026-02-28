// app/agents/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Brain,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Cpu,
  Zap,
  BarChart3,
  TrendingUp,
  ChevronDown,
  Grid3x3,
  List,
  Sparkles,
  Rocket,
  Target,
  Award
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, Agent } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'success' | 'plans'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgents = async () => {
    try {
      const data = await api.getAgents();
      setAgents(data.agents);
    } catch (error) {
      toast.error('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort agents
  const filteredAgents = agents
    .filter((a) => {
      const matchesSearch = 
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.agent_id.toLowerCase().includes(search.toLowerCase()) ||
        a.capabilities.some(c => c.toLowerCase().includes(search.toLowerCase()));
      
      const matchesFilter = filter === 'all' || 
        (filter === 'live' && a.is_live) ||
        (filter === 'dead' && !a.is_live) ||
        (filter === 'idle' && a.status === 'idle') ||
        (filter === 'busy' && a.status === 'busy') ||
        (filter === 'planning' && a.status === 'planning');
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (sortBy === 'success') {
        return sortOrder === 'asc'
          ? a.success_rate - b.success_rate
          : b.success_rate - a.success_rate;
      }
      if (sortBy === 'plans') {
        return sortOrder === 'asc'
          ? a.plans_created - b.plans_created
          : b.plans_created - a.plans_created;
      }
      return 0;
    });

  const stats = {
    total: agents.length,
    live: agents.filter(a => a.is_live).length,
    idle: agents.filter(a => a.status === 'idle').length,
    busy: agents.filter(a => a.status === 'busy').length,
    planning: agents.filter(a => a.status === 'planning').length,
    avgSuccess: agents.length > 0
      ? Math.round(agents.reduce((acc, a) => acc + a.success_rate, 0) / agents.length)
      : 0,
  };

  const generateChartData = () => {
    return Array.from({ length: 10 }, (_, i) => ({
      time: i,
      value: Math.random() * 100,
    }));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'idle': return 'bg-emerald-500';
      case 'busy': return 'bg-amber-500';
      case 'planning': return 'bg-indigo-500';
      default: return 'bg-zinc-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'idle': return 'success';
      case 'busy': return 'warning';
      case 'planning': return 'info';
      default: return 'default';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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
            <span className="gradient-text-primary">AI Agents</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm lg:text-base">
            Intelligent agents that create and manage your workflows
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/agents/new')}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Agent
          </Button>
          
          <button
            onClick={fetchAgents}
            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            <RefreshCw className="w-5 h-5 text-indigo-400" />
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4"
      >
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Total Agents</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Brain className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Live</p>
                <p className="text-xl font-bold text-emerald-400">{stats.live}</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Idle</p>
                <p className="text-xl font-bold text-emerald-400">{stats.idle}</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Busy</p>
                <p className="text-xl font-bold text-amber-400">{stats.busy}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Success Rate</p>
                <p className="text-xl font-bold text-indigo-400">{stats.avgSuccess}%</p>
              </div>
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Target className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={item} className="space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
            <Input
              type="text"
              placeholder="Search agents by name, ID, or capability..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-900/50 border-indigo-500/20 focus:border-indigo-500/40"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'px-4 py-2 rounded-lg border transition-all flex items-center gap-2',
              showFilters
                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                : 'bg-slate-900/50 border-indigo-500/20 text-zinc-400 hover:text-indigo-400'
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          <div className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-lg border border-indigo-500/20">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded transition-colors',
                viewMode === 'grid'
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-zinc-400 hover:text-indigo-400'
              )}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded transition-colors',
                viewMode === 'list'
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-zinc-400 hover:text-indigo-400'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-slate-900/30 rounded-lg border border-indigo-500/20 space-y-3">
                <div className="flex flex-wrap gap-3">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="all">All Agents</option>
                    <option value="live">Live</option>
                    <option value="dead">Dead</option>
                    <option value="idle">Idle</option>
                    <option value="busy">Busy</option>
                    <option value="planning">Planning</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="success">Sort by Success Rate</option>
                    <option value="plans">Sort by Plans Created</option>
                  </select>

                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/10 transition-colors flex items-center gap-2"
                  >
                    <ChevronDown className={cn(
                      'w-4 h-4 transition-transform',
                      sortOrder === 'desc' && 'rotate-180'
                    )} />
                    <span className="text-sm">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-sm text-zinc-400">
          Showing {filteredAgents.length} of {agents.length} agents
        </div>
      </motion.div>

      {/* Agents Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-slate-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredAgents.length === 0 ? (
        <motion.div
          variants={item}
          className="text-center py-12 bg-slate-900/30 rounded-lg border border-indigo-500/20"
        >
          <Brain className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No agents found</p>
          <Button
            onClick={() => router.push('/agents/new')}
            className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create your first agent
          </Button>
        </motion.div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {filteredAgents.map((agent) => {
            const chartData = generateChartData();
            const loadPercent = (agent.plans_created / 100) * 100;

            return (
              <motion.div key={agent.agent_id} variants={item}>
                <Link href={`/agents/${agent.agent_id}`}>
                  <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer group h-full">
                    <CardContent className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'p-2 rounded-lg',
                            agent.is_live ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                          )}>
                            <Brain className={cn(
                              'w-5 h-5',
                              agent.is_live ? 'text-emerald-400' : 'text-rose-400'
                            )} />
                          </div>
                          <div>
                            <p className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                              {agent.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={getStatusBadge(agent.status)}>
                                {agent.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {agent.model}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Sparkles className={cn(
                          'w-4 h-4',
                          agent.is_live ? 'text-emerald-400 animate-pulse' : 'text-zinc-600'
                        )} />
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-slate-800/50 rounded-lg p-2">
                          <p className="text-xs text-zinc-400">Plans</p>
                          <p className="text-lg font-bold text-white">{agent.plans_created}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-2">
                          <p className="text-xs text-zinc-400">Success</p>
                          <p className="text-lg font-bold text-emerald-400">{agent.success_rate.toFixed(1)}%</p>
                        </div>
                      </div>

                      {/* Mini Chart */}
                      <div className="h-12 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={agent.is_live ? '#6366f1' : '#6b7280'}
                              strokeWidth={2}
                              dot={false}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #6366f1',
                                borderRadius: '8px',
                                fontSize: '10px',
                              }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Capabilities */}
                      <div className="mb-4">
                        <p className="text-xs text-zinc-400 mb-2">Capabilities</p>
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                          {agent.capabilities.map((cap, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-slate-800/50">
                              {cap}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-indigo-500/20 pt-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {agent.avg_planning_time}ms avg
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {formatDate(agent.last_seen * 1000)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        // List View
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {filteredAgents.map((agent) => (
            <motion.div key={agent.agent_id} variants={item}>
              <Link href={`/agents/${agent.agent_id}`}>
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/30 border border-indigo-500/20 hover:border-indigo-500/40 transition-all group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={cn(
                      'p-2 rounded-lg',
                      agent.is_live ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                    )}>
                      <Brain className={cn(
                        'w-5 h-5',
                        agent.is_live ? 'text-emerald-400' : 'text-rose-400'
                      )} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                          {agent.name}
                        </p>
                        <Badge variant={getStatusBadge(agent.status)}>
                          {agent.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {agent.model}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-zinc-400">
                          Plans: {agent.plans_created}
                        </span>
                        <span className="text-xs text-emerald-400">
                          Success: {agent.success_rate.toFixed(1)}%
                        </span>
                        <span className="text-xs text-indigo-400">
                          Avg: {agent.avg_planning_time}ms
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge variant={agent.is_live ? 'success' : 'destructive'}>
                      {agent.is_live ? 'Live' : 'Dead'}
                    </Badge>
                    <ChevronDown className="w-4 h-4 text-indigo-400 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}