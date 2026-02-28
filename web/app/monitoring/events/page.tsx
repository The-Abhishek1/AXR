// app/monitoring/events/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Activity,
  Bell,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Eye,
  EyeOff,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  LineChart,
  FileJson,
  FileText,
  Copy,
  Terminal,
  Cpu,
  Server,
  Database,
  Globe,
  Shield,
  Zap,
  Users,
  Settings,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart as ReLineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Mock events data
const mockEvents = [
  {
    id: 'evt-1',
    type: 'workflow.started',
    level: 'info',
    source: 'workflow-engine',
    message: 'Workflow "deploy-service" started',
    details: {
      workflowId: 'wf-123',
      version: '1.2.3',
      triggeredBy: 'admin@axr.io',
    },
    timestamp: '2024-01-20T15:45:00Z',
    processId: 'proc-123',
    stepId: null,
  },
  {
    id: 'evt-2',
    type: 'workflow.completed',
    level: 'success',
    source: 'workflow-engine',
    message: 'Workflow "deploy-service" completed successfully',
    details: {
      workflowId: 'wf-123',
      duration: '45s',
      steps: 6,
    },
    timestamp: '2024-01-20T15:45:45Z',
    processId: 'proc-123',
    stepId: null,
  },
  {
    id: 'evt-3',
    type: 'step.failed',
    level: 'error',
    source: 'step-executor',
    message: 'Step "deploy.service" failed: Connection timeout',
    details: {
      stepId: 'step-456',
      error: 'Connection timeout after 30s',
      retryCount: 2,
    },
    timestamp: '2024-01-20T15:30:00Z',
    processId: 'proc-124',
    stepId: 'step-456',
  },
  {
    id: 'evt-4',
    type: 'agent.status',
    level: 'warning',
    source: 'agent-manager',
    message: 'Agent "agent-3" is running slow',
    details: {
      agentId: 'agent-3',
      latency: 567,
      threshold: 500,
    },
    timestamp: '2024-01-20T15:15:00Z',
    processId: null,
    stepId: null,
  },
  {
    id: 'evt-5',
    type: 'budget.warning',
    level: 'warning',
    source: 'budget-service',
    message: 'Monthly budget at 85%',
    details: {
      current: 8500,
      limit: 10000,
      percentage: 85,
    },
    timestamp: '2024-01-20T14:30:00Z',
    processId: null,
    stepId: null,
  },
  {
    id: 'evt-6',
    type: 'security.alert',
    level: 'error',
    source: 'security-scanner',
    message: 'Critical vulnerability found in dependency',
    details: {
      package: 'lodash',
      version: '4.17.20',
      severity: 'critical',
      cve: 'CVE-2024-12345',
    },
    timestamp: '2024-01-20T13:45:00Z',
    processId: null,
    stepId: null,
  },
  {
    id: 'evt-7',
    type: 'workflow.paused',
    level: 'info',
    source: 'workflow-engine',
    message: 'Workflow "data-pipeline" paused by user',
    details: {
      workflowId: 'wf-456',
      pausedBy: 'john@axr.io',
    },
    timestamp: '2024-01-20T12:20:00Z',
    processId: 'proc-456',
    stepId: null,
  },
  {
    id: 'evt-8',
    type: 'agent.connected',
    level: 'success',
    source: 'agent-manager',
    message: 'New agent connected: agent-7',
    details: {
      agentId: 'agent-7',
      version: '2.1.0',
      capabilities: ['git.clone', 'sast.scan'],
    },
    timestamp: '2024-01-20T11:10:00Z',
    processId: null,
    stepId: null,
  },
  {
    id: 'evt-9',
    type: 'step.started',
    level: 'info',
    source: 'step-executor',
    message: 'Step "sast.scan" started',
    details: {
      stepId: 'step-789',
      workflowId: 'wf-789',
    },
    timestamp: '2024-01-20T10:05:00Z',
    processId: 'proc-789',
    stepId: 'step-789',
  },
  {
    id: 'evt-10',
    type: 'step.completed',
    level: 'success',
    source: 'step-executor',
    message: 'Step "sast.scan" completed',
    details: {
      stepId: 'step-789',
      duration: '23s',
      findings: 0,
    },
    timestamp: '2024-01-20T10:05:23Z',
    processId: 'proc-789',
    stepId: 'step-789',
  },
  {
    id: 'evt-11',
    type: 'system.startup',
    level: 'info',
    source: 'system',
    message: 'System started successfully',
    details: {
      version: '2.5.0',
      mode: 'production',
    },
    timestamp: '2024-01-20T09:00:00Z',
    processId: null,
    stepId: null,
  },
  {
    id: 'evt-12',
    type: 'system.shutdown',
    level: 'warning',
    source: 'system',
    message: 'System shutting down for maintenance',
    details: {
      scheduled: true,
      duration: '15m',
    },
    timestamp: '2024-01-20T08:45:00Z',
    processId: null,
    stepId: null,
  },
];

