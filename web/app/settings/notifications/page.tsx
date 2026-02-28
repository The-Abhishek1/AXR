// app/settings/notifications/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellRing,
  BellOff,
  Mail,
  MessageSquare,
  Slack,
  Webhook,
  Smartphone,
  Globe,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Settings,
  Plus,
  Edit,
  Trash2,
  Copy,
  TestTube,
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
  Users,
  Tag,
  Flag,
  Star,
  Award,
  Activity,
  Shield
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
import toast from 'react-hot-toast';

// Mock notification rules
const mockRules = [
  {
    id: 'rule-1',
    name: 'Critical Alerts',
    description: 'Immediate notifications for critical issues',
    type: 'alert',
    severity: 'critical',
    channels: ['email', 'slack', 'webhook'],
    conditions: {
      event: 'workflow.failed',
      threshold: 1,
      timeWindow: '5m',
    },
    enabled: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T15:45:00Z',
    createdBy: 'admin@axr.io',
    recipients: ['oncall@axr.io', '#alerts'],
    cooldown: '15m',
    rateLimit: 10,
  },
  {
    id: 'rule-2',
    name: 'Budget Warnings',
    description: 'Notifications when budget exceeds thresholds',
    type: 'budget',
    severity: 'warning',
    channels: ['email', 'slack'],
    conditions: {
      metric: 'cost',
      threshold: 80,
      operator: '>',
      timeWindow: '1h',
    },
    enabled: true,
    createdAt: '2024-01-10T08:20:00Z',
    updatedAt: '2024-01-18T09:30:00Z',
    createdBy: 'finance@axr.io',
    recipients: ['finance@axr.io', '#finance'],
    cooldown: '1h',
    rateLimit: 5,
  },
  {
    id: 'rule-3',
    name: 'Workflow Status',
    description: 'Daily summary of workflow executions',
    type: 'summary',
    severity: 'info',
    channels: ['email'],
    conditions: {
      schedule: 'daily',
      time: '09:00',
      include: ['success', 'failed', 'running'],
    },
    enabled: true,
    createdAt: '2024-01-05T14:15:00Z',
    updatedAt: '2024-01-17T11:20:00Z',
    createdBy: 'admin@axr.io',
    recipients: ['team@axr.io'],
    cooldown: null,
    rateLimit: null,
  },
  {
    id: 'rule-4',
    name: 'Agent Health',
    description: 'Monitor agent connectivity and performance',
    type: 'health',
    severity: 'warning',
    channels: ['slack', 'webhook'],
    conditions: {
      metric: 'agent.offline',
      threshold: 1,
      timeWindow: '5m',
    },
    enabled: false,
    createdAt: '2024-01-12T13:45:00Z',
    updatedAt: '2024-01-19T16:30:00Z',
    createdBy: 'ops@axr.io',
    recipients: ['#ops'],
    cooldown: '5m',
    rateLimit: 20,
  },
  {
    id: 'rule-5',
    name: 'Security Alerts',
    description: 'Notifications for security-related events',
    type: 'security',
    severity: 'critical',
    channels: ['email', 'slack', 'webhook', 'sms'],
    conditions: {
      event: 'security.alert',
      severity: ['high', 'critical'],
    },
    enabled: true,
    createdAt: '2024-01-08T09:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
    createdBy: 'security@axr.io',
    recipients: ['security@axr.io', '#security', '+1234567890'],
    cooldown: '5m',
    rateLimit: 50,
  },
];

