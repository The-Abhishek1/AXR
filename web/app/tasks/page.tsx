// app/tasks/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Zap,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  StopCircle,
  ChevronDown,
  Grid3x3,
  List,
  Activity,
  Calendar,
  User,
  Tag,
  Copy,
  Trash2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

// Mock tasks data
const mockTasks = Array.from({ length: 25 }, (_, i) => ({
  id: `task-${i + 1}`,
  name: `Deploy application v1.${i}.${Math.floor(Math.random() * 10)}`,
  status: ['running', 'completed', 'failed', 'pending', 'cancelled'][Math.floor(Math.random() * 5)],
  priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
  agent: `agent-${Math.floor(Math.random() * 5) + 1}`,
  created: Date.now() - Math.random() * 86400000 * 7,
  started: Math.random() > 0.3 ? Date.now() - Math.random() * 3600000 : null,
  completed: Math.random() > 0.6 ? Date.now() - Math.random() * 1800000 : null,
  duration: Math.floor(Math.random() * 300) + 30,
  steps: Math.floor(Math.random() * 8) + 2,
  budget: Math.floor(Math.random() * 50) + 10,
}));

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState(mockTasks);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'created' | 'name' | 'priority'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((t) => {
      const matchesSearch = 
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        t.agent.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = filter === 'all' || t.status === filter;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'created') {
        return sortOrder === 'desc' 
          ? b.created - a.created
          : a.created - b.created;
      }
      if (sortBy === 'name') {
        return sortOrder === 'desc'
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      }
      if (sortBy === 'priority') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return sortOrder === 'desc'
          ? priorityWeight[b.priority as keyof typeof priorityWeight] - priorityWeight[a.priority as keyof typeof priorityWeight]
          : priorityWeight[a.priority as keyof typeof priorityWeight] - priorityWeight[b.priority as keyof typeof priorityWeight];
      }
      return 0;
    });

  const stats = {
    total: tasks.length,
    running: tasks.filter(t => t.status === 'running').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length,
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'running': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'completed': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'failed': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'pending': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'cancelled': return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'text-rose-400 bg-rose-500/10';
      case 'medium': return 'text-amber-400 bg-amber-500/10';
      case 'low': return 'text-emerald-400 bg-emerald-500/10';
      default: return 'text-zinc-400 bg-zinc-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'running': return PlayCircle;
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      case 'pending': return Clock;
      case 'cancelled': return StopCircle;
      default: return Activity;
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedTasks(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedTasks.length === 0) {
      toast.error('No tasks selected');
      return;
    }
    setTasks(prev => prev.filter(t => !selectedTasks.includes(t.id)));
    setSelectedTasks([]);
    toast.success(`${selectedTasks.length} tasks deleted`);
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
            <span className="gradient-text-primary">Tasks</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm lg:text-base">
            Manage and monitor your automation tasks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/tasks/new')}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
          
          <button
            onClick={() => setTasks([...mockTasks])}
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
        className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4"
      >
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Total</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Running</p>
                <p className="text-xl font-bold text-blue-400">{stats.running}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10">
                <PlayCircle className="w-4 h-4 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Completed</p>
                <p className="text-xl font-bold text-emerald-400">{stats.completed}</p>
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
                <p className="text-xs text-zinc-400">Pending</p>
                <p className="text-xl font-bold text-amber-400">{stats.pending}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-zinc-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">Cancelled</p>
                <p className="text-xl font-bold text-zinc-400">{stats.cancelled}</p>
              </div>
              <div className="p-2 rounded-lg bg-zinc-500/10">
                <StopCircle className="w-4 h-4 text-zinc-400" />
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
              placeholder="Search tasks by name, ID, or agent..."
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
                    <option value="all">All Tasks</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    <option value="created">Sort by Created</option>
                    <option value="name">Sort by Name</option>
                    <option value="priority">Sort by Priority</option>
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

                {selectedTasks.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-indigo-500/20">
                    <span className="text-sm text-zinc-400">
                      {selectedTasks.length} selected
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkDelete}
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-sm text-zinc-400">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </motion.div>

      {/* Tasks Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-slate-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <motion.div
          variants={item}
          className="text-center py-12 bg-slate-900/30 rounded-lg border border-indigo-500/20"
        >
          <Zap className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No tasks found</p>
          <Button
            onClick={() => router.push('/tasks/new')}
            className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create your first task
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
          {filteredTasks.map((task) => {
            const StatusIcon = getStatusIcon(task.status);
            
            return (
              <motion.div key={task.id} variants={item}>
                <Link href={`/tasks/${task.id}`}>
                  <Card className={cn(
                    'bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-all cursor-pointer group',
                    selectedTasks.includes(task.id) && 'ring-2 ring-indigo-500'
                  )}>
                    <CardContent className="p-5">
                      {/* Checkbox */}
                      <div className="absolute top-3 right-3">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={(e) => {
                            e.preventDefault();
                            toggleSelect(task.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-indigo-500/30 bg-slate-900 text-indigo-500 focus:ring-indigo-500/50"
                        />
                      </div>

                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={cn('p-2 rounded-lg', getStatusColor(task.status))}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white group-hover:text-indigo-400 transition-colors">
                            {task.name}
                          </p>
                          <p className="text-xs text-zinc-400 mt-1">{task.id}</p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Priority</span>
                          <Badge className={cn('text-xs', getPriorityColor(task.priority))}>
                            {task.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Agent</span>
                          <span className="text-white font-mono">{task.agent}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Steps</span>
                          <span className="text-white">{task.steps}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">Budget</span>
                          <span className="text-white">{task.budget}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {task.status === 'running' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-400">Progress</span>
                            <span className="text-indigo-400">65%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              style={{ width: '65%' }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-indigo-500/20 pt-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(task.created)}
                        </span>
                        {task.duration && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {task.duration}s
                          </span>
                        )}
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
          {filteredTasks.map((task) => {
            const StatusIcon = getStatusIcon(task.status);
            
            return (
              <motion.div key={task.id} variants={item}>
                <Link href={`/tasks/${task.id}`}>
                  <div className={cn(
                    'flex items-center justify-between p-4 rounded-lg bg-slate-900/30 border border-indigo-500/20 hover:border-indigo-500/40 transition-all group',
                    selectedTasks.includes(task.id) && 'ring-2 ring-indigo-500'
                  )}>
                    <div className="flex items-center gap-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={(e) => {
                          e.preventDefault();
                          toggleSelect(task.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-indigo-500/30 bg-slate-900 text-indigo-500"
                      />

                      <div className={cn('p-2 rounded-lg', getStatusColor(task.status))}>
                        <StatusIcon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium text-white group-hover:text-indigo-400 transition-colors">
                            {task.name}
                          </p>
                          <Badge className={cn('text-xs', getPriorityColor(task.priority))}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-indigo-500/30">
                            {task.agent}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-zinc-400">{task.id}</span>
                          <span className="text-xs text-zinc-400">•</span>
                          <span className="text-xs text-zinc-400">{task.steps} steps</span>
                          <span className="text-xs text-zinc-400">•</span>
                          <span className="text-xs text-zinc-400">Budget: {task.budget}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant={task.status === 'completed' ? 'success' : 
                                       task.status === 'running' ? 'info' :
                                       task.status === 'failed' ? 'destructive' :
                                       task.status === 'pending' ? 'warning' : 'secondary'}>
                          {task.status}
                        </Badge>
                        <p className="text-xs text-zinc-400 mt-1">{formatDate(task.created)}</p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-indigo-400 -rotate-90 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}