const eventTypes = [
  { id: 'all', name: 'All Events', icon: Activity },
  { id: 'workflow', name: 'Workflow', icon: Zap },
  { id: 'step', name: 'Step', icon: Settings },
  { id: 'agent', name: 'Agent', icon: Server },
  { id: 'system', name: 'System', icon: Cpu },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'budget', name: 'Budget', icon: Database },
];

const eventLevels = [
  { id: 'all', name: 'All Levels' },
  { id: 'success', name: 'Success', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  { id: 'info', name: 'Info', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  { id: 'warning', name: 'Warning', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  { id: 'error', name: 'Error', color: 'text-rose-400', bgColor: 'bg-rose-500/10' },
];

// Mock event statistics
const eventStats = [
  { hour: '00:00', events: 45, errors: 2, warnings: 5 },
  { hour: '01:00', events: 32, errors: 0, warnings: 3 },
  { hour: '02:00', events: 28, errors: 1, warnings: 2 },
  { hour: '03:00', events: 25, errors: 0, warnings: 1 },
  { hour: '04:00', events: 30, errors: 0, warnings: 2 },
  { hour: '05:00', events: 35, errors: 1, warnings: 3 },
  { hour: '06:00', events: 48, errors: 2, warnings: 4 },
  { hour: '07:00', events: 56, errors: 1, warnings: 6 },
  { hour: '08:00', events: 78, errors: 3, warnings: 8 },
  { hour: '09:00', events: 92, errors: 4, warnings: 10 },
  { hour: '10:00', events: 87, errors: 2, warnings: 7 },
  { hour: '11:00', events: 95, errors: 3, warnings: 9 },
  { hour: '12:00', events: 102, errors: 5, warnings: 12 },
  { hour: '13:00', events: 98, errors: 3, warnings: 8 },
  { hour: '14:00', events: 88, errors: 2, warnings: 6 },
  { hour: '15:00', events: 76, errors: 1, warnings: 5 },
];

const eventTypeDistribution = [
  { name: 'Workflow', value: 456, color: '#6366f1' },
  { name: 'Step', value: 324, color: '#8b5cf6' },
  { name: 'Agent', value: 234, color: '#d946ef' },
  { name: 'System', value: 123, color: '#ec4899' },
  { name: 'Security', value: 45, color: '#f43f5e' },
  { name: 'Budget', value: 23, color: '#f97316' },
];

export default function EventsPage() {
  const [events, setEvents] = useState(mockEvents);
  const [filteredEvents, setFilteredEvents] = useState(mockEvents);
  const [liveMode, setLiveMode] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [search, setSearch] = useState('');
  const [timeRange, setTimeRange] = useState('1h');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'compact' | 'detailed'>('list');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [fullscreen, setFullscreen] = useState(false);
  
  const eventsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Simulate live events
  useEffect(() => {
    if (liveMode) {
      const interval = setInterval(() => {
        const newEvent = generateMockEvent();
        setEvents(prev => [newEvent, ...prev].slice(0, 1000)); // Keep last 1000 events
        if (autoScroll) {
          scrollToBottom();
        }
        toast.success('New event received', { icon: '🔔' });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [liveMode, autoScroll]);

  // Filter events
  useEffect(() => {
    let filtered = events;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(e => e.type.startsWith(selectedType));
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(e => e.level === selectedLevel);
    }

    // Filter by search
    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter(e =>
        e.message.toLowerCase().includes(query) ||
        e.source.toLowerCase().includes(query) ||
        e.type.toLowerCase().includes(query) ||
        JSON.stringify(e.details).toLowerCase().includes(query)
      );
    }

    // Filter by time range
    const now = new Date();
    const timeLimit = new Date(now);
    switch (timeRange) {
      case '1h':
        timeLimit.setHours(now.getHours() - 1);
        break;
      case '6h':
        timeLimit.setHours(now.getHours() - 6);
        break;
      case '24h':
        timeLimit.setDate(now.getDate() - 1);
        break;
      case '7d':
        timeLimit.setDate(now.getDate() - 7);
        break;
    }
    filtered = filtered.filter(e => new Date(e.timestamp) >= timeLimit);

    setFilteredEvents(filtered);
  }, [events, selectedType, selectedLevel, search, timeRange]);

  const generateMockEvent = () => {
    const types = ['workflow.started', 'step.completed', 'agent.status', 'system.info'];
    const levels = ['info', 'success', 'warning'];
    const sources = ['workflow-engine', 'step-executor', 'agent-manager', 'system'];
    
    return {
      id: `evt-${Date.now()}`,
      type: types[Math.floor(Math.random() * types.length)],
      level: levels[Math.floor(Math.random() * levels.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      message: `New event at ${new Date().toLocaleTimeString()}`,
      details: {},
      timestamp: new Date().toISOString(),
      processId: `proc-${Math.floor(Math.random() * 1000)}`,
      stepId: `step-${Math.floor(Math.random() * 1000)}`,
    };
  };

  const scrollToBottom = () => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearEvents = () => {
    if (confirm('Are you sure you want to clear all events?')) {
      setEvents([]);
      toast.success('Events cleared');
    }
  };

  const handleExportEvents = (format: 'json' | 'csv') => {
    const data = format === 'json' 
      ? JSON.stringify(filteredEvents, null, 2)
      : convertToCSV(filteredEvents);
    
    const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events-${new Date().toISOString()}.${format}`;
    a.click();
    toast.success(`Events exported as ${format.toUpperCase()}`);
  };

  const convertToCSV = (events: any[]) => {
    const headers = ['Timestamp', 'Type', 'Level', 'Source', 'Message', 'Process ID', 'Step ID'];
    const rows = events.map(e => [
      e.timestamp,
      e.type,
      e.level,
      e.source,
      e.message,
      e.processId || '',
      e.stepId || '',
    ]);
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'success': return CheckCircle;
      case 'info': return Info;
      case 'warning': return AlertTriangle;
      case 'error': return AlertCircle;
      default: return Activity;
    }
  };

  const getLevelColor = (level: string) => {
    const levelInfo = eventLevels.find(l => l.id === level);
    return levelInfo?.color || 'text-zinc-400';
  };

  const getLevelBg = (level: string) => {
    const levelInfo = eventLevels.find(l => l.id === level);
    return levelInfo?.bgColor || 'bg-zinc-500/10';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return format(date, 'MMM d, HH:mm');
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
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <div className={cn(
      'space-y-6 max-w-7xl mx-auto p-4 lg:p-6',
      fullscreen && 'fixed inset-0 z-50 bg-slate-950 overflow-auto'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">
            <span className="gradient-text-primary">Event Stream</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm lg:text-base">
            Real-time system events and logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLiveMode(!liveMode)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              liveMode
                ? 'bg-emerald-500/20 text-emerald-400 animate-pulse'
                : 'bg-slate-900/50 text-zinc-400 hover:text-indigo-400'
            )}
            title={liveMode ? 'Live mode active' : 'Enable live mode'}
          >
            {liveMode ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            {fullscreen ? (
              <Minimize2 className="w-5 h-5 text-indigo-400" />
            ) : (
              <Maximize2 className="w-5 h-5 text-indigo-400" />
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors">
                <Download className="w-5 h-5 text-indigo-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900 border-indigo-500/20">
              <DropdownMenuItem onClick={() => handleExportEvents('json')}>
                <FileJson className="w-4 h-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportEvents('csv')}>
                <FileText className="w-4 h-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={handleClearEvents}
            className="p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-rose-400" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stream" className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-indigo-500/20">
          <TabsTrigger value="stream">Live Stream</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Live Stream Tab */}
        <TabsContent value="stream" className="space-y-4">
          {/* Filters */}
          <div className="space-y-3">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-indigo-500/20"
                />
              </div>

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'px-3 py-2 rounded-lg border transition-all flex items-center gap-2',
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
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    viewMode === 'list'
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'text-zinc-400 hover:text-indigo-400'
                  )}
                >
                  <Activity className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    viewMode === 'compact'
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'text-zinc-400 hover:text-indigo-400'
                  )}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    viewMode === 'detailed'
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'text-zinc-400 hover:text-indigo-400'
                  )}
                >
                  <Plus className="w-4 h-4" />
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
                      {/* Event Type Filter */}
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                      >
                        {eventTypes.map((type) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>

                      {/* Level Filter */}
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                      >
                        {eventLevels.map((level) => (
                          <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                      </select>

                      {/* Auto-scroll Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-400">Auto-scroll</span>
                        <Switch
                          checked={autoScroll}
                          onCheckedChange={setAutoScroll}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-sm text-zinc-400">
              Showing {filteredEvents.length} events
              {liveMode && <span className="text-emerald-400 ml-2">● Live</span>}
            </div>
          </div>

          {/* Events List */}
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardContent className="p-0">
              <div className="h-[600px] overflow-auto font-mono text-sm">
                <AnimatePresence>
                  {filteredEvents.map((event, index) => {
                    const LevelIcon = getLevelIcon(event.level);

                    return (
                      <motion.div
                        key={event.id}
                        variants={item}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.02 }}
                        className={cn(
                          'border-b border-indigo-500/10 last:border-0 hover:bg-slate-800/30 cursor-pointer transition-colors',
                          selectedEvent?.id === event.id && 'bg-indigo-500/10'
                        )}
                        onClick={() => setSelectedEvent(event)}
                      >
                        {viewMode === 'compact' ? (
                          // Compact View
                          <div className="flex items-center gap-3 p-2">
                            <div className={cn('p-1 rounded', getLevelBg(event.level))}>
                              <LevelIcon className={cn('w-3 h-3', getLevelColor(event.level))} />
                            </div>
                            <span className="text-xs text-zinc-500 w-16">
                              {formatTimestamp(event.timestamp)}
                            </span>
                            <Badge className={cn('text-xs', getLevelBg(event.level), getLevelColor(event.level))}>
                              {event.level}
                            </Badge>
                            <span className="text-xs text-indigo-400 w-24 truncate">
                              {event.type}
                            </span>
                            <span className="text-xs text-white flex-1 truncate">
                              {event.message}
                            </span>
                          </div>
                        ) : viewMode === 'detailed' ? (
                          // Detailed View
                          <div className="p-4 space-y-2">
                            <div className="flex items-start gap-3">
                              <div className={cn('p-2 rounded', getLevelBg(event.level))}>
                                <LevelIcon className={cn('w-4 h-4', getLevelColor(event.level))} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-white">
                                    {event.type}
                                  </span>
                                  <Badge className={cn('text-xs', getLevelBg(event.level), getLevelColor(event.level))}>
                                    {event.level}
                                  </Badge>
                                  <span className="text-xs text-zinc-500">
                                    {new Date(event.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-sm text-zinc-300 mb-2">{event.message}</p>
                                <div className="flex flex-wrap gap-4 text-xs text-zinc-400">
                                  <span>Source: {event.source}</span>
                                  {event.processId && <span>Process: {event.processId}</span>}
                                  {event.stepId && <span>Step: {event.stepId}</span>}
                                </div>
                                {Object.keys(event.details).length > 0 && (
                                  <pre className="mt-2 text-xs bg-slate-950 p-2 rounded overflow-auto max-h-32">
                                    {JSON.stringify(event.details, null, 2)}
                                  </pre>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          // List View (Default)
                          <div className="flex items-start gap-3 p-3">
                            <div className={cn('p-1.5 rounded', getLevelBg(event.level))}>
                              <LevelIcon className={cn('w-4 h-4', getLevelColor(event.level))} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-zinc-500">
                                  {formatTimestamp(event.timestamp)}
                                </span>
                                <Badge className={cn('text-xs', getLevelBg(event.level), getLevelColor(event.level))}>
                                  {event.level}
                                </Badge>
                                <Badge variant="outline" className="text-xs border-indigo-500/30">
                                  {event.type}
                                </Badge>
                              </div>
                              <p className="text-sm text-white truncate">{event.message}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400">
                                <span>{event.source}</span>
                                {event.processId && <span>• {event.processId}</span>}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={eventsEndRef} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Event Timeline */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <LineChart className="w-5 h-5 text-indigo-400" />
                  Event Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={eventStats}>
                      <defs>
                        <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="hour" stroke="#71717a" />
                      <YAxis stroke="#71717a" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #6366f1',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="events"
                        stroke="#6366f1"
                        fill="url(#colorEvents)"
                        name="Total Events"
                      />
                      <Line
                        type="monotone"
                        dataKey="errors"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Errors"
                      />
                      <Line
                        type="monotone"
                        dataKey="warnings"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        name="Warnings"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Event Type Distribution */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-indigo-400" />
                  Event Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventTypeDistribution}>
                      <XAxis dataKey="name" stroke="#71717a" />
                      <YAxis stroke="#71717a" />
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #6366f1',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                        {eventTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Level Distribution */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Event Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['success', 'info', 'warning', 'error'].map((level) => {
                    const count = events.filter(e => e.level === level).length;
                    const percentage = events.length > 0 ? (count / events.length) * 100 : 0;
                    
                    return (
                      <div key={level}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn('text-sm capitalize', getLevelColor(level))}>
                            {level}
                          </span>
                          <span className="text-sm text-white">{count}</span>
                        </div>
                        <Progress
                          value={percentage}
                          className={cn(
                            'h-2',
                            level === 'success' && 'bg-emerald-500/20',
                            level === 'info' && 'bg-blue-500/20',
                            level === 'warning' && 'bg-amber-500/20',
                            level === 'error' && 'bg-rose-500/20'
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Sources */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-400" />
                  Top Event Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(new Set(events.map(e => e.source))).slice(0, 5).map((source) => {
                    const count = events.filter(e => e.source === source).length;
                    return (
                      <div key={source} className="flex items-center justify-between">
                        <span className="text-sm text-white">{source}</span>
                        <Badge variant="outline" className="border-indigo-500/30">
                          {count} events
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Error Rate</h3>
                <p className="text-3xl font-bold text-rose-400">
                  {((events.filter(e => e.level === 'error').length / events.length) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-zinc-400 mt-2">
                  {events.filter(e => e.level === 'error').length} errors total
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Avg Events/Hour</h3>
                <p className="text-3xl font-bold text-indigo-400">
                  {Math.round(events.length / 24)}
                </p>
                <p className="text-sm text-zinc-400 mt-2">
                  Based on last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Peak Time</h3>
                <p className="text-3xl font-bold text-emerald-400">14:00</p>
                <p className="text-sm text-zinc-400 mt-2">
                  102 events at peak
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Details Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-slate-900 border-indigo-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Event Details</CardTitle>
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="p-1 rounded-lg hover:bg-indigo-500/10"
                    >
                      <XCircle className="w-5 h-5 text-zinc-400" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Event ID</p>
                      <p className="text-sm font-mono text-white">{selectedEvent.id}</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Timestamp</p>
                      <p className="text-sm text-white">
                        {new Date(selectedEvent.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Type</p>
                      <p className="text-sm text-white">{selectedEvent.type}</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Level</p>
                      <Badge className={cn(getLevelBg(selectedEvent.level), getLevelColor(selectedEvent.level))}>
                        {selectedEvent.level}
                      </Badge>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Source</p>
                      <p className="text-sm text-white">{selectedEvent.source}</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <p className="text-xs text-zinc-400">Process ID</p>
                      <p className="text-sm text-white">{selectedEvent.processId || '-'}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-zinc-400 mb-1">Message</p>
                    <p className="text-sm text-white">{selectedEvent.message}</p>
                  </div>

                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-xs text-zinc-400 mb-2">Details</p>
                    <pre className="text-xs bg-slate-950 p-3 rounded overflow-auto max-h-60">
                      {JSON.stringify(selectedEvent.details, null, 2)}
                    </pre>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(selectedEvent, null, 2));
                        toast.success('Copied to clipboard');
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      onClick={() => setSelectedEvent(null)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500"
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}