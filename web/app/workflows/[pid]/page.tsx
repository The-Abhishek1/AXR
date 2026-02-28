// app/workflows/[pid]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RefreshCw,
  Clock,
  Layers,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  GitBranch,
  Shield,
  Zap,
  Download,
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api, Process, StepDetail } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import WorkflowGraph from '@/components/graph/WorkflowGraph';
import { mapStepsToGraph } from '@/lib/graph-mapper';
import toast from 'react-hot-toast';

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pid = params.pid as string;

  const [process, setProcess] = useState<Process | null>(null);
  const [steps, setSteps] = useState<StepDetail[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [selectedStep, setSelectedStep] = useState<StepDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'logs'>('overview');

  useEffect(() => {
    fetchProcess();
    const interval = setInterval(fetchProcess, 3000);
    return () => clearInterval(interval);
  }, [pid]);

  const fetchProcess = async () => {
    try {
      const data = await api.getProcess(pid);
      setProcess(data);
      
      // Fetch step details for each step
      const stepDetails = await Promise.all(
        data.steps.map(async (step: any) => {
          try {
            return await api.getStep(step.step_id);
          } catch {
            return step;
          }
        })
      );
      setSteps(stepDetails);
      
      const { nodes, edges } = mapStepsToGraph(stepDetails);
      setNodes(nodes);
      setEdges(edges);
    } catch (error) {
      toast.error('Failed to fetch process details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAction = async (action: 'pause' | 'resume' | 'cancel') => {
    try {
      setRefreshing(true);
      let result;
      if (action === 'pause') result = await api.pauseProcess(pid);
      if (action === 'resume') result = await api.resumeProcess(pid);
      if (action === 'cancel') result = await api.cancelProcess(pid);
      
      toast.success(`Process ${action}ed successfully`);
      await fetchProcess();
    } catch (error) {
      toast.error(`Failed to ${action} process`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleNodeClick = (_: any, node: any) => {
    const step = steps.find(s => s.step_id === node.id);
    setSelectedStep(step || null);
  };

  const handleExportLogs = () => {
    // Mock export - in real app, this would call an API
    const data = JSON.stringify({ process, steps }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${pid}.json`;
    a.click();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-32 bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-96 bg-slate-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!process) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <Card className="bg-slate-900/50 border-indigo-500/20 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Process Not Found</h2>
            <p className="text-zinc-400 mb-4">The requested process could not be found.</p>
            <Button onClick={() => router.push('/workflows')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Workflows
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
        <Link href="/workflows" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">
          Workflows
        </Link>
        <span className="text-zinc-400">/</span>
        <span className="text-sm text-white font-mono">{pid.slice(0, 8)}...</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold gradient-text-primary">
              Workflow Details
            </h1>
            <Badge variant={getStatusVariant(process.state)} className="text-sm">
              {process.state}
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 font-mono">{pid}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Process Controls */}
          {process.state === 'RUNNING' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleAction('pause')}
                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                <PauseCircle className="w-4 h-4 mr-2" />
                Pause
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAction('cancel')}
                className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
          
          {process.state === 'PAUSED' && (
            <Button
              variant="outline"
              onClick={() => handleAction('resume')}
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Resume
            </Button>
          )}

          <Button
            variant="outline"
            onClick={handleExportLogs}
            className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <button
            onClick={() => {
              setRefreshing(true);
              fetchProcess();
            }}
            disabled={refreshing}
            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            <RefreshCw className={cn('w-5 h-5 text-indigo-400', refreshing && 'animate-spin')} />
          </button>
        </div>
      </motion.div>

      {/* Overview Cards */}
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
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Total Steps</p>
                <p className="text-xl font-bold text-white">{process.steps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Completed</p>
                <p className="text-xl font-bold text-emerald-400">
                  {steps.filter(s => s.status === 'SUCCESS').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Running</p>
                <p className="text-xl font-bold text-amber-400">
                  {steps.filter(s => s.status === 'RUNNING').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-rose-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Failed</p>
                <p className="text-xl font-bold text-rose-400">
                  {steps.filter(s => s.status === 'FAILED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Budget Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Budget Usage</span>
              <span className="text-sm font-medium text-white">
                {process.budget_used} / {process.budget_limit}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                style={{ width: `${(process.budget_used / process.budget_limit) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="border-b border-indigo-500/20"
      >
        <div className="flex gap-6">
          {['overview', 'steps', 'logs'].map((tab) => (
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
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Graph - Takes 2 columns */}
            <div className="lg:col-span-2 h-[500px] bg-slate-900/30 rounded-lg border border-indigo-500/20 overflow-hidden">
              <WorkflowGraph
                nodes={nodes}
                edges={edges}
                onNodeClick={handleNodeClick}
              />
            </div>

            {/* Step Details - Takes 1 column */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardContent className="p-4 lg:p-6">
                {selectedStep ? (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Step Details</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-zinc-400">Step ID</p>
                        <p className="text-sm font-mono text-white">{selectedStep.step_id.slice(0, 8)}...</p>
                      </div>
                      <div className="p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-zinc-400">Syscall</p>
                        <p className="text-sm text-indigo-400">{selectedStep.syscall}</p>
                      </div>
                      <div className="p-3 bg-slate-800/50 rounded-lg">
                        <p className="text-xs text-zinc-400">Status</p>
                        <Badge variant={getStatusVariant(selectedStep.status)}>
                          {selectedStep.status}
                        </Badge>
                      </div>
                      {selectedStep.worker && (
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-xs text-zinc-400">Worker</p>
                          <p className="text-sm text-white">{selectedStep.worker}</p>
                        </div>
                      )}
                      {selectedStep.output && (
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <p className="text-xs text-zinc-400 mb-2">Output</p>
                          <pre className="text-xs bg-slate-900 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(selectedStep.output, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <GitBranch className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400">Click on a step to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'steps' && (
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardContent className="p-4 lg:p-6">
              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <motion.div
                    key={step.step_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedStep(step)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn('w-2 h-2 rounded-full', getStatusColor(step.status))} />
                      <span className="text-sm font-mono text-white">{step.syscall}</span>
                      {step.retries ? <Badge variant="outline" className="text-xs">Retry {step.retries}</Badge> : null}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-400">Priority {step.priority}</span>
                      <Badge variant={getStatusVariant(step.status)}>{step.status}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'logs' && (
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardContent className="p-4 lg:p-6">
              <div className="font-mono text-xs space-y-1 bg-slate-950 p-4 rounded-lg overflow-auto max-h-96">
                <p className="text-zinc-400">[2024-01-01 12:00:00] Process started</p>
                <p className="text-emerald-400">[2024-01-01 12:00:01] Step git.clone completed</p>
                <p className="text-emerald-400">[2024-01-01 12:00:02] Step sast.scan completed</p>
                <p className="text-emerald-400">[2024-01-01 12:00:03] Step lint completed</p>
                <p className="text-emerald-400">[2024-01-01 12:00:04] Step deploy.service completed</p>
                <p className="text-emerald-400">[2024-01-01 12:00:05] Process terminated successfully</p>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}

function getStatusVariant(status: string): any {
  const variants: Record<string, any> = {
    RUNNING: 'info',
    SUCCESS: 'success',
    FAILED: 'destructive',
    PENDING: 'warning',
  };
  return variants[status] || 'default';
}