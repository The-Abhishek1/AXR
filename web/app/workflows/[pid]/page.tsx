// app/workflows/[pid]/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { getProcesses } from '@/lib/api';
import { mapStepsToGraph } from '@/lib/graph-mapper';
import StatusBadge from '@/components/ui/StatusBadge';
import BudgetBar from '@/components/ui/BudgetBar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PlayCircle, 
  PauseCircle, 
  StopCircle, 
  RotateCcw, 
  RefreshCw,
  Clock,
  Layers,
  DollarSign,
  AlertCircle,
  Activity
} from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

// Import Resizable components directly (not dynamically)
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/components/ui/resizable';

// Dynamic imports with proper loading states
const WorkflowGraph = dynamic(
  () => import('@/components/graph/WorkflowGraph'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-zinc-900 rounded-xl animate-pulse flex items-center justify-center">
        <Activity className="w-8 h-8 text-zinc-700 animate-spin" />
      </div>
    )
  }
);

const StepDetailsPanel = dynamic(
  () => import('@/components/graph/StepDetailsPanel'),
  { 
    ssr: false,
    loading: () => (
      <Card className="h-full">
        <CardContent className="p-6 flex items-center justify-center h-full">
          <Activity className="w-6 h-6 text-zinc-700 animate-spin" />
        </CardContent>
      </Card>
    )
  }
);

export default function WorkflowDetailPage() {
  const params = useParams();
  const pid = params.pid as string;

  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [selectedStep, setSelectedStep] = useState<any>(null);
  const [process, setProcess] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function fetchData() {
      try {
        const data = await getProcesses();
        const proc = data.processes.find(
          (p: any) => p.pid === decodeURIComponent(pid)
        );

        if (!proc) return;

        setProcess(proc);
        setSteps(proc.steps);

        const { nodes, edges } = mapStepsToGraph(proc.steps);
        setNodes(nodes);
        setEdges(edges);
      } catch (error) {
        console.error('Failed to fetch process data');
        toast.error('Failed to fetch process data');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    }

    fetchData();
    interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, [pid]);

  const handleProcessAction = async (action: 'pause' | 'resume' | 'cancel') => {
    try {
      setIsRefreshing(true);
      const endpoint = `http://127.0.0.1:8000/process/${pid}/${action}`;
      const response = await axios.post(endpoint);
      
      if (response.status === 200) {
        toast.success(`Process ${action}ed successfully`);
        
        // Refresh data
        const data = await getProcesses();
        const proc = data.processes.find((p: any) => p.pid === pid);
        setProcess(proc);
      }
    } catch (error) {
      toast.error(`Failed to ${action} process`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNodeClick = (_: any, node: any) => {
    const step = steps.find((s) => s.step_id === node.id);
    setSelectedStep(step);
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      RUNNING: 'bg-blue-500',
      TERMINATED: 'bg-emerald-500',
      FAILED: 'bg-red-500',
      PENDING: 'bg-yellow-500',
      PAUSED: 'bg-orange-500',
      SUCCESS: 'bg-emerald-500',
    };
    return colors[status] || 'bg-zinc-500';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton height={80} className="bg-zinc-800" />
        <Skeleton height={120} className="bg-zinc-800" />
        <Skeleton height={500} className="bg-zinc-800" />
      </div>
    );
  }

  if (!process) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Process Not Found</h2>
            <p className="text-zinc-400">The requested process could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full gap-3">
        {/* Left Panel */}
        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="pr-2 space-y-4 h-full overflow-auto scrollbar-thin scrollbar-thumb-zinc-800">
            {/* Process Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-zinc-900 to-zinc-950">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5" />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-xl font-mono text-white bg-zinc-800/50 px-3 py-1 rounded-lg">
                          {process.pid.slice(0, 8)}...{process.pid.slice(-4)}
                        </h1>
                        <StatusBadge status={process.state} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date().toLocaleString()}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          {process.steps.length} steps
                        </span>
                      </div>
                    </div>
                    
                    {/* Process Controls */}
                    <div className="flex items-center gap-2">
                      <AnimatePresence mode="wait">
                        {process.state === 'RUNNING' && (
                          <motion.div
                            key="running-controls"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex gap-2"
                          >
                            <button
                              onClick={() => handleProcessAction('pause')}
                              className="p-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 transition-all group relative overflow-hidden"
                              title="Pause Process"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                              <PauseCircle className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => handleProcessAction('cancel')}
                              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all group relative overflow-hidden"
                              title="Cancel Process"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                              <StopCircle className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                            </button>
                          </motion.div>
                        )}
                        {process.state === 'PAUSED' && (
                          <motion.div
                            key="paused-controls"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            <button
                              onClick={() => handleProcessAction('resume')}
                              className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition-all group relative overflow-hidden"
                              title="Resume Process"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                              <PlayCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button
                        onClick={() => {
                          setIsRefreshing(true);
                          window.location.reload();
                        }}
                        disabled={isRefreshing}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors group relative overflow-hidden"
                        title="Refresh"
                      >
                        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                      </button>
                    </div>
                  </div>

                  <BudgetBar used={process.budget_used} limit={process.budget_limit} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Metrics Grid */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-4"
            >
              {[
                { label: 'Total Steps', value: process.steps.length, icon: Layers, color: 'text-blue-400' },
                { label: 'Budget Used', value: process.budget_used, icon: DollarSign, color: 'text-emerald-400' },
                { label: 'Budget Limit', value: process.budget_limit, icon: AlertCircle, color: 'text-purple-400' },
              ].map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                  >
                    <Card className="hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-zinc-400">{metric.label}</p>
                            <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                          </div>
                          <div className={`p-3 rounded-xl bg-zinc-800/50 ${metric.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Graph */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="h-[500px] rounded-xl overflow-hidden shadow-2xl"
            >
              <WorkflowGraph
                nodes={nodes}
                edges={edges}
                onNodeClick={handleNodeClick}
              />
            </motion.div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel */}
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="pl-2 h-full">
            <StepDetailsPanel step={selectedStep} stepList={steps} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}