// Mock notification history
const mockHistory = [
  {
    id: 'notif-1',
    ruleId: 'rule-1',
    ruleName: 'Critical Alerts',
    severity: 'critical',
    channel: 'slack',
    subject: 'Workflow failed in production',
    message: 'Workflow "deploy-service" failed with error: Connection timeout',
    timestamp: '2024-01-20T15:45:00Z',
    status: 'delivered',
    read: false,
  },
  {
    id: 'notif-2',
    ruleId: 'rule-2',
    ruleName: 'Budget Warnings',
    severity: 'warning',
    channel: 'email',
    subject: 'Budget threshold exceeded',
    message: 'Monthly budget has reached 85% of limit',
    timestamp: '2024-01-20T14:30:00Z',
    status: 'delivered',
    read: true,
  },
  {
    id: 'notif-3',
    ruleId: 'rule-5',
    ruleName: 'Security Alerts',
    severity: 'critical',
    channel: 'sms',
    subject: 'Security alert: Unauthorized access attempt',
    message: 'Multiple failed login attempts detected from IP 203.0.113.45',
    timestamp: '2024-01-20T11:20:00Z',
    status: 'delivered',
    read: false,
  },
  {
    id: 'notif-4',
    ruleId: 'rule-4',
    ruleName: 'Agent Health',
    severity: 'warning',
    channel: 'slack',
    subject: 'Agent offline',
    message: 'Agent "agent-3" has been offline for 10 minutes',
    timestamp: '2024-01-20T09:45:00Z',
    status: 'failed',
    read: true,
    error: 'Slack webhook rate limit exceeded',
  },
  {
    id: 'notif-5',
    ruleId: 'rule-3',
    ruleName: 'Workflow Status',
    severity: 'info',
    channel: 'email',
    subject: 'Daily Workflow Summary',
    message: '24 workflows executed, 22 succeeded, 2 failed',
    timestamp: '2024-01-20T09:00:00Z',
    status: 'delivered',
    read: true,
  },
];

const channelConfigs = [
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    enabled: true,
    config: {
      smtp: 'smtp.gmail.com',
      port: 587,
      from: 'notifications@axr.io',
    },
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: Slack,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    enabled: true,
    config: {
      workspace: 'axr.slack.com',
      defaultChannel: '#general',
    },
  },
  {
    id: 'webhook',
    name: 'Webhook',
    icon: Webhook,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    enabled: true,
    config: {
      url: 'https://api.example.com/webhook',
      method: 'POST',
    },
  },
  {
    id: 'sms',
    name: 'SMS',
    icon: Smartphone,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    enabled: false,
    config: {
      provider: 'twilio',
      from: '+1234567890',
    },
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    icon: MessageSquare,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    enabled: false,
    config: {
      webhook: 'https://teams.microsoft.com/webhook',
    },
  },
];

