// app/tasks/[taskId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Zap,
  Clock,
  Calendar,
  User,
  Tag,
  FileText,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RefreshCw,
  Download,
  Trash2,
  Edit,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Brain,
  Server,
  GitBranch,
  Shield,
  HardDrive,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

// Mock task data
const mockTask = {
  id: 'task-123',
  name: 'Deploy application v1.2.3',
  description: 'Full CI/CD pipeline for production deployment',
  status: 'running',
  priority: 'high',
  agent: 'agent-1',
  agentName: 'DevSecOps Agent',
  created: Date.now() - 3600000,
  started: Date.now() - 3500000,
  estimatedCompletion: Date.now() + 300000,
  duration: 450,
  steps: [
    { id: 'step-1', name: 'git.clone', status: 'completed', duration: 23, output: 'Cloned repository' },
    { id: 'step-2', name: 'sast.scan', status: 'completed', duration: 156, output: 'No vulnerabilities found' },
    { id: 'step-3', name: 'lint', status: 'running', duration: 45, output: 'Checking code style...' },
    { id: 'step-4', name: 'build', status: 'pending', duration: 0, output: '' },
    { id: 'step-5', name: 'test.run', status: 'pending', duration: 0, output: '' },
    { id: 'step-6', name: 'deploy.service', status: 'pending', duration: 0, output: '' },
  ],
  budget: 75,
  budgetLimit: 100,
  logs: [
    { time: '12:00:01', level: 'info', message: 'Task started' },
    { time: '12:00:02', level: 'info', message: 'Step git.clone started' },
    { time: '12:00:25', level: 'success', message: 'Step git.clone completed' },
    { time: '12:00:26', level: 'info', message: 'Step sast.scan started' },
    { time: '12:03:02', level: 'success', message: 'Step sast.scan completed' },
    { time: '12:03:03', level: 'info', message: 'Step lint started' },
  ],
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.taskId as string;

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'logs'>('overview');
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    fetchTask();
    const interval = setInterval(fetchTask, 3000);
    return () => clearInterval(interval);
  }, [taskId]);

  const fetchTask = async () => {
    try {
      // In production, replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setTask(mockTask);
    } catch (error) {
      toast.error('Failed to fetch task details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAction = async (action: 'pause' | 'resume' | 'cancel' | 'retry') => {
    try {
      setRefreshing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Task ${action}ed successfully`);
      fetchTask();
    } catch (error) {
      toast.error(`Failed to ${action} task`);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      toast.success('Task deleted');
      router.push('/tasks');
    }
  };

  const getStepIcon = (status: string) => {
    switch(status) {
      case 'completed': return CheckCircle;
      case 'running': return PlayCircle;
      case 'failed': return XCircle;
      case 'pending': return Clock;
      default: return Activity;
    }
  };

  const getStepColor = (status: string) => {
    switch(status) {
      case 'completed': return 'text-emerald-400';
      case 'running': return 'text-blue-400 animate-pulse';
      case 'failed': return 'text-rose-400';
      case 'pending': return 'text-zinc-400';
      default: return 'text-zinc-400';
    }
  };

  const completedSteps = task?.steps.filter((s: any) => s.status === 'completed').length || 0;
  const progress = task ? (completedSteps / task.steps.length) * 100 : 0;

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-32 bg-slate-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <Card className="bg-slate-900/50 border-indigo-500/20 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Task Not Found</h2>
            <p className="text-zinc-400 mb-4">The requested task could not be found.</p>
            <Button onClick={() => router.push('/tasks')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tasks
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
        <Link href="/tasks" className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-indigo-400" />
        </Link>
        <span className="text-zinc-400">/</span>
        <Link href="/tasks" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">
          Tasks
        </Link>
        <span className="text-zinc-400">/</span>
        <span className="text-sm text-white">{task.name}</span>
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
            task.status === 'running' ? 'bg-blue-500/10' :
            task.status === 'completed' ? 'bg-emerald-500/10' :
            task.status === 'failed' ? 'bg-rose-500/10' :
            'bg-zinc-500/10'
          )}>
            <Zap className={cn(
              'w-8 h-8',
              task.status === 'running' ? 'text-blue-400' :
              task.status === 'completed' ? 'text-emerald-400' :
              task.status === 'failed' ? 'text-rose-400' :
              'text-zinc-400'
            )} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text-primary">
                {task.name}
              </h1>
              <Badge variant={
                task.status === 'completed' ? 'success' :
                task.status === 'running' ? 'info' :
                task.status === 'failed' ? 'destructive' :
                task.status === 'pending' ? 'warning' : 'secondary'
              }>
                {task.status}
              </Badge>
            </div>
            <p className="text-sm text-zinc-400">{task.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {task.status === 'running' && (
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
          
          {task.status === 'paused' && (
            <Button
              variant="outline"
              onClick={() => handleAction('resume')}
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Resume
            </Button>
          )}

          {task.status === 'failed' && (
            <Button
              variant="outline"
              onClick={() => handleAction('retry')}
              className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => router.push(`/tasks/${taskId}/edit`)}
            className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>

          <Button
            variant="outline"
            onClick={() => {/* Duplicate task */}}
            className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>

          <Button
            variant="outline"
            onClick={handleDelete}
            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>

          <button
            onClick={() => {
              setRefreshing(true);
              fetchTask();
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
                <Brain className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Agent</p>
                <p className="text-sm font-semibold text-white">{task.agentName}</p>
                <p className="text-xs text-zinc-400">{task.agent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Tag className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Priority</p>
                <Badge className={cn(
                  'text-xs',
                  task.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                  task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/20 text-emerald-400'
                )}>
                  {task.priority}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Clock className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Duration</p>
                <p className="text-lg font-semibold text-white">{task.duration}s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Calendar className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Created</p>
                <p className="text-sm font-semibold text-white">{formatDate(task.created)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Overall Progress</span>
              <span className="text-sm font-medium text-white">{completedSteps}/{task.steps.length} steps</span>
            </div>
            <Progress value={progress} className="h-2 bg-slate-800" />
            {task.status === 'running' && task.estimatedCompletion && (
              <p className="text-xs text-zinc-400 mt-2">
                Estimated completion: {formatDate(task.estimatedCompletion)}
              </p>
            )}
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
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Task Details */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Task Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-slate-800/30 rounded-lg">
                  <p className="text-xs text-zinc-400">Description</p>
                  <p className="text-sm text-white mt-1">{task.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-zinc-400">Started</p>
                    <p className="text-sm text-white mt-1">{formatDate(task.started)}</p>
                  </div>
                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-zinc-400">Budget Usage</p>
                    <p className="text-sm text-white mt-1">{task.budget}/{task.budgetLimit}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-zinc-400 mb-2">Tags</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="border-indigo-500/30">
                      automation
                    </Badge>
                    <Badge variant="outline" className="border-indigo-500/30">
                      deployment
                    </Badge>
                    <Badge variant="outline" className="border-indigo-500/30">
                      production
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step Summary */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Step Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {task.steps.slice(0, 4).map((step: any) => {
                    const StepIcon = getStepIcon(step.status);
                    return (
                      <div
                        key={step.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30"
                      >
                        <div className="flex items-center gap-2">
                          <StepIcon className={cn('w-4 h-4', getStepColor(step.status))} />
                          <span className="text-sm text-white">{step.name}</span>
                        </div>
                        <span className={cn('text-xs', getStepColor(step.status))}>
                          {step.status}
                        </span>
                      </div>
                    );
                  })}
                  {task.steps.length > 4 && (
                    <button
                      onClick={() => setActiveTab('steps')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 w-full text-center py-2"
                    >
                      View all {task.steps.length} steps →
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'steps' && (
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-400" />
                Execution Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {task.steps.map((step: any, index: number) => {
                  const StepIcon = getStepIcon(step.status);
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={cn('p-2 rounded-lg', step.status === 'completed' ? 'bg-emerald-500/10' :
                                                          step.status === 'running' ? 'bg-blue-500/10' :
                                                          step.status === 'failed' ? 'bg-rose-500/10' :
                                                          'bg-zinc-500/10')}>
                            <StepIcon className={cn('w-5 h-5', getStepColor(step.status))} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <p className="font-medium text-white">{step.name}</p>
                              <Badge variant={
                                step.status === 'completed' ? 'success' :
                                step.status === 'running' ? 'info' :
                                step.status === 'failed' ? 'destructive' :
                                'secondary'
                              }>
                                {step.status}
                              </Badge>
                              {step.duration > 0 && (
                                <span className="text-xs text-zinc-400">{step.duration}s</span>
                              )}
                            </div>
                            {step.output && (
                              <p className="text-xs text-zinc-400 mt-2">{step.output}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {/* View step details */}}
                          className="p-1 rounded hover:bg-indigo-500/10 transition-colors"
                        >
                          <ChevronDown className="w-4 h-4 text-indigo-400 -rotate-90" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'logs' && (
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-indigo-400" />
                  Execution Logs
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {/* Download logs */}}
                  className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs h-96 overflow-auto">
                {task.logs.map((log: any, idx: number) => (
                  <div key={idx} className="mb-1">
                    <span className="text-zinc-500">[{log.time}]</span>{' '}
                    <span className={cn(
                      log.level === 'error' ? 'text-rose-400' :
                      log.level === 'success' ? 'text-emerald-400' :
                      log.level === 'warning' ? 'text-amber-400' :
                      'text-zinc-300'
                    )}>
                      [{log.level}]
                    </span>{' '}
                    <span className="text-white">{log.message}</span>
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