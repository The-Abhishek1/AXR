// app/monitoring/alerts/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Bell,
  BellRing,
  BellOff,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  Server,
  Cpu,
  HardDrive,
  Network,
  Database,
  Globe,
  Shield,
  Zap,
  Plus,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Filter,
  Search,
  MoreVertical,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Settings,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus as PlusIcon,
  Hash,
  BarChart3,
  LineChart,
  PieChart
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
import { Slider } from '@/components/ui/slider';
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
  CartesianGrid
} from 'recharts';
import toast from 'react-hot-toast';

// Mock alert rules
const mockAlertRules = [
  {
    id: 'alert-1',
    name: 'High CPU Usage',
    description: 'Alert when CPU usage exceeds 90% for 5 minutes',
    type: 'metric',
    metric: 'cpu.usage',
    condition: '>',
    threshold: 90,
    duration: '5m',
    severity: 'critical',
    channels: ['email', 'slack', 'webhook'],
    enabled: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T15:45:00Z',
    createdBy: 'admin@axr.io',
    tags: ['performance', 'infrastructure'],
    cooldown: '15m',
    priority: 1,
  },
  {
    id: 'alert-2',
    name: 'Memory Leak Detection',
    description: 'Alert when memory usage increases by 20% in 10 minutes',
    type: 'metric',
    metric: 'memory.usage',
    condition: 'rate',
    threshold: 20,
    duration: '10m',
    severity: 'warning',
    channels: ['email', 'slack'],
    enabled: true,
    createdAt: '2024-01-10T08:20:00Z',
    updatedAt: '-01-18T09:30:00Z',
    createdBy: 'ops@axr.io',
    tags: ['performance', 'memory'],
    cooldown: '30m',
    priority: 2,
  },
  {
    id: 'alert-3',
    name: 'Workflow Failure Rate',
    description: 'Alert when workflow failure rate exceeds 5%',
    type: 'business',
    metric: 'workflow.failure_rate',
    condition: '>',
    threshold: 5,
    duration: '1h',
    severity: 'critical',
    channels: ['email', 'slack', 'webhook'],
    enabled: true,
    createdAt: '2024-01-05T14:15:00Z',
    updatedAt: '2024-01-17T11:20:00Z',
    createdBy: 'admin@axr.io',
    tags: ['business', 'workflows'],
    cooldown: '1h',
    priority: 1,
  },
  {
    id: 'alert-4',
    name: 'Agent Offline',
    description: 'Alert when agent goes offline for more than 2 minutes',
    type: 'availability',
    metric: 'agent.status',
    condition: '==',
    threshold: 'offline',
    duration: '2m',
    severity: 'warning',
    channels: ['slack', 'webhook'],
    enabled: false,
    createdAt: '2024-01-12T13:45:00Z',
    updatedAt: '2024-01-19T16:30:00Z',
    createdBy: 'ops@axr.io',
    tags: ['agents', 'availability'],
    cooldown: '5m',
    priority: 3,
  },
  {
    id: 'alert-5',
    name: 'Budget Threshold',
    description: 'Alert when monthly budget exceeds 80%',
    type: 'business',
    metric: 'budget.usage',
    condition: '>',
    threshold: 80,
    duration: '1d',
    severity: 'warning',
    channels: ['email'],
    enabled: true,
    createdAt: '2024-01-08T09:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
    createdBy: 'finance@axr.io',
    tags: ['budget', 'finance'],
    cooldown: '1d',
    priority: 2,
  },
  {
    id: 'alert-6',
    name: 'Security Vulnerability',
    description: 'Alert when critical vulnerabilities are found',
    type: 'security',
    metric: 'security.vulnerabilities',
    condition: '>',
    threshold: 0,
    duration: '1m',
    severity: 'critical',
    channels: ['email', 'slack', 'webhook', 'sms'],
    enabled: true,
    createdAt: '2024-01-14T11:00:00Z',
    updatedAt: '2024-01-15T09:45:00Z',
    createdBy: 'security@axr.io',
    tags: ['security', 'vulnerabilities'],
    cooldown: '5m',
    priority: 1,
  },
];

