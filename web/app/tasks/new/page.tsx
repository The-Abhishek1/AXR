// app/tasks/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Zap,
  Brain,
  Server,
  Clock,
  Calendar,
  Tag,
  User,
  FileText,
  Settings,
  PlayCircle,
  Save,
  Rocket,
  Sparkles,
  Plus,
  X,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NewTaskPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    agent: '',
    schedule: 'now',
    budget: 100,
    steps: [] as string[],
    notifications: true,
    timeout: 3600,
  });

  const [currentStep, setCurrentStep] = useState('');

  const agents = [
    { id: 'agent-1', name: 'DevSecOps Agent', model: 'gpt-4o', status: 'idle' },
    { id: 'agent-2', name: 'Data Pipeline Agent', model: 'gpt-4o-mini', status: 'busy' },
    { id: 'agent-3', name: 'Infrastructure Agent', model: 'claude-3', status: 'idle' },
    { id: 'agent-4', name: 'Testing Agent', model: 'gpt-3.5', status: 'idle' },
    { id: 'agent-5', name: 'Security Agent', model: 'gpt-4', status: 'busy' },
  ];

  const templates = [
    { id: 'ci-cd', name: 'CI/CD Pipeline', steps: ['git.clone', 'build', 'test.run', 'deploy.service'] },
    { id: 'security', name: 'Security Scan', steps: ['git.clone', 'sast.scan', 'dast.scan', 'dependency.check'] },
    { id: 'data', name: 'Data Pipeline', steps: ['extract.data', 'transform.data', 'load.data', 'validate.data'] },
  ];

  const availableSteps = [
    { id: 'git.clone', name: 'Git Clone', category: 'git' },
    { id: 'sast.scan', name: 'SAST Scan', category: 'security' },
    { id: 'lint', name: 'Lint', category: 'code' },
    { id: 'build', name: 'Build', category: 'build' },
    { id: 'test.run', name: 'Run Tests', category: 'test' },
    { id: 'deploy.service', name: 'Deploy Service', category: 'deploy' },
    { id: 'dependency.check', name: 'Check Dependencies', category: 'security' },
    { id: 'extract.data', name: 'Extract Data', category: 'data' },
    { id: 'transform.data', name: 'Transform Data', category: 'data' },
    { id: 'load.data', name: 'Load Data', category: 'data' },
  ];

  const addStep = () => {
    if (currentStep && !taskData.steps.includes(currentStep)) {
      setTaskData(prev => ({
        ...prev,
        steps: [...prev.steps, currentStep]
      }));
      setCurrentStep('');
    }
  };

  const removeStep = (step: string) => {
    setTaskData(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s !== step)
    }));
  };

  const useTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setTaskData(prev => ({
        ...prev,
        name: template.name,
        steps: template.steps,
        description: `Automated ${template.name.toLowerCase()} workflow`
      }));
      toast.success(`Template "${template.name}" applied`);
    }
  };

  const handleSubmit = async () => {
    if (!taskData.name) {
      toast.error('Please enter a task name');
      return;
    }
    if (taskData.steps.length === 0) {
      toast.error('Please add at least one step');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Task created successfully');
      router.push('/tasks');
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
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
        <span className="text-sm text-white">Create New Task</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl lg:text-4xl font-bold">
          <span className="gradient-text-primary">Create New Task</span>
        </h1>
        <p className="text-zinc-400 mt-1 text-sm lg:text-base">
          Define your automation task with steps and configuration
        </p>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
              step >= i
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                : 'bg-slate-800 text-zinc-400'
            )}>
              {i}
            </div>
            {i < 3 && (
              <div className={cn(
                'flex-1 h-1 mx-2 rounded',
                step > i ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-slate-800'
              )} />
            )}
          </div>
        ))}
      </motion.div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Task Name</label>
                <Input
                  value={taskData.name}
                  onChange={(e) => setTaskData({ ...taskData, name: e.target.value })}
                  placeholder="e.g., Deploy application to production"
                  className="bg-slate-900 border-indigo-500/20 focus:border-indigo-500/40"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Description</label>
                <Textarea
                  value={taskData.description}
                  onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                  placeholder="Describe what this task does..."
                  rows={3}
                  className="bg-slate-900 border-indigo-500/20 focus:border-indigo-500/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Priority</label>
                  <select
                    value={taskData.priority}
                    onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Budget</label>
                  <Input
                    type="number"
                    value={taskData.budget}
                    onChange={(e) => setTaskData({ ...taskData, budget: parseInt(e.target.value) })}
                    className="bg-slate-900 border-indigo-500/20 focus:border-indigo-500/40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => setStep(2)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500"
            >
              Next Step
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Steps Configuration */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          {/* Templates */}
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Quick Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {templates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    onClick={() => useTemplate(template.id)}
                    className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10"
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Steps Builder */}
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                Task Steps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={currentStep}
                  onChange={(e) => setCurrentStep(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                >
                  <option value="">Select a step...</option>
                  {availableSteps.map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.name} ({step.category})
                    </option>
                  ))}
                </select>
                <Button
                  onClick={addStep}
                  disabled={!currentStep}
                  className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-2">
                {taskData.steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-zinc-400">#{index + 1}</span>
                      <span className="text-sm text-white">{step}</span>
                    </div>
                    <button
                      onClick={() => removeStep(step)}
                      className="p-1 rounded hover:bg-rose-500/10 transition-colors"
                    >
                      <X className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                ))}
                {taskData.steps.length === 0 && (
                  <div className="text-center py-8 text-zinc-400">
                    No steps added yet. Add steps to define your task.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={taskData.steps.length === 0}
              className="bg-gradient-to-r from-indigo-500 to-purple-500"
            >
              Next Step
            </Button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Agent & Schedule */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-400" />
                Select Agent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {agents.map((agent) => (
                  <label
                    key={agent.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors',
                      taskData.agent === agent.id
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-indigo-500/20 hover:border-indigo-500/30'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="agent"
                        value={agent.id}
                        checked={taskData.agent === agent.id}
                        onChange={(e) => setTaskData({ ...taskData, agent: e.target.value })}
                        className="w-4 h-4 text-indigo-500 border-indigo-500/30 bg-slate-900 focus:ring-indigo-500/50"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{agent.name}</p>
                        <p className="text-xs text-zinc-400">{agent.model}</p>
                      </div>
                    </div>
                    <Badge variant={agent.status === 'idle' ? 'success' : 'warning'}>
                      {agent.status}
                    </Badge>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">When to run</label>
                  <select
                    value={taskData.schedule}
                    onChange={(e) => setTaskData({ ...taskData, schedule: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="now">Run now</option>
                    <option value="later">Schedule for later</option>
                    <option value="recurring">Recurring</option>
                  </select>
                </div>

                {taskData.schedule === 'later' && (
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Schedule time</label>
                    <Input
                      type="datetime-local"
                      className="bg-slate-900 border-indigo-500/20 focus:border-indigo-500/40"
                    />
                  </div>
                )}

                {taskData.schedule === 'recurring' && (
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Cron expression</label>
                    <Input
                      placeholder="0 0 * * *"
                      className="bg-slate-900 border-indigo-500/20 focus:border-indigo-500/40 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Timeout (seconds)</label>
                  <Input
                    type="number"
                    value={taskData.timeout}
                    onChange={(e) => setTaskData({ ...taskData, timeout: parseInt(e.target.value) })}
                    className="bg-slate-900 border-indigo-500/20 focus:border-indigo-500/40"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={taskData.notifications}
                    onChange={(e) => setTaskData({ ...taskData, notifications: e.target.checked })}
                    className="rounded border-indigo-500/30 bg-slate-900 text-indigo-500 focus:ring-indigo-500/50"
                  />
                  <label htmlFor="notifications" className="text-sm text-zinc-400">
                    Send notifications on completion
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !taskData.agent}
              className="bg-gradient-to-r from-emerald-500 to-green-500"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}