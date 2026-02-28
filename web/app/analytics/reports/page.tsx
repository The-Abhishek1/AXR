// app/analytics/reports/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Clock,
  Calendar,
  Mail,
  FileText,
  FileJson,
  FileSpreadsheet,
  Image,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Filter,
  Search,
  MoreVertical,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  Award,
  Users,
  Database,
  Globe,
  Lock,
  Unlock
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
  PieChart as RePieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import toast from 'react-hot-toast';

// Mock reports data
const mockReports = [
  {
    id: 'report-1',
    name: 'Monthly Performance Report',
    description: 'Comprehensive performance metrics for all workflows',
    type: 'performance',
    format: 'dashboard',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T15:45:00Z',
    createdBy: 'admin@axr.io',
    schedule: 'monthly',
    nextRun: '2024-02-01T00:00:00Z',
    lastRun: '2024-01-01T00:00:00Z',
    recipients: ['team@axr.io', 'management@axr.io'],
    status: 'active',
    favorite: true,
    tags: ['performance', 'monthly', 'executive'],
    metrics: ['executions', 'success_rate', 'duration', 'cost'],
    filters: {
      dateRange: 'last30days',
      workflows: ['all'],
    },
    visualization: 'area',
  },
  {
    id: 'report-2',
    name: 'Cost Analysis by Team',
    description: 'Breakdown of costs by department and team',
    type: 'financial',
    format: 'chart',
    createdAt: '2024-01-10T08:20:00Z',
    updatedAt: '2024-01-18T09:30:00Z',
    createdBy: 'finance@axr.io',
    schedule: 'weekly',
    nextRun: '2024-01-22T09:00:00Z',
    lastRun: '2024-01-15T09:00:00Z',
    recipients: ['finance@axr.io'],
    status: 'active',
    favorite: false,
    tags: ['cost', 'finance', 'teams'],
    metrics: ['cost', 'budget', 'forecast'],
    filters: {
      dateRange: 'last7days',
      teams: ['engineering', 'product', 'sales'],
    },
    visualization: 'bar',
  },
  {
    id: 'report-3',
    name: 'Security Compliance Report',
    description: 'Security metrics and compliance status',
    type: 'security',
    format: 'table',
    createdAt: '2024-01-05T14:15:00Z',
    updatedAt: '2024-01-17T11:20:00Z',
    createdBy: 'security@axr.io',
    schedule: 'daily',
    nextRun: '2024-01-21T00:00:00Z',
    lastRun: '2024-01-20T00:00:00Z',
    recipients: ['security@axr.io', 'compliance@axr.io'],
    status: 'active',
    favorite: true,
    tags: ['security', 'compliance', 'audit'],
    metrics: ['vulnerabilities', 'scan_coverage', 'compliance_score'],
    filters: {
      dateRange: 'last24h',
      severity: ['critical', 'high'],
    },
    visualization: 'table',
  },
  {
    id: 'report-4',
    name: 'Agent Performance Dashboard',
    description: 'AI agent performance and efficiency metrics',
    type: 'agent',
    format: 'dashboard',
    createdAt: '2024-01-12T13:45:00Z',
    updatedAt: '2024-01-19T16:30:00Z',
    createdBy: 'admin@axr.io',
    schedule: null,
    nextRun: null,
    lastRun: '2024-01-20T10:00:00Z',
    recipients: [],
    status: 'draft',
    favorite: false,
    tags: ['agents', 'performance', 'ai'],
    metrics: ['tasks', 'success_rate', 'response_time', 'cost_per_task'],
    filters: {
      dateRange: 'last7days',
      agents: ['all'],
    },
    visualization: 'mixed',
  },
  {
    id: 'report-5',
    name: 'Workflow Error Analysis',
    description: 'Detailed analysis of workflow failures',
    type: 'error',
    format: 'chart',
    createdAt: '2024-01-08T09:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
    createdBy: 'engineering@axr.io',
    schedule: 'weekly',
    nextRun: '2024-01-23T12:00:00Z',
    lastRun: '2024-01-16T12:00:00Z',
    recipients: ['engineering@axr.io'],
    status: 'active',
    favorite: false,
    tags: ['errors', 'debugging', 'workflows'],
    metrics: ['error_count', 'error_types', 'recovery_time'],
    filters: {
      dateRange: 'last7days',
      workflows: ['production'],
    },
    visualization: 'pie',
  },
];