// Mock active alerts
const mockActiveAlerts = [
  {
    id: 'active-1',
    ruleId: 'alert-1',
    ruleName: 'High CPU Usage',
    severity: 'critical',
    status: 'firing',
    value: 95.5,
    threshold: 90,
    startedAt: '2024-01-20T15:30:00Z',
    lastUpdated: '2024-01-20T15:35:00Z',
    resource: 'worker-3',
    labels: {
      host: 'worker-3.prod.axr.io',
      region: 'us-east-1',
    },
    acknowledged: false,
    acknowledgedBy: null,
  },
  {
    id: 'active-2',
    ruleId: 'alert-3',
    ruleName: 'Workflow Failure Rate',
    severity: 'critical',
    status: 'firing',
    value: 7.8,
    threshold: 5,
    startedAt: '2024-01-20T14:15:00Z',
    lastUpdated: '2024-01-20T15:15:00Z',
    resource: 'production',
    labels: {
      workflow: 'deploy-service',
      environment: 'production',
    },
    acknowledged: true,
    acknowledgedBy: 'admin@axr.io',
    acknowledgedAt: '2024-01-20T14:20:00Z',
  },
  {
    id: 'active-3',
    ruleId: 'alert-6',
    ruleName: 'Security Vulnerability',
    severity: 'critical',
    status: 'firing',
    value: 3,
    threshold: 0,
    startedAt: '2024-01-20T13:45:00Z',
    lastUpdated: '2024-01-20T13:45:00Z',
    resource: 'dependencies',
    labels: {
      severity: 'critical',
      package: 'lodash',
    },
    acknowledged: false,
    acknowledgedBy: null,
  },
  {
    id: 'active-4',
    ruleId: 'alert-2',
    ruleName: 'Memory Leak Detection',
    severity: 'warning',
    status: 'firing',
    value: 22.5,
    threshold: 20,
    startedAt: '2024-01-20T12:30:00Z',
    lastUpdated: '2024-01-20T12:40:00Z',
    resource: 'worker-5',
    labels: {
      host: 'worker-5.staging.axr.io',
      region: 'us-west-2',
    },
    acknowledged: false,
    acknowledgedBy: null,
  },
  {
    id: 'active-5',
    ruleId: 'alert-5',
    ruleName: 'Budget Threshold',
    severity: 'warning',
    status: 'firing',
    value: 85,
    threshold: 80,
    startedAt: '2024-01-20T09:00:00Z',
    lastUpdated: '2024-01-20T09:00:00Z',
    resource: 'monthly-budget',
    labels: {
      department: 'engineering',
      month: 'January',
    },
    acknowledged: false,
    acknowledgedBy: null,
  },
];

