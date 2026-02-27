// app/agents-ai/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Cpu,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Bot,
  Sparkles,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

interface AIAgent {
  agent_id: string;
  name: string;
  model: string;
  capabilities: string[];
  status: 'idle' | 'planning' | 'busy';
  plans_created: number;
  success_rate: number;
  avg_planning_time: number;
  last_seen: number;
  is_live: boolean;
}

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/agents');
      setAgents(res.data.agents);
    } catch (error) {
      console.error('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-emerald-500/20 text-emerald-400';
      case 'planning': return 'bg-blue-500/20 text-blue-400 animate-pulse';
      case 'busy': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-zinc-800 rounded-lg animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
            AI Planning Agents
          </h1>
          <p className="text-zinc-400 mt-2">Intelligent agents that create workflow plans</p>
        </div>
        <Badge variant="outline" className="px-3 py-1.5">
          <Brain className="w-4 h-4 mr-2 text-purple-400" />
          {agents.length} Active
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent, idx) => (
          <motion.div
            key={agent.agent_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="group hover:shadow-lg hover:shadow-purple-500/5 transition-all">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Bot className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{agent.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {agent.model}
                        </Badge>
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded-full',
                          agent.is_live ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        )}>
                          {agent.is_live ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    getStatusColor(agent.status)
                  )}>
                    {agent.status}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-zinc-800/50 rounded-lg p-2">
                    <p className="text-xs text-zinc-400">Plans Created</p>
                    <p className="text-lg font-bold text-white">{agent.plans_created}</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-2">
                    <p className="text-xs text-zinc-400">Success Rate</p>
                    <p className="text-lg font-bold text-emerald-400">{agent.success_rate.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="mb-4">
                  <p className="text-xs text-zinc-400 mb-2">Capabilities</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.map((cap, i) => (
                      <Badge key={i} variant="outline" className="text-xs bg-zinc-800/50">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Footer Stats */}
                <div className="flex justify-between text-xs text-zinc-400 border-t border-zinc-800 pt-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {agent.avg_planning_time}ms avg
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Last seen: {new Date(agent.last_seen * 1000).toLocaleTimeString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}