const reportTypes = [
  { id: 'all', name: 'All Reports', icon: BarChart3 },
  { id: 'performance', name: 'Performance', icon: TrendingUp },
  { id: 'financial', name: 'Financial', icon: Database },
  { id: 'security', name: 'Security', icon: Lock },
  { id: 'agent', name: 'Agent', icon: Users },
  { id: 'error', name: 'Error', icon: AlertCircle },
];

const visualizations = [
  { id: 'area', name: 'Area Chart', icon: LineChart },
  { id: 'bar', name: 'Bar Chart', icon: BarChart3 },
  { id: 'line', name: 'Line Chart', icon: TrendingUp },
  { id: 'pie', name: 'Pie Chart', icon: PieChart },
  { id: 'table', name: 'Table', icon: FileText },
  { id: 'mixed', name: 'Mixed', icon: BarChart3 },
];

const schedules = [
  { id: 'none', name: 'No Schedule' },
  { id: 'hourly', name: 'Hourly' },
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'quarterly', name: 'Quarterly' },
];

// Mock chart data
const chartData = [
  { name: 'Jan', value: 400, cost: 240, success: 95 },
  { name: 'Feb', value: 300, cost: 139, success: 92 },
  { name: 'Mar', value: 200, cost: 980, success: 88 },
  { name: 'Apr', value: 278, cost: 390, success: 94 },
  { name: 'May', value: 189, cost: 480, success: 91 },
  { name: 'Jun', value: 239, cost: 380, success: 96 },
];

const pieData = [
  { name: 'Engineering', value: 400, color: '#6366f1' },
  { name: 'Product', value: 300, color: '#8b5cf6' },
  { name: 'Sales', value: 300, color: '#d946ef' },
  { name: 'Marketing', value: 200, color: '#ec4899' },
];