const severityLevels = [
  { id: 'critical', name: 'Critical', color: 'text-rose-400', bgColor: 'bg-rose-500/10' },
  { id: 'warning', name: 'Warning', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  { id: 'info', name: 'Info', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  { id: 'success', name: 'Success', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
];

const notificationTypes = [
  { id: 'all', name: 'All Types', icon: Bell },
  { id: 'alert', name: 'Alerts', icon: AlertCircle },
  { id: 'budget', name: 'Budget', icon: Tag },
  { id: 'health', name: 'Health', icon: Activity },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'summary', name: 'Summary', icon: Calendar },
];

export default function NotificationsPage() {
  const [rules, setRules] = useState(mockRules);
  const [history, setHistory] = useState(mockHistory);
  const [channels, setChannels] = useState(channelConfigs);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [search, setSearch] = useState('');
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [quietHours, setQuietHours] = useState({ enabled: false, start: '22:00', end: '08:00' });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'alert',
    severity: 'warning',
    channels: [] as string[],
    conditions: {} as any,
    recipients: [] as string[],
    cooldown: '5m',
    rateLimit: 10,
    enabled: true,
  });

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(search.toLowerCase()) ||
                         rule.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || rule.type === selectedType;
    return matchesSearch && matchesType;
  });

  const unreadCount = history.filter(n => !n.read).length;

  const stats = {
    totalRules: rules.length,
    enabledRules: rules.filter(r => r.enabled).length,
    totalNotifications: history.length,
    failedNotifications: history.filter(n => n.status === 'failed').length,
    unread: unreadCount,
  };

  const handleEdit = (rule: any) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description,
      type: rule.type,
      severity: rule.severity,
      channels: rule.channels,
      conditions: rule.conditions,
      recipients: rule.recipients,
      cooldown: rule.cooldown || '5m',
      rateLimit: rule.rateLimit || 10,
      enabled: rule.enabled,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error('Please enter a rule name');
      return;
    }
    if (!formData.description) {
      toast.error('Please enter a rule description');
      return;
    }
    if (formData.channels.length === 0) {
      toast.error('Select at least one notification channel');
      return;
    }

    if (editingRule) {
      setRules(prev =>
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
      toast.success('Notification rule updated');
    } else {
      const newRule = {
        id: `rule-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin@axr.io',
      };
      setRules([newRule, ...rules]);
      toast.success('Notification rule created');
    }

    setShowForm(false);
    setEditingRule(null);
    setFormData({
      name: '',
      description: '',
      type: 'alert',
      severity: 'warning',
      channels: [],
      conditions: {},
      recipients: [],
      cooldown: '5m',
      rateLimit: 10,
      enabled: true,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this notification rule?')) {
      setRules(rules.filter(r => r.id !== id));
      toast.success('Notification rule deleted');
    }
  };

  const handleToggleRule = (id: string) => {
    setRules(prev =>
      prev.map(r =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      )
    );
    toast.success('Rule toggled');
  };

  const handleTestRule = (rule: any) => {
    toast.success(`Test notification sent via ${rule.channels.join(', ')}`);
  };

  const handleMarkAsRead = (id: string) => {
    setHistory(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    setHistory(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    toast.success('All notifications marked as read');
  };

  const handleRetry = (id: string) => {
    setHistory(prev =>
      prev.map(n => n.id === id ? { ...n, status: 'delivered', error: undefined } : n)
    );
    toast.success('Notification retried');
  };

  const handleChannelToggle = (channelId: string) => {
    setChannels(prev =>
      prev.map(c =>
        c.id === channelId ? { ...c, enabled: !c.enabled } : c
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    const level = severityLevels.find(l => l.id === severity);
    return level?.color || 'text-zinc-400';
  };

  const getSeverityBg = (severity: string) => {
    const level = severityLevels.find(l => l.id === severity);
    return level?.bgColor || 'bg-zinc-500/10';
  };

  const getChannelIcon = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    return channel?.icon || Bell;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
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
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-primary">Notifications</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Configure notification rules and channels
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setGlobalEnabled(!globalEnabled)}
            className={cn(
              'border',
              globalEnabled ? 'border-emerald-500/30 text-emerald-400' : 'border-zinc-500/30 text-zinc-400'
            )}
          >
            {globalEnabled ? (
              <>
                <BellRing className="w-4 h-4 mr-2" />
                Notifications On
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4 mr-2" />
                Notifications Off
              </>
            )}
          </Button>

          <Button
            onClick={() => {
              setEditingRule(null);
              setFormData({
                name: '',
                description: '',
                type: 'alert',
                severity: 'warning',
                channels: [],
                conditions: {},
                recipients: [],
                cooldown: '5m',
                rateLimit: 10,
                enabled: true,
              });
              setShowForm(true);
            }}
            className="bg-gradient-to-r from-indigo-500 to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
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
              <Mail className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-xs text-zinc-400">Total Sent</p>
                <p className="text-lg font-bold text-blue-400">{stats.totalNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <div>
                <p className="text-xs text-zinc-400">Failed</p>
                <p className="text-lg font-bold text-rose-400">{stats.failedNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs text-zinc-400">Unread</p>
                <p className="text-lg font-bold text-amber-400">{stats.unread}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-indigo-500/20">
          <TabsTrigger value="rules">Notification Rules</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="history">
            History
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          {/* Type Filter and Search */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {notificationTypes.map((type) => {
                const Icon = type.icon;
                const isActive = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm transition-all',
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                        : 'bg-slate-900/50 text-zinc-400 hover:text-indigo-400 border border-indigo-500/20'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {type.name}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
              <Input
                type="text"
                placeholder="Search rules by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-900/50 border-indigo-500/20"
              />
            </div>
          </div>

          {/* Rules List */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filteredRules.map((rule) => (
              <motion.div key={rule.id} variants={item}>
                <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn('p-2 rounded-lg', getSeverityBg(rule.severity))}>
                        {rule.severity === 'critical' && <AlertCircle className={cn('w-5 h-5', getSeverityColor(rule.severity))} />}
                        {rule.severity === 'warning' && <AlertTriangle className={cn('w-5 h-5', getSeverityColor(rule.severity))} />}
                        {rule.severity === 'info' && <Info className={cn('w-5 h-5', getSeverityColor(rule.severity))} />}
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

                        {/* Channels */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {rule.channels.map((channelId) => {
                            const ChannelIcon = getChannelIcon(channelId);
                            const channel = channels.find(c => c.id === channelId);
                            return (
                              <Badge key={channelId} variant="outline" className="border-indigo-500/30">
                                <ChannelIcon className="w-3 h-3 mr-1" />
                                {channel?.name || channelId}
                              </Badge>
                            );
                          })}
                        </div>

                        {/* Conditions Preview */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(rule.conditions).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="border-indigo-500/30">
                              {key}: {JSON.stringify(value)}
                            </Badge>
                          ))}
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Cooldown: {rule.cooldown || 'none'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bell className="w-3 h-3" />
                            Rate: {rule.rateLimit || 'unlimited'}/h
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {rule.recipients.length} recipients
                          </span>
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
                          onClick={() => handleTestRule(rule)}
                          className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
                          title="Test rule"
                        >
                          <TestTube className="w-4 h-4 text-indigo-400" />
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

        {/* Channels Tab */}
        <TabsContent value="channels">
          <div className="grid lg:grid-cols-2 gap-4">
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <Card key={channel.id} className="bg-slate-900/50 border-indigo-500/20">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-lg', channel.bgColor)}>
                          <Icon className={cn('w-5 h-5', channel.color)} />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{channel.name}</h3>
                          <p className="text-xs text-zinc-400">
                            {channel.enabled ? 'Connected' : 'Not configured'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={channel.enabled}
                        onCheckedChange={() => handleChannelToggle(channel.id)}
                      />
                    </div>

                    <div className="space-y-2">
                      {Object.entries(channel.config).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-zinc-400">{key}:</span>
                          <span className="text-white font-mono">{value}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4 border-indigo-500/30 text-indigo-400"
                    >
                      Configure
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Notification History</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="border-indigo-500/30 text-indigo-400"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark all read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-indigo-500/30 text-indigo-400"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((notification) => {
                  const ChannelIcon = getChannelIcon(notification.channel);
                  
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 rounded-lg border transition-colors',
                        notification.read ? 'bg-slate-800/20 border-indigo-500/10' : 'bg-slate-800/40 border-indigo-500/30'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2 rounded-lg', getSeverityBg(notification.severity))}>
                          {notification.severity === 'critical' && <AlertCircle className={cn('w-4 h-4', getSeverityColor(notification.severity))} />}
                          {notification.severity === 'warning' && <AlertTriangle className={cn('w-4 h-4', getSeverityColor(notification.severity))} />}
                          {notification.severity === 'info' && <Info className={cn('w-4 h-4', getSeverityColor(notification.severity))} />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-sm font-medium text-white">{notification.subject}</h4>
                            <Badge className={cn(getSeverityBg(notification.severity), getSeverityColor(notification.severity))}>
                              {notification.severity}
                            </Badge>
                            <Badge variant={notification.status === 'delivered' ? 'success' : 'destructive'}>
                              {notification.status}
                            </Badge>
                          </div>

                          <p className="text-sm text-zinc-300 mb-2">{notification.message}</p>

                          <div className="flex items-center gap-3 text-xs text-zinc-400">
                            <span className="flex items-center gap-1">
                              <ChannelIcon className="w-3 h-3" />
                              {notification.channel}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {notification.error && (
                              <span className="text-rose-400">Error: {notification.error}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-1.5 rounded-lg hover:bg-indigo-500/10"
                              title="Mark as read"
                            >
                              <Eye className="w-4 h-4 text-indigo-400" />
                            </button>
                          )}
                          {notification.status === 'failed' && (
                            <button
                              onClick={() => handleRetry(notification.id)}
                              className="p-1.5 rounded-lg hover:bg-indigo-500/10"
                              title="Retry"
                            >
                              <RefreshCw className="w-4 h-4 text-emerald-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Global Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Enable Notifications</p>
                    <p className="text-xs text-zinc-400">Master switch for all notifications</p>
                  </div>
                  <Switch
                    checked={globalEnabled}
                    onCheckedChange={setGlobalEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Quiet Hours</p>
                    <p className="text-xs text-zinc-400">Mute notifications during specified hours</p>
                  </div>
                  <Switch
                    checked={quietHours.enabled}
                    onCheckedChange={(checked) => setQuietHours({ ...quietHours, enabled: checked })}
                  />
                </div>

                {quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">Start Time</label>
                      <Input
                        type="time"
                        value={quietHours.start}
                        onChange={(e) => setQuietHours({ ...quietHours, start: e.target.value })}
                        className="bg-slate-900 border-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">End Time</label>
                      <Input
                        type="time"
                        value={quietHours.end}
                        onChange={(e) => setQuietHours({ ...quietHours, end: e.target.value })}
                        className="bg-slate-900 border-indigo-500/20"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Default Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Default Cooldown Period</label>
                  <select className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm">
                    <option>5 minutes</option>
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>1 hour</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Default Rate Limit</label>
                  <select className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm">
                    <option>10 per hour</option>
                    <option>50 per hour</option>
                    <option>100 per hour</option>
                    <option>Unlimited</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Retry Attempts</label>
                  <select className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm">
                    <option>0 (no retry)</option>
                    <option>1 retry</option>
                    <option>3 retries</option>
                    <option>5 retries</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Rule Modal */}
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
                    {editingRule ? 'Edit Notification Rule' : 'Create Notification Rule'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Rule Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Critical Alerts"
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
                      placeholder="Describe when this rule triggers..."
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
                        {notificationTypes.slice(1).map((type) => (
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
                    <label className="text-sm text-zinc-400 mb-2 block">Notification Channels</label>
                    <div className="grid grid-cols-2 gap-2">
                      {channels.filter(c => c.enabled).map((channel) => (
                        <label key={channel.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.channels.includes(channel.id)}
                            onChange={(e) => {
                              const channels = e.target.checked
                                ? [...formData.channels, channel.id]
                                : formData.channels.filter(c => c !== channel.id);
                              setFormData({ ...formData, channels });
                            }}
                            className="rounded border-indigo-500/30 bg-slate-900"
                          />
                          <channel.icon className={cn('w-4 h-4', channel.color)} />
                          <span className="text-sm text-white">{channel.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Conditions (JSON)</label>
                    <textarea
                      value={JSON.stringify(formData.conditions, null, 2)}
                      onChange={(e) => {
                        try {
                          setFormData({ ...formData, conditions: JSON.parse(e.target.value) });
                        } catch {
                          // Ignore invalid JSON
                        }
                      }}
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Recipients (comma-separated)</label>
                    <Input
                      value={formData.recipients.join(', ')}
                      onChange={(e) => {
                        const recipients = e.target.value.split(',').map(r => r.trim()).filter(r => r);
                        setFormData({ ...formData, recipients });
                      }}
                      placeholder="email@example.com, #channel, +1234567890"
                      className="bg-slate-900 border-indigo-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-zinc-400 mb-1 block">Cooldown Period</label>
                      <select
                        value={formData.cooldown}
                        onChange={(e) => setFormData({ ...formData, cooldown: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                      >
                        <option value="none">No cooldown</option>
                        <option value="5m">5 minutes</option>
                        <option value="15m">15 minutes</option>
                        <option value="1h">1 hour</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-zinc-400 mb-1 block">Rate Limit (per hour)</label>
                      <Input
                        type="number"
                        value={formData.rateLimit}
                        onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) })}
                        className="bg-slate-900 border-indigo-500/20"
                      />
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