// Mock alert history
const mockAlertHistory = [
  {
    id: 'history-1',
    ruleId: 'alert-1',
    ruleName: 'High CPU Usage',
    severity: 'critical',
    status: 'resolved',
    value: 95.5,
    threshold: 90,
    startedAt: '2024-01-19T10:30:00Z',
    endedAt: '2024-01-19T10:45:00Z',
    duration: '15m',
    resource: 'worker-2',
    resolvedBy: 'auto',
  },
  {
    id: 'history-2',
    ruleId: 'alert-3',
    ruleName: 'Workflow Failure Rate',
    severity: 'critical',
    status: 'resolved',
    value: 8.2,
    threshold: 5,
    startedAt: '2024-01-19T09:15:00Z',
    endedAt: '2024-01-19T10:00:00Z',
    duration: '45m',
    resource: 'production',
    resolvedBy: 'admin@axr.io',
  },
  {
    id: 'history-3',
    ruleId: 'alert-2',
    ruleName: 'Memory Leak Detection',
    severity: 'warning',
    status: 'resolved',
    value: 21.3,
    threshold: 20,
    startedAt: '2024-01-19T14:20:00Z',
    endedAt: '2024-01-19T15:00:00Z',
    duration: '40m',
    resource: 'worker-4',
    resolvedBy: 'auto',
  },
  {
    id: 'history-4',
    ruleId: 'alert-4',
    ruleName: 'Agent Offline',
    severity: 'warning',
    status: 'resolved',
    value: 'offline',
    threshold: 'offline',
    startedAt: '2024-01-19T11:30:00Z',
    endedAt: '2024-01-19T11:35:00Z',
    duration: '5m',
    resource: 'agent-7',
    resolvedBy: 'auto',
  },
  {
    id: 'history-5',
    ruleId: 'alert-6',
    ruleName: 'Security Vulnerability',
    severity: 'critical',
    status: 'resolved',
    value: 2,
    threshold: 0,
    startedAt: '2024-01-18T16:20:00Z',
    endedAt: '2024-01-18T17:00:00Z',
    duration: '40m',
    resource: 'dependencies',
    resolvedBy: 'security@axr.io',
  },
];

const alertTypes = [
  { id: 'all', name: 'All Alerts', icon: Bell },
  { id: 'metric', name: 'Metric', icon: Activity },
  { id: 'business', name: 'Business', icon: BarChart3 },
  { id: 'availability', name: 'Availability', icon: Server },
  { id: 'security', name: 'Security', icon: Shield },
];