export default function ReportsPage() {
  const [reports, setReports] = useState(mockReports);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'performance',
    format: 'dashboard',
    metrics: [] as string[],
    filters: {
      dateRange: 'last7days',
      workflows: ['all'],
    },
    visualization: 'area',
    schedule: 'none',
    recipients: [] as string[],
    tags: [] as string[],
    favorite: false,
  });

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(search.toLowerCase()) ||
                         report.description.toLowerCase().includes(search.toLowerCase()) ||
                         report.tags.some(tag => tag.includes(search.toLowerCase()));
    const matchesType = selectedType === 'all' || report.type === selectedType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: reports.length,
    active: reports.filter(r => r.status === 'active').length,
    draft: reports.filter(r => r.status === 'draft').length,
    scheduled: reports.filter(r => r.schedule).length,
    favorites: reports.filter(r => r.favorite).length,
  };

  const handleEdit = (report: any) => {
    setEditingReport(report);
    setFormData({
      name: report.name,
      description: report.description,
      type: report.type,
      format: report.format,
      metrics: report.metrics,
      filters: report.filters,
      visualization: report.visualization,
      schedule: report.schedule || 'none',
      recipients: report.recipients,
      tags: report.tags,
      favorite: report.favorite,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error('Please enter a report name');
      return;
    }
    if (!formData.description) {
      toast.error('Please enter a report description');
      return;
    }
    if (formData.metrics.length === 0) {
      toast.error('Select at least one metric');
      return;
    }

    if (editingReport) {
      setReports(prev =>
        prev.map(r =>
          r.id === editingReport.id
            ? {
                ...r,
                ...formData,
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );
      toast.success('Report updated');
    } else {
      const newReport = {
        id: `report-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin@axr.io',
        lastRun: null,
        nextRun: formData.schedule !== 'none' ? new Date(Date.now() + 24*60*60*1000).toISOString() : null,
        status: 'active',
      };
      setReports([newReport, ...reports]);
      toast.success('Report created');
    }

    setShowForm(false);
    setEditingReport(null);
    setFormData({
      name: '',
      description: '',
      type: 'performance',
      format: 'dashboard',
      metrics: [],
      filters: { dateRange: 'last7days', workflows: ['all'] },
      visualization: 'area',
      schedule: 'none',
      recipients: [],
      tags: [],
      favorite: false,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      setReports(reports.filter(r => r.id !== id));
      toast.success('Report deleted');
    }
  };

  const handleDuplicate = (report: any) => {
    const newReport = {
      ...report,
      id: `report-${Date.now()}`,
      name: `${report.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      favorite: false,
    };
    setReports([newReport, ...reports]);
    toast.success('Report duplicated');
  };

  const handleToggleFavorite = (id: string) => {
    setReports(prev =>
      prev.map(r =>
        r.id === id ? { ...r, favorite: !r.favorite } : r
      )
    );
  };

  const handleRunNow = (id: string) => {
    setReports(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, lastRun: new Date().toISOString() }
          : r
      )
    );
    toast.success('Report generation started');
  };

  const handleExport = (report: any, format: string) => {
    toast.success(`Exporting report as ${format.toUpperCase()}`);
  };

  const getTypeIcon = (type: string) => {
    const reportType = reportTypes.find(t => t.id === type);
    return reportType?.icon || BarChart3;
  };

  const getVisualizationIcon = (viz: string) => {
    const vis = visualizations.find(v => v.id === viz);
    return vis?.icon || BarChart3;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text-primary">Custom Reports</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Create, schedule, and export custom analytics reports
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingReport(null);
            setFormData({
              name: '',
              description: '',
              type: 'performance',
              format: 'dashboard',
              metrics: [],
              filters: { dateRange: 'last7days', workflows: ['all'] },
              visualization: 'area',
              schedule: 'none',
              recipients: [],
              tags: [],
              favorite: false,
            });
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-indigo-500 to-purple-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Report
        </Button>
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
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs text-zinc-400">Total Reports</p>
                <p className="text-lg font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs text-zinc-400">Active</p>
                <p className="text-lg font-bold text-emerald-400">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs text-zinc-400">Draft</p>
                <p className="text-lg font-bold text-amber-400">{stats.draft}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs text-zinc-400">Scheduled</p>
                <p className="text-lg font-bold text-purple-400">{stats.scheduled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <div>
                <p className="text-xs text-zinc-400">Favorites</p>
                <p className="text-lg font-bold text-yellow-400">{stats.favorites}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Type Filter and Search */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((type) => {
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

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
            <Input
              type="text"
              placeholder="Search reports by name, description, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-900/50 border-indigo-500/20"
            />
          </div>

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
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Reports Grid/List */}
      {viewMode === 'grid' ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {filteredReports.map((report) => {
            const TypeIcon = getTypeIcon(report.type);
            const VizIcon = getVisualizationIcon(report.visualization);

            return (
              <motion.div key={report.id} variants={item}>
                <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-colors h-full">
                  <CardContent className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'p-2 rounded-lg',
                          report.status === 'active' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                        )}>
                          <TypeIcon className={cn(
                            'w-5 h-5',
                            report.status === 'active' ? 'text-emerald-400' : 'text-amber-400'
                          )} />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{report.name}</h3>
                          <p className="text-xs text-zinc-400">Created {formatDate(report.createdAt)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleFavorite(report.id)}
                        className="p-1 hover:bg-indigo-500/10 rounded"
                      >
                        <Star className={cn(
                          'w-4 h-4',
                          report.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-400'
                        )} />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-zinc-300 mb-3 line-clamp-2">
                      {report.description}
                    </p>

                    {/* Metrics Preview */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {report.metrics.slice(0, 3).map((metric) => (
                        <Badge key={metric} variant="outline" className="border-indigo-500/30">
                          {metric}
                        </Badge>
                      ))}
                      {report.metrics.length > 3 && (
                        <Badge variant="outline" className="border-indigo-500/30">
                          +{report.metrics.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {report.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Schedule Info */}
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                      {report.schedule ? (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>{report.schedule}</span>
                          <span>•</span>
                          <span>Next: {report.nextRun ? formatDate(report.nextRun) : 'N/A'}</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-3 h-3" />
                          <span>On-demand</span>
                        </>
                      )}
                    </div>

                    {/* Visualization Preview */}
                    <div className="h-24 mb-3">
                      {report.visualization === 'area' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData.slice(0, 4)}>
                            <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                      {report.visualization === 'bar' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData.slice(0, 4)}>
                            <Bar dataKey="value" fill="#6366f1" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                      {report.visualization === 'line' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <ReLineChart data={chartData.slice(0, 4)}>
                            <Line type="monotone" dataKey="value" stroke="#6366f1" />
                          </ReLineChart>
                        </ResponsiveContainer>
                      )}
                      {report.visualization === 'pie' && (
                        <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                            <Pie
                              data={pieData.slice(0, 3)}
                              dataKey="value"
                              cx="50%"
                              cy="50%"
                              innerRadius={20}
                              outerRadius={30}
                            >
                              {pieData.slice(0, 3).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </RePieChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-indigo-500/20">
                      <div className="flex items-center gap-2">
                        <Badge variant={report.status === 'active' ? 'success' : 'secondary'}>
                          {report.status}
                        </Badge>
                        <Badge variant="outline" className="border-indigo-500/30">
                          <VizIcon className="w-3 h-3 mr-1" />
                          {report.visualization}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleRunNow(report.id)}
                          className="p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors"
                          title="Run now"
                        >
                          <Play className="w-4 h-4 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4 text-indigo-400" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors">
                              <MoreVertical className="w-4 h-4 text-zinc-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-900 border-indigo-500/20">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(report)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(report)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleExport(report, 'pdf')}>
                              <FileText className="w-4 h-4 mr-2" />
                              Export PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(report, 'excel')}>
                              <FileSpreadsheet className="w-4 h-4 mr-2" />
                              Export Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport(report, 'json')}>
                              <FileJson className="w-4 h-4 mr-2" />
                              Export JSON
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-rose-400"
                              onClick={() => handleDelete(report.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
          className="space-y-3"
        >
          {filteredReports.map((report) => {
            const TypeIcon = getTypeIcon(report.type);

            return (
              <motion.div key={report.id} variants={item}>
                <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'p-2 rounded-lg',
                        report.status === 'active' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                      )}>
                        <TypeIcon className={cn(
                          'w-5 h-5',
                          report.status === 'active' ? 'text-emerald-400' : 'text-amber-400'
                        )} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium text-white">{report.name}</h3>
                          <Badge variant={report.status === 'active' ? 'success' : 'secondary'}>
                            {report.status}
                          </Badge>
                          {report.favorite && (
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>

                        <p className="text-sm text-zinc-300 mb-2">{report.description}</p>

                        <div className="flex items-center gap-4 text-xs text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {report.schedule || 'On-demand'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Last: {report.lastRun ? formatDate(report.lastRun) : 'Never'}
                          </span>
                          <div className="flex gap-1">
                            {report.tags.map((tag) => (
                              <span key={tag} className="text-indigo-400">#{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleFavorite(report.id)}
                          className="p-2 rounded-lg hover:bg-indigo-500/10"
                        >
                          <Star className={cn(
                            'w-4 h-4',
                            report.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-400'
                          )} />
                        </button>
                        <button
                          onClick={() => handleRunNow(report.id)}
                          className="p-2 rounded-lg hover:bg-indigo-500/10"
                        >
                          <Play className="w-4 h-4 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="p-2 rounded-lg hover:bg-indigo-500/10"
                        >
                          <Eye className="w-4 h-4 text-indigo-400" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 rounded-lg hover:bg-indigo-500/10">
                              <MoreVertical className="w-4 h-4 text-zinc-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-900 border-indigo-500/20">
                            <DropdownMenuItem onClick={() => handleEdit(report)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(report)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-rose-400"
                              onClick={() => handleDelete(report.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Report Preview Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-slate-900 border-indigo-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{selectedReport.name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedReport(null)}
                    >
                      <XCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-400 mb-4">{selectedReport.description}</p>

                  <div className="h-80 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      {selectedReport.visualization === 'area' && (
                        <AreaChart data={chartData}>
                          <XAxis dataKey="name" stroke="#71717a" />
                          <YAxis stroke="#71717a" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              border: '1px solid #6366f1',
                            }}
                          />
                          <Legend />
                          <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                          <Area type="monotone" dataKey="cost" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                        </AreaChart>
                      )}
                      {selectedReport.visualization === 'bar' && (
                        <BarChart data={chartData}>
                          <XAxis dataKey="name" stroke="#71717a" />
                          <YAxis stroke="#71717a" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              border: '1px solid #6366f1',
                            }}
                          />
                          <Legend />
                          <Bar dataKey="value" fill="#6366f1" />
                          <Bar dataKey="cost" fill="#8b5cf6" />
                        </BarChart>
                      )}
                      {selectedReport.visualization === 'line' && (
                        <ReLineChart data={chartData}>
                          <XAxis dataKey="name" stroke="#71717a" />
                          <YAxis stroke="#71717a" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              border: '1px solid #6366f1',
                            }}
                          />
                          <Legend />
                          <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} />
                          <Line type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={2} />
                        </ReLineChart>
                      )}
                      {selectedReport.visualization === 'pie' && (
                        <RePieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              border: '1px solid #6366f1',
                            }}
                          />
                        </RePieChart>
                      )}
                    </ResponsiveContainer>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSelectedReport(null)}>
                      Close
                    </Button>
                    <Button
                      onClick={() => handleExport(selectedReport, 'pdf')}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit Report Modal */}
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
                    {editingReport ? 'Edit Report' : 'Create Report'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Report Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Monthly Performance Report"
                      className="bg-slate-900 border-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                      placeholder="Describe what this report shows..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-zinc-400 mb-1 block">Report Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                      >
                        {reportTypes.slice(1).map((type) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm text-zinc-400 mb-1 block">Visualization</label>
                      <select
                        value={formData.visualization}
                        onChange={(e) => setFormData({ ...formData, visualization: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                      >
                        {visualizations.map((viz) => (
                          <option key={viz.id} value={viz.id}>{viz.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Metrics</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['executions', 'success_rate', 'duration', 'cost', 'errors', 'agents'].map((metric) => (
                        <label key={metric} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.metrics.includes(metric)}
                            onChange={(e) => {
                              const metrics = e.target.checked
                                ? [...formData.metrics, metric]
                                : formData.metrics.filter(m => m !== metric);
                              setFormData({ ...formData, metrics });
                            }}
                            className="rounded border-indigo-500/30 bg-slate-900"
                          />
                          <span className="text-sm text-white capitalize">{metric.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Schedule</label>
                    <select
                      value={formData.schedule}
                      onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                    >
                      {schedules.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Recipients (comma-separated)</label>
                    <Input
                      value={formData.recipients.join(', ')}
                      onChange={(e) => {
                        const recipients = e.target.value.split(',').map(r => r.trim()).filter(r => r);
                        setFormData({ ...formData, recipients });
                      }}
                      placeholder="email1@example.com, email2@example.com"
                      className="bg-slate-900 border-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Tags (comma-separated)</label>
                    <Input
                      value={formData.tags.join(', ')}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                        setFormData({ ...formData, tags });
                      }}
                      placeholder="performance, monthly, executive"
                      className="bg-slate-900 border-indigo-500/20"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white">Add to Favorites</label>
                    <Switch
                      checked={formData.favorite}
                      onCheckedChange={(checked) => setFormData({ ...formData, favorite: checked })}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                    >
                      {editingReport ? 'Update' : 'Create'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingReport(null);
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