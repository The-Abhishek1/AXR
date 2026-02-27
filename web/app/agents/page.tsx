// app/agents/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cpu, 
  Activity, 
  Clock, 
  Server, 
  Wifi, 
  WifiOff,
  HardDrive,
  Search,
  X,
  Zap,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

interface Agent {
  agent_id: string;
  tools: any[];
  capacity: number;
  running: number;
  last_seen: number;
  is_live?: boolean;
  latency_ms?: number;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'live' | 'dead'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/agents');
      // Add mock data for demonstration if API returns empty
      const agentsData = res.data.agents || [];
      
      // Add live status based on last_seen
      const now = Date.now() / 1000; // convert to seconds
      const enrichedAgents = agentsData.map((agent: Agent) => ({
        ...agent,
        is_live: (now - (agent.last_seen || 0)) < 30, // Consider live if seen in last 30 seconds
        latency_ms: agent.last_seen ? Math.round((now - agent.last_seen) * 1000) : 999999,
      }));
      
      setAgents(enrichedAgents);
    } catch (error) {
      console.error('Failed to fetch agents', error);
      toast.error('Failed to fetch agents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAgents();
  };

  const getToolName = (tool: any): string => {
    if (typeof tool === 'string') return tool;
    if (tool?.tool_name) return tool.tool_name;
    if (tool?.name) return tool.name;
    return 'Unknown';
  };

  // Filter agents based on search and status
  const filteredAgents = useMemo(() => {
    let result = [...agents];

    // Apply status filter
    if (filter === 'live') {
      result = result.filter(a => a.is_live);
    } else if (filter === 'dead') {
      result = result.filter(a => !a.is_live);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(agent => 
        agent.agent_id.toLowerCase().includes(query) ||
        agent.tools?.some(tool => getToolName(tool).toLowerCase().includes(query))
      );
    }

    return result;
  }, [agents, filter, searchQuery]);

  const stats = useMemo(() => ({
    total: agents.length,
    live: agents.filter(a => a.is_live).length,
    dead: agents.filter(a => !a.is_live).length,
    totalCapacity: agents.reduce((acc, a) => acc + (a.capacity || 0), 0),
    activeTasks: agents.reduce((acc, a) => acc + (a.running || 0), 0),
    avgLatency: agents.length > 0 
      ? Math.round(agents.reduce((acc, a) => acc + (a.latency_ms || 0), 0) / agents.length)
      : 0,
  }), [agents]);

  // Generate random chart data for each agent
  const generateChartData = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      time: i,
      load: Math.random() * 100,
    }));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 h-full overflow-auto scrollbar-thin">
        <div className="h-8 w-48 bg-zinc-800 rounded-lg animate-pulse" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-12 bg-zinc-800 rounded-lg animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800">
        <div className="p-4 lg:p-6 space-y-4">
          {/* Title and Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Agents
              </h1>
              <p className="text-xs lg:text-sm text-zinc-400 mt-1">Monitor and manage your worker agents</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-2 py-1 lg:px-3 lg:py-1.5 text-xs">
                <Server className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 text-emerald-400" />
                <span className="hidden sm:inline">Capacity: </span>{stats.totalCapacity}
              </Badge>
              <Badge variant="outline" className="px-2 py-1 lg:px-3 lg:py-1.5 text-xs">
                <Zap className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2 text-blue-400" />
                <span className="hidden sm:inline">Active: </span>{stats.activeTasks}
              </Badge>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-1.5 lg:p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <RefreshCw className={cn('w-4 h-4 lg:w-5 lg:h-5', refreshing && 'animate-spin')} />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="p-1.5 lg:p-2 rounded-lg bg-purple-500/10">
                    <Server className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Total</p>
                    <p className="text-lg lg:text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="p-1.5 lg:p-2 rounded-lg bg-emerald-500/10">
                    <Wifi className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Live</p>
                    <p className="text-lg lg:text-2xl font-bold text-emerald-400">{stats.live}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="p-1.5 lg:p-2 rounded-lg bg-red-500/10">
                    <WifiOff className="w-4 h-4 lg:w-5 lg:h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Dead</p>
                    <p className="text-lg lg:text-2xl font-bold text-red-400">{stats.dead}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="p-1.5 lg:p-2 rounded-lg bg-blue-500/10">
                    <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">Tasks</p>
                    <p className="text-lg lg:text-2xl font-bold text-blue-400">{stats.activeTasks}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search agents by ID or tool..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white placeholder-zinc-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-zinc-400 hover:text-white" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 lg:gap-2 border-b border-zinc-800">
            {(['all', 'live', 'dead'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium transition-all relative',
                  filter === f
                    ? 'text-emerald-400'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ml-1 lg:ml-2 text-xs text-zinc-600">
                  ({f === 'all' ? stats.total : f === 'live' ? stats.live : stats.dead})
                </span>
                {filter === f && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-xs lg:text-sm text-zinc-400">
            Showing {filteredAgents.length} of {agents.length} agents
          </div>
        </div>
      </div>

      {/* Agents Grid with Custom Scrollbar */}
      <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent hover:scrollbar-thumb-emerald-500/40">
        <div className="p-4 lg:p-6">
          {filteredAgents.length === 0 ? (
            <div className="text-center py-12">
              <Server className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400">No agents found</p>
              <p className="text-sm text-zinc-600 mt-2">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {filteredAgents.map((agent, index) => {
                const loadPercent = agent.capacity > 0 
                  ? Math.min(100, ((agent.running || 0) / agent.capacity) * 100)
                  : 0;
                
                const chartData = generateChartData();

                return (
                  <motion.div
                    key={agent.agent_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="group hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden">
                      <CardContent className="p-4 lg:p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3 lg:mb-4">
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div className={cn(
                              'p-1.5 lg:p-2 rounded-lg transition-all duration-300 group-hover:scale-110',
                              agent.is_live ? 'bg-emerald-500/20' : 'bg-red-500/20'
                            )}>
                              <Cpu className={cn(
                                'w-4 h-4 lg:w-5 lg:h-5',
                                agent.is_live ? 'text-emerald-400' : 'text-red-400'
                              )} />
                            </div>
                            <div>
                              <p className="font-mono text-xs lg:text-sm text-white">
                                {agent.agent_id.length > 20 
                                  ? `${agent.agent_id.slice(0, 8)}...${agent.agent_id.slice(-4)}`
                                  : agent.agent_id}
                              </p>
                              <div className="flex items-center gap-1 lg:gap-2 mt-0.5 lg:mt-1">
                                <Badge 
                                  variant={agent.is_live ? 'success' : 'destructive'}
                                  className="text-[10px] lg:text-xs px-1 lg:px-2 py-0"
                                >
                                  {agent.is_live ? 'LIVE' : 'DEAD'}
                                </Badge>
                                {agent.latency_ms !== undefined && (
                                  <span className={cn(
                                    'text-[10px] lg:text-xs',
                                    agent.latency_ms < 1000 ? 'text-emerald-400' : 
                                    agent.latency_ms < 5000 ? 'text-yellow-400' : 'text-red-400'
                                  )}>
                                    {agent.latency_ms}ms
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Clock className="w-3 h-3 lg:w-4 lg:h-4 text-zinc-400" />
                        </div>

                        {/* Capacity Bar */}
                        <div className="space-y-1 lg:space-y-2 mb-3 lg:mb-4">
                          <div className="flex justify-between text-[10px] lg:text-xs">
                            <span className="text-zinc-400">Load</span>
                            <span className={cn(
                              'font-medium',
                              loadPercent > 80 ? 'text-red-400' : 'text-emerald-400'
                            )}>
                              {agent.running || 0}/{agent.capacity || 0}
                            </span>
                          </div>
                          <div className="w-full h-1.5 lg:h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${loadPercent}%` }}
                              transition={{ duration: 0.5 }}
                              className={cn(
                                'h-full rounded-full transition-all',
                                loadPercent > 80 ? 'bg-red-500' : 'bg-emerald-500'
                              )}
                            />
                          </div>
                        </div>

                        {/* Mini Chart */}
                        <div className="h-10 lg:h-12 mb-3 lg:mb-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <Line
                                type="monotone"
                                dataKey="load"
                                stroke={agent.is_live ? '#10b981' : '#ef4444'}
                                strokeWidth={1.5}
                                dot={false}
                                isAnimationActive={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Tools */}
                        <div>
                          <p className="text-[10px] lg:text-xs text-zinc-400 mb-1 lg:mb-2 flex items-center gap-1">
                            <HardDrive className="w-3 h-3" />
                            Tools ({agent.tools?.length || 0})
                          </p>
                          <div className="flex flex-wrap gap-1 max-h-12 lg:max-h-16 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
                            {agent.tools?.map((tool: any, idx: number) => {
                              const toolName = getToolName(tool);
                              return (
                                <Badge 
                                  key={`${agent.agent_id}-${toolName}-${idx}`}
                                  variant="outline"
                                  className="text-[10px] lg:text-xs px-1 lg:px-2 py-0 bg-zinc-800/50"
                                >
                                  {toolName.length > 15 ? `${toolName.slice(0, 12)}...` : toolName}
                                </Badge>
                              );
                            })}
                            {(!agent.tools || agent.tools.length === 0) && (
                              <span className="text-[10px] lg:text-xs text-zinc-500">No tools</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}