const severityLevels = [
  { id: 'critical', name: 'Critical', color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/20' },
  { id: 'warning', name: 'Warning', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  { id: 'info', name: 'Info', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
];

const conditions = [
  { id: '>', name: 'Greater than', symbol: '>' },
  { id: '>=', name: 'Greater than or equal', symbol: '≥' },
  { id: '<', name: 'Less than', symbol: '<' },
  { id: '<=', name: 'Less than or equal', symbol: '≤' },
  { id: '==', name: 'Equal to', symbol: '=' },
  { id: '!=', name: 'Not equal to', symbol: '≠' },
  { id: 'rate', name: 'Rate of change', symbol: 'Δ' },
];

// Mock chart data for metrics
const metricChartData = [
  { time: '14:00', value: 45, threshold: 90 },
  { time: '14:05', value: 52, threshold: 90 },
  { time: '14:10', value: 68, threshold: 90 },
  { time: '14:15', value: 82, threshold: 90 },
  { time: '14:20', value: 95, threshold: 90 },
  { time: '14:25', value: 88, threshold: 90 },
  { time: '14:30', value: 76, threshold: 90 },
];

export default function AlertsPage() {
  const [alertRules, setAlertRules] = useState(mockAlertRules);
  const [activeAlerts, setActiveAlerts] = useState(mockActiveAlerts);
  const [alertHistory, setAlertHistory] = useState(mockAlertHistory);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'metric',
    metric: '',
    condition: '>',
    threshold: 0,
    duration: '5m',
    severity: 'warning',
    channels: [] as string[],
    tags: [] as string[],
    cooldown: '15m',
    priority: 2,
    enabled: true,
  });

  const filteredActiveAlerts = activeAlerts.filter(alert => {
    const matchesSearch = alert.ruleName.toLowerCase().includes(search.toLowerCase()) ||
                         alert.resource.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || alert.type === selectedType;
    const matchesSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
    return matchesSearch && matchesType && matchesSeverity;
  });

  const stats = {
    totalRules: alertRules.length,
    enabledRules: alertRules.filter(r => r.enabled).length,
    activeAlerts: activeAlerts.length,
    criticalAlerts: activeAlerts.filter(a => a.severity === 'critical').length,
    warningAlerts: activeAlerts.filter(a => a.severity === 'warning').length,
    unacknowledged: activeAlerts.filter(a => !a.acknowledged).length,
  };

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      type: rule.type,
      metric: rule.metric,
      condition: rule.condition,
      threshold: rule.threshold,
      duration: rule.duration,
      severity: rule.severity,
      channels: rule.channels,
      tags: rule.tags,
      cooldown: rule.cooldown,
      priority: rule.priority,
      enabled: rule.enabled,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error('Please enter an alert name');
      return;
    }
    if (!formData.description) {
      toast.error('Please enter an alert description');
      return;
    }
    if (!formData.metric) {
      toast.error('Please enter a metric name');
      return;
    }

    if (editingRule) {
      setAlertRules(prev =>
        prev.map(r =>
          r.id === editingRule.id
            ? {
                ...r,
                ...formData,
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );
      toast.success('Alert rule updated');
    } else {
      const newRule = {
        id: `alert-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin@axr.io',
      };
      setAlertRules([newRule, ...alertRules]);
      toast.success('Alert rule created');
    }

    setShowForm(false);
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      type: 'metric',
      metric: '',
      condition: '>',
      threshold: 0,
      duration: '5m',
      severity: 'warning',
      channels: [],
      tags: [],
      cooldown: '15m',
      priority: 2,
      enabled: true,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this alert rule?')) {
      setAlertRules(alertRules.filter(r => r.id !== id));
      toast.success('Alert rule deleted');
    }
  };

  const handleToggleRule = (id: string) => {
    setAlertRules(prev =>
      prev.map(r =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      )
    );
    toast.success('Alert rule toggled');
  };

  const handleAcknowledge = (id: string) => {
    setActiveAlerts(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, acknowledged: true, acknowledgedBy: 'admin@axr.io', acknowledgedAt: new Date().toISOString() }
          : a
      )
    );
    toast.success('Alert acknowledged');
  };

  const handleResolve = (id: string) => {
    const alert = activeAlerts.find(a => a.id === id);
    if (alert) {
      setActiveAlerts(prev => prev.filter(a => a.id !== id));
      setAlertHistory(prev => [
        {
          id: `history-${Date.now()}`,
          ruleId: alert.ruleId,
          ruleName: alert.ruleName,
          severity: alert.severity,
          status: 'resolved',
          value: alert.value,
          threshold: alert.threshold,
          startedAt: alert.startedAt,
          endedAt: new Date().toISOString(),
          duration: `${Math.floor((Date.now() - new Date(alert.startedAt).getTime()) / 60000)}m`,
          resource: alert.resource,
          resolvedBy: 'admin@axr.io',
        },
        ...prev,
      ]);
      toast.success('Alert resolved');
    }
  };

  const handleSilence = (id: string, duration: string) => {
    toast.success(`Alert silenced for ${duration}`);
  };

  const getSeverityColor = (severity: string) => {
    const level = severityLevels.find(l => l.id === severity);
    return level?.color || 'text-zinc-400';
  };

  const getSeverityBg = (severity: string) => {
    const level = severityLevels.find(l => l.id === severity);
    return level?.bgColor || 'bg-zinc-500/10';
  };

  const getSeverityBorder = (severity: string) => {
    const level = severityLevels.find(l => l.id === severity);
    return level?.borderColor || 'border-zinc-500/20';
  };

  const formatDuration = (startedAt: string) => {
    const start = new Date(startedAt).getTime();
    const now = Date.now();
    const diff = now - start;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
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
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">
            <span className="gradient-text-primary">Alerts</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm lg:text-base">
            Monitor and manage system alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setEditingRule(null);
              setFormData({
                name: '',
                description: '',
                type: 'metric',
                metric: '',
                condition: '>',
                threshold: 0,
                duration: '5m',
                severity: 'warning',
                channels: [],
                tags: [],
                cooldown: '15m',
                priority: 2,
                enabled: true,
              });
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-indigo-500 to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Alert Rule
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-6 gap-4"
      >
        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs text-zinc-400">Total Rules</p>
                <p className="text-lg font-bold text-white">{stats.totalRules}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs text-zinc-400">Enabled</p>
                <p className="text-lg font-bold text-emerald-400">{stats.enabledRules}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-rose-400" />
              <div>
                <p className="text-xs text-zinc-400">Active</p>
                <p className="text-lg font-bold text-rose-400">{stats.activeAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <div>
                <p className="text-xs text-zinc-400">Critical</p>
                <p className="text-lg font-bold text-rose-400">{stats.criticalAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs text-zinc-400">Warning</p>
                <p className="text-lg font-bold text-amber-400">{stats.warningAlerts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs text-zinc-400">Unacknowledged</p>
                <p className="text-lg font-bold text-purple-400">{stats.unacknowledged}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-indigo-500/20">
          <TabsTrigger value="active">
            Active Alerts
            {stats.activeAlerts > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.activeAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="silenced">Silenced</TabsTrigger>
        </TabsList>

        {/* Active Alerts Tab */}
        <TabsContent value="active" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
              <Input
                type="text"
                placeholder="Search alerts by name or resource..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-900/50 border-indigo-500/20"
              />
            </div>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="all">All Severities</option>
              {severityLevels.map((level) => (
                <option key={level.id} value={level.id}>{level.name}</option>
              ))}
            </select>

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
                <BarChart3 className="w-4 h-4" />
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
                <Activity className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Alerts Grid/List */}
          {viewMode === 'grid' ? (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {filteredActiveAlerts.map((alert) => (
                <motion.div key={alert.id} variants={item}>
                  <Card className={cn(
                    'border-l-4',
                    alert.severity === 'critical' ? 'border-l-rose-500' : 'border-l-amber-500',
                    'bg-slate-900/50 hover:border-indigo-500/40 transition-colors'
                  )}>
                    <CardContent className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn('p-2 rounded-lg', getSeverityBg(alert.severity))}>
                            {alert.severity === 'critical' ? (
                              <AlertCircle className={cn('w-5 h-5', getSeverityColor(alert.severity))} />
                            ) : (
                              <AlertTriangle className={cn('w-5 h-5', getSeverityColor(alert.severity))} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-white">{alert.ruleName}</h3>
                            <p className="text-xs text-zinc-400">{alert.resource}</p>
                          </div>
                        </div>
                        <Badge className={cn(getSeverityBg(alert.severity), getSeverityColor(alert.severity))}>
                          {alert.severity}
                        </Badge>
                      </div>

                      {/* Value */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm text-zinc-400">Current Value</p>
                          <p className="text-2xl font-bold text-white">
                            {typeof alert.value === 'number' ? alert.value.toFixed(1) : alert.value}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-zinc-400">Threshold</p>
                          <p className="text-lg font-semibold text-zinc-300">
                            {alert.threshold}
                            {typeof alert.threshold === 'number' && '%'}
                          </p>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                        <Clock className="w-3 h-3" />
                        <span>Duration: {formatDuration(alert.startedAt)}</span>
                        <span>•</span>
                        <span>Started {new Date(alert.startedAt).toLocaleTimeString()}</span>
                      </div>

                      {/* Labels */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {Object.entries(alert.labels).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="border-indigo-500/30">
                            {key}: {value}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!alert.acknowledged && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledge(alert.id)}
                            className="flex-1 border-indigo-500/30 text-indigo-400"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Acknowledge
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolve(alert.id)}
                          className="flex-1 border-emerald-500/30 text-emerald-400"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolve
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="px-2">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-900 border-indigo-500/20">
                            <DropdownMenuItem onClick={() => handleSilence(alert.id, '1h')}>
                              <BellOff className="w-4 h-4 mr-2" />
                              Silence for 1h
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSilence(alert.id, '6h')}>
                              <BellOff className="w-4 h-4 mr-2" />
                              Silence for 6h
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSilence(alert.id, '24h')}>
                              <BellOff className="w-4 h-4 mr-2" />
                              Silence for 24h
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Acknowledged info */}
                      {alert.acknowledged && (
                        <div className="mt-3 pt-3 border-t border-indigo-500/20 text-xs text-zinc-400">
                          <span className="text-indigo-400">Acknowledged</span> by {alert.acknowledgedBy}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            // List View
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {filteredActiveAlerts.map((alert) => (
                <motion.div key={alert.id} variants={item}>
                  <Card className={cn(
                    'border-l-4',
                    alert.severity === 'critical' ? 'border-l-rose-500' : 'border-l-amber-500',
                    'bg-slate-900/50 hover:border-indigo-500/40 transition-colors'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn('p-2 rounded-lg', getSeverityBg(alert.severity))}>
                          {alert.severity === 'critical' ? (
                            <AlertCircle className={cn('w-5 h-5', getSeverityColor(alert.severity))} />
                          ) : (
                            <AlertTriangle className={cn('w-5 h-5', getSeverityColor(alert.severity))} />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium text-white">{alert.ruleName}</h3>
                            <Badge className={cn(getSeverityBg(alert.severity), getSeverityColor(alert.severity))}>
                              {alert.severity}
                            </Badge>
                            {!alert.acknowledged && (
                              <Badge variant="warning">Unacknowledged</Badge>
                            )}
                          </div>

                          <p className="text-sm text-zinc-300 mb-2">
                            Current: {typeof alert.value === 'number' ? alert.value.toFixed(1) : alert.value} / Threshold: {alert.threshold}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Server className="w-3 h-3" />
                              {alert.resource}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(alert.startedAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(alert.startedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!alert.acknowledged && (
                            <button
                              onClick={() => handleAcknowledge(alert.id)}
                              className="p-2 rounded-lg hover:bg-indigo-500/10"
                              title="Acknowledge"
                            >
                              <Eye className="w-4 h-4 text-indigo-400" />
                            </button>
                          )}
                          <button
                            onClick={() => handleResolve(alert.id)}
                            className="p-2 rounded-lg hover:bg-emerald-500/10"
                            title="Resolve"
                          >
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* Alert Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          {/* Rules List */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {alertRules.map((rule) => (
              <motion.div key={rule.id} variants={item}>
                <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn('p-2 rounded-lg', getSeverityBg(rule.severity))}>
                        {rule.severity === 'critical' ? (
                          <AlertCircle className={cn('w-5 h-5', getSeverityColor(rule.severity))} />
                        ) : (
                          <AlertTriangle className={cn('w-5 h-5', getSeverityColor(rule.severity))} />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-white">{rule.name}</h3>
                          <Badge className={cn(getSeverityBg(rule.severity), getSeverityColor(rule.severity))}>
                            {rule.severity}
                          </Badge>
                          <Badge variant={rule.enabled ? 'success' : 'secondary'}>
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>

                        <p className="text-sm text-zinc-300 mb-3">{rule.description}</p>

                        {/* Rule Details */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                          <div className="p-2 bg-slate-800/30 rounded-lg">
                            <p className="text-xs text-zinc-400">Metric</p>
                            <p className="text-sm font-medium text-white">{rule.metric}</p>
                          </div>
                          <div className="p-2 bg-slate-800/30 rounded-lg">
                            <p className="text-xs text-zinc-400">Condition</p>
                            <p className="text-sm font-medium text-white">
                              {rule.condition} {rule.threshold}
                            </p>
                          </div>
                          <div className="p-2 bg-slate-800/30 rounded-lg">
                            <p className="text-xs text-zinc-400">Duration</p>
                            <p className="text-sm font-medium text-white">{rule.duration}</p>
                          </div>
                          <div className="p-2 bg-slate-800/30 rounded-lg">
                            <p className="text-xs text-zinc-400">Cooldown</p>
                            <p className="text-sm font-medium text-white">{rule.cooldown}</p>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {rule.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="border-indigo-500/30">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleRule(rule.id)}
                          className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
                          title={rule.enabled ? 'Disable' : 'Enable'}
                        >
                          {rule.enabled ? (
                            <Pause className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Play className="w-4 h-4 text-emerald-400" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(rule)}
                          className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
                        >
                          <Edit className="w-4 h-4 text-indigo-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardContent className="p-6">
              <div className="space-y-3">
                {alertHistory.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg"
                  >
                    <div className={cn('p-2 rounded-lg', getSeverityBg(alert.severity))}>
                      <CheckCircle className={cn('w-4 h-4', getSeverityColor(alert.severity))} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-white">{alert.ruleName}</h4>
                        <Badge className={cn(getSeverityBg(alert.severity), getSeverityColor(alert.severity))}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-400">
                        {alert.resource} • Duration: {alert.duration} • Resolved by: {alert.resolvedBy}
                      </p>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {new Date(alert.endedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Silenced Tab */}
        <TabsContent value="silenced">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <BellOff className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No silenced alerts</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Alert Rule Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowForm(false)}
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
                  <CardTitle className="text-white">
                    {editingRule ? 'Edit Alert Rule' : 'Create Alert Rule'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Rule Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., High CPU Usage"
                      className="bg-slate-900 border-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                      placeholder="Describe when this alert triggers..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-zinc-400 mb-1 block">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                      >
                        {alertTypes.slice(1).map((type) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-zinc-400 mb-1 block">Severity</label>
                      <select
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                      >
                        {severityLevels.map((level) => (
                          <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Metric Name</label>
                    <Input
                      value={formData.metric}
                      onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                      placeholder="e.g., cpu.usage"
                      className="bg-slate-900 border-indigo-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-zinc-400 mb-1 block">Condition</label>
                      <select
                        value={formData.condition}
                        onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                      >
                        {conditions.map((c) => (
                          <option key={c.id} value={c.id}>{c.symbol} {c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-zinc-400 mb-1 block">Threshold</label>
                      <Input
                        type="number"
                        value={formData.threshold}
                        onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}
                        className="bg-slate-900 border-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-zinc-400 mb-1 block">Duration</label>
                      <select
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                      >
                        <option value="1m">1 minute</option>
                        <option value="5m">5 minutes</option>
                        <option value="15m">15 minutes</option>
                        <option value="30m">30 minutes</option>
                        <option value="1h">1 hour</option>
                        <option value="6h">6 hours</option>
                        <option value="24h">24 hours</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Notification Channels</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['email', 'slack', 'webhook', 'sms'].map((channel) => (
                        <label key={channel} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.channels.includes(channel)}
                            onChange={(e) => {
                              const channels = e.target.checked
                                ? [...formData.channels, channel]
                                : formData.channels.filter(c => c !== channel);
                              setFormData({ ...formData, channels });
                            }}
                            className="rounded border-indigo-500/30 bg-slate-900"
                          />
                          <span className="text-sm text-white capitalize">{channel}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Tags (comma-separated)</label>
                    <Input
                      value={formData.tags.join(', ')}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                        setFormData({ ...formData, tags });
                      }}
                      placeholder="performance, infrastructure, critical"
                      className="bg-slate-900 border-indigo-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-zinc-400 mb-1 block">Cooldown</label>
                      <select
                        value={formData.cooldown}
                        onChange={(e) => setFormData({ ...formData, cooldown: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                      >
                        <option value="5m">5 minutes</option>
                        <option value="15m">15 minutes</option>
                        <option value="30m">30 minutes</option>
                        <option value="1h">1 hour</option>
                        <option value="6h">6 hours</option>
                        <option value="24h">24 hours</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-zinc-400 mb-1 block">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                      >
                        <option value="1">P1 - Critical</option>
                        <option value="2">P2 - High</option>
                        <option value="3">P3 - Medium</option>
                        <option value="4">P4 - Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white">Enable Rule</label>
                    <Switch
                      checked={formData.enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                    >
                      {editingRule ? 'Update' : 'Create'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingRule(null);
                      }}
                      className="flex-1"
                    >
                      Cancel
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