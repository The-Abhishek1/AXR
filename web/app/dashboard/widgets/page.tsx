// app/dashboard/widgets/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import Link from 'next/link';
import {
  Layout,
  LayoutDashboard,
  Plus,
  Edit,
  Trash2,
  Copy,
  Move,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Upload,
  Save,
  X,
  Check,
  Grid,
  Columns,
  Maximize2,
  Minimize2,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Clock,
  Calendar,
  Bell,
  AlertCircle,
  TrendingUp,
  Users,
  Server,
  Cpu,
  HardDrive,
  Network,
  Globe,
  Shield,
  Zap,
  DollarSign,
  Star,
  Award,
  Sparkles
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
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import toast from 'react-hot-toast';

// Mock widget templates
const widgetTemplates = [
  {
    id: 'stats',
    name: 'Statistics Card',
    description: 'Display key metrics with trends',
    icon: Activity,
    category: 'metrics',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    preview: 'Shows a single metric with trend indicator',
  },
  {
    id: 'chart-line',
    name: 'Line Chart',
    description: 'Visualize trends over time',
    icon: LineChart,
    category: 'charts',
    sizes: ['medium', 'large'],
    defaultSize: 'medium',
    preview: 'Line chart for time series data',
  },
  {
    id: 'chart-bar',
    name: 'Bar Chart',
    description: 'Compare values across categories',
    icon: BarChart3,
    category: 'charts',
    sizes: ['medium', 'large'],
    defaultSize: 'medium',
    preview: 'Bar chart for categorical data',
  },
  {
    id: 'chart-pie',
    name: 'Pie Chart',
    description: 'Show composition of data',
    icon: PieChart,
    category: 'charts',
    sizes: ['medium', 'large'],
    defaultSize: 'medium',
    preview: 'Pie chart for proportional data',
  },
  {
    id: 'recent-activity',
    name: 'Recent Activity',
    description: 'List of recent events and actions',
    icon: Activity,
    category: 'lists',
    sizes: ['medium', 'large'],
    defaultSize: 'medium',
    preview: 'Scrollable list of recent activities',
  },
  {
    id: 'alerts',
    name: 'Alerts',
    description: 'Active alerts and notifications',
    icon: Bell,
    category: 'monitoring',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    preview: 'List of current alerts',
  },
  {
    id: 'resource-usage',
    name: 'Resource Usage',
    description: 'CPU, memory, and network usage',
    icon: Cpu,
    category: 'monitoring',
    sizes: ['medium', 'large'],
    defaultSize: 'medium',
    preview: 'Resource utilization gauges',
  },
  {
    id: 'workflow-status',
    name: 'Workflow Status',
    description: 'Current workflow execution status',
    icon: Zap,
    category: 'workflows',
    sizes: ['medium', 'large'],
    defaultSize: 'medium',
    preview: 'Running workflows with progress',
  },
  {
    id: 'agent-health',
    name: 'Agent Health',
    description: 'Agent connectivity and status',
    icon: Server,
    category: 'agents',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    preview: 'Agent online/offline status',
  },
  {
    id: 'cost-summary',
    name: 'Cost Summary',
    description: 'Budget usage and cost trends',
    icon: DollarSign,
    category: 'finance',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    preview: 'Budget consumption overview',
  },
  {
    id: 'top-tools',
    name: 'Top Tools',
    description: 'Most used tools and services',
    icon: Zap,
    category: 'analytics',
    sizes: ['medium', 'large'],
    defaultSize: 'medium',
    preview: 'List of frequently used tools',
  },
  {
    id: 'success-rate',
    name: 'Success Rate',
    description: 'Workflow and step success rates',
    icon: TrendingUp,
    category: 'analytics',
    sizes: ['small', 'medium'],
    defaultSize: 'small',
    preview: 'Success percentage with trend',
  },
];

// Mock dashboard layouts
const mockLayouts = [
  {
    id: 'default',
    name: 'Default Dashboard',
    description: 'Standard dashboard layout',
    isDefault: true,
    widgets: [
      { id: 'widget-1', templateId: 'stats', title: 'Active Processes', size: 'small', position: 0, config: { metric: 'processes' } },
      { id: 'widget-2', templateId: 'stats', title: 'Total Agents', size: 'small', position: 1, config: { metric: 'agents' } },
      { id: 'widget-3', templateId: 'stats', title: 'Tasks Completed', size: 'small', position: 2, config: { metric: 'tasks' } },
      { id: 'widget-4', templateId: 'stats', title: 'Success Rate', size: 'small', position: 3, config: { metric: 'success' } },
      { id: 'widget-5', templateId: 'chart-line', title: 'System Activity', size: 'large', position: 4, config: { metric: 'cpu' } },
      { id: 'widget-6', templateId: 'recent-activity', title: 'Recent Events', size: 'medium', position: 5, config: { limit: 10 } },
      { id: 'widget-7', templateId: 'resource-usage', title: 'Resource Usage', size: 'medium', position: 6, config: { showDetails: true } },
    ],
  },
  {
    id: 'monitoring',
    name: 'Monitoring Focus',
    description: 'Dashboard focused on system monitoring',
    isDefault: false,
    widgets: [
      { id: 'widget-8', templateId: 'alerts', title: 'Active Alerts', size: 'small', position: 0, config: {} },
      { id: 'widget-9', templateId: 'resource-usage', title: 'System Resources', size: 'large', position: 1, config: {} },
      { id: 'widget-10', templateId: 'agent-health', title: 'Agent Status', size: 'medium', position: 2, config: {} },
      { id: 'widget-11', templateId: 'chart-line', title: 'Performance Trends', size: 'large', position: 3, config: {} },
    ],
  },
  {
    id: 'analytics',
    name: 'Analytics Hub',
    description: 'Data-driven insights dashboard',
    isDefault: false,
    widgets: [
      { id: 'widget-12', templateId: 'cost-summary', title: 'Cost Overview', size: 'small', position: 0, config: {} },
      { id: 'widget-13', templateId: 'top-tools', title: 'Top Tools', size: 'medium', position: 1, config: {} },
      { id: 'widget-14', templateId: 'chart-bar', title: 'Usage by Tool', size: 'large', position: 2, config: {} },
      { id: 'widget-15', templateId: 'success-rate', title: 'Success Metrics', size: 'medium', position: 3, config: {} },
    ],
  },
];

// Mock data for widgets
const statsData = {
  processes: { value: 24, change: '+12%', trend: 'up' },
  agents: { value: 12, change: '+8%', trend: 'up' },
  tasks: { value: 1423, change: '+23%', trend: 'up' },
  success: { value: '98.5%', change: '+2%', trend: 'up' },
};

const chartData = [
  { name: 'Mon', value: 12 },
  { name: 'Tue', value: 18 },
  { name: 'Wed', value: 24 },
  { name: 'Thu', value: 32 },
  { name: 'Fri', value: 28 },
  { name: 'Sat', value: 20 },
  { name: 'Sun', value: 16 },
];

const pieData = [
  { name: 'Completed', value: 65, color: '#10b981' },
  { name: 'Running', value: 15, color: '#6366f1' },
  { name: 'Failed', value: 10, color: '#ef4444' },
  { name: 'Pending', value: 10, color: '#f59e0b' },
];

const recentActivities = [
  { id: 1, action: 'Workflow completed', resource: 'deploy-service', time: '2 min ago', status: 'success' },
  { id: 2, action: 'Agent connected', resource: 'agent-7', time: '5 min ago', status: 'info' },
  { id: 3, action: 'Budget warning', resource: 'monthly budget', time: '10 min ago', status: 'warning' },
  { id: 4, action: 'Step failed', resource: 'sast.scan', time: '15 min ago', status: 'error' },
];

const alertsData = [
  { id: 1, severity: 'critical', message: 'High CPU usage on worker-3', time: '5 min ago' },
  { id: 2, severity: 'warning', message: 'Memory usage above 80%', time: '10 min ago' },
  { id: 3, severity: 'info', message: 'New agent registered', time: '15 min ago' },
];

const resourceData = {
  cpu: 65,
  memory: 72,
  network: 45,
  disk: 38,
};

export default function DashboardWidgetsPage() {
  const [layouts, setLayouts] = useState(mockLayouts);
  const [selectedLayout, setSelectedLayout] = useState(mockLayouts[0]);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [editingWidget, setEditingWidget] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editMode, setEditMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);

  const [layoutForm, setLayoutForm] = useState({
    name: '',
    description: '',
  });

  const [widgetForm, setWidgetForm] = useState({
    title: '',
    templateId: '',
    size: 'medium',
    config: {} as any,
  });

  // Filter widgets by category
  const filteredTemplates = widgetTemplates.filter(t => 
    selectedCategory === 'all' || t.category === selectedCategory
  );

  const handleCreateLayout = () => {
    if (!layoutForm.name) {
      toast.error('Please enter a layout name');
      return;
    }

    const newLayout = {
      id: `layout-${Date.now()}`,
      name: layoutForm.name,
      description: layoutForm.description,
      isDefault: false,
      widgets: [],
    };

    setLayouts([...layouts, newLayout]);
    setSelectedLayout(newLayout);
    setLayoutForm({ name: '', description: '' });
    toast.success('Layout created');
  };

  const handleDeleteLayout = (layoutId: string) => {
    if (layouts.length === 1) {
      toast.error('Cannot delete the only layout');
      return;
    }
    if (confirm('Are you sure you want to delete this layout?')) {
      setLayouts(layouts.filter(l => l.id !== layoutId));
      setSelectedLayout(layouts[0]);
      toast.success('Layout deleted');
    }
  };

  const handleSetDefaultLayout = (layoutId: string) => {
    setLayouts(prev =>
      prev.map(l => ({
        ...l,
        isDefault: l.id === layoutId,
      }))
    );
    toast.success('Default layout updated');
  };

  const handleAddWidget = (templateId: string) => {
    const template = widgetTemplates.find(t => t.id === templateId);
    if (!template) return;

    const newWidget = {
      id: `widget-${Date.now()}`,
      templateId: template.id,
      title: template.name,
      size: template.defaultSize,
      position: selectedLayout.widgets.length,
      config: {},
    };

    setSelectedLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
    }));

    setShowWidgetLibrary(false);
    toast.success('Widget added');
  };

  const handleRemoveWidget = (widgetId: string) => {
    if (confirm('Are you sure you want to remove this widget?')) {
      setSelectedLayout(prev => ({
        ...prev,
        widgets: prev.widgets.filter(w => w.id !== widgetId),
      }));
      toast.success('Widget removed');
    }
  };

  const handleDuplicateWidget = (widget: any) => {
    const newWidget = {
      ...widget,
      id: `widget-${Date.now()}`,
      title: `${widget.title} (Copy)`,
      position: selectedLayout.widgets.length,
    };

    setSelectedLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
    }));
    toast.success('Widget duplicated');
  };

  const handleUpdateWidget = () => {
    if (!widgetForm.title) {
      toast.error('Please enter a widget title');
      return;
    }

    setSelectedLayout(prev => ({
      ...prev,
      widgets: prev.widgets.map(w =>
        w.id === editingWidget.id
          ? { ...w, title: widgetForm.title, size: widgetForm.size, config: widgetForm.config }
          : w
      ),
    }));

    setEditingWidget(null);
    setWidgetForm({ title: '', templateId: '', size: 'medium', config: {} });
    toast.success('Widget updated');
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(selectedLayout.widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedLayout(prev => ({
      ...prev,
      widgets: items,
    }));
  };

  const handleExportLayout = () => {
    const data = JSON.stringify(selectedLayout, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${selectedLayout.id}.json`;
    a.click();
    toast.success('Layout exported');
  };

  const handleImportLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const layout = JSON.parse(e.target?.result as string);
        layout.id = `layout-${Date.now()}`;
        setLayouts([...layouts, layout]);
        toast.success('Layout imported');
      } catch (error) {
        toast.error('Invalid layout file');
      }
    };
    reader.readAsText(file);
  };

  const renderWidget = (widget: any) => {
    const template = widgetTemplates.find(t => t.id === widget.templateId);
    if (!template) return null;

    const sizeClasses = {
      small: 'col-span-1 row-span-1',
      medium: 'col-span-2 row-span-1',
      large: 'col-span-2 row-span-2',
    };

    return (
      <div className={cn(
        'relative group',
        sizeClasses[widget.size as keyof typeof sizeClasses]
      )}>
        <Card className="h-full bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white">
                {widget.title}
              </CardTitle>
              {editMode && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingWidget(widget);
                      setWidgetForm({
                        title: widget.title,
                        templateId: widget.templateId,
                        size: widget.size,
                        config: widget.config,
                      });
                    }}
                    className="p-1 rounded hover:bg-indigo-500/10"
                  >
                    <Edit className="w-3 h-3 text-indigo-400" />
                  </button>
                  <button
                    onClick={() => handleDuplicateWidget(widget)}
                    className="p-1 rounded hover:bg-indigo-500/10"
                  >
                    <Copy className="w-3 h-3 text-indigo-400" />
                  </button>
                  <button
                    onClick={() => handleRemoveWidget(widget.id)}
                    className="p-1 rounded hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-3 h-3 text-rose-400" />
                  </button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {/* Render different widget types */}
            {template.id === 'stats' && (
              <div>
                <p className="text-2xl font-bold text-white">
                  {statsData[widget.config.metric as keyof typeof statsData]?.value}
                </p>
                <p className="text-xs text-emerald-400 mt-1">
                  {statsData[widget.config.metric as keyof typeof statsData]?.change}
                </p>
              </div>
            )}

            {template.id === 'chart-line' && (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {template.id === 'chart-bar' && (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <Bar dataKey="value" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {template.id === 'chart-pie' && (
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={30}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            )}

            {template.id === 'recent-activity' && (
              <div className="space-y-2 max-h-32 overflow-auto">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="text-xs">
                    <span className="text-white">{activity.action}</span>
                    <span className="text-zinc-400 ml-2">{activity.time}</span>
                  </div>
                ))}
              </div>
            )}

            {template.id === 'alerts' && (
              <div className="space-y-2">
                {alertsData.map((alert) => (
                  <div key={alert.id} className="text-xs flex items-center gap-1">
                    <AlertCircle className={cn(
                      'w-3 h-3',
                      alert.severity === 'critical' ? 'text-rose-400' :
                      alert.severity === 'warning' ? 'text-amber-400' :
                      'text-blue-400'
                    )} />
                    <span className="text-white truncate">{alert.message}</span>
                  </div>
                ))}
              </div>
            )}

            {template.id === 'resource-usage' && (
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">CPU</span>
                    <span className="text-white">{resourceData.cpu}%</span>
                  </div>
                  <Progress value={resourceData.cpu} className="h-1 bg-slate-800" />
                </div>
                <div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-400">Memory</span>
                    <span className="text-white">{resourceData.memory}%</span>
                  </div>
                  <Progress value={resourceData.memory} className="h-1 bg-slate-800" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold">
            <span className="gradient-text-primary">Dashboard Widgets</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm lg:text-base">
            Customize your dashboard with widgets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setEditMode(!editMode)}
            className={cn(
              'border',
              editMode ? 'border-indigo-500/30 text-indigo-400' : 'border-zinc-500/30'
            )}
          >
            {editMode ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Done Editing
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Edit Dashboard
              </>
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-indigo-500/30">
                <Layout className="w-4 h-4 mr-2" />
                Layouts
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900 border-indigo-500/20 w-56">
              <DropdownMenuLabel>Saved Layouts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {layouts.map((layout) => (
                <DropdownMenuItem
                  key={layout.id}
                  className="flex items-center justify-between"
                  onClick={() => setSelectedLayout(layout)}
                >
                  <span className={cn(
                    'text-sm',
                    selectedLayout.id === layout.id && 'text-indigo-400'
                  )}>
                    {layout.name}
                    {layout.isDefault && <Star className="w-3 h-3 ml-2 inline fill-yellow-400 text-yellow-400" />}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                setLayoutForm({ name: '', description: '' });
                // Open create layout modal
              }}>
                <Plus className="w-4 h-4 mr-2" />
                New Layout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setShowWidgetLibrary(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
        </div>
      </div>

      {/* Layout Info */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{selectedLayout.name}</h2>
          <p className="text-sm text-zinc-400">{selectedLayout.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportLayout}
            className="p-2 rounded-lg hover:bg-indigo-500/10"
            title="Export layout"
          >
            <Download className="w-4 h-4 text-indigo-400" />
          </button>
          <label className="p-2 rounded-lg hover:bg-indigo-500/10 cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleImportLayout}
              className="hidden"
            />
            <Upload className="w-4 h-4 text-indigo-400" />
          </label>
          {!selectedLayout.isDefault && (
            <button
              onClick={() => handleSetDefaultLayout(selectedLayout.id)}
              className="p-2 rounded-lg hover:bg-indigo-500/10"
              title="Set as default"
            >
              <Star className="w-4 h-4 text-yellow-400" />
            </button>
          )}
          <button
            onClick={() => handleDeleteLayout(selectedLayout.id)}
            className="p-2 rounded-lg hover:bg-rose-500/10"
            title="Delete layout"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="widgets" direction="horizontal" type="grid">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-4 gap-4 auto-rows-min"
              style={{ minHeight: '500px' }}
            >
              {selectedLayout.widgets
                .sort((a, b) => a.position - b.position)
                .map((widget, index) => (
                  <Draggable
                    key={widget.id}
                    draggableId={widget.id}
                    index={index}
                    isDragDisabled={!editMode}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={cn(
                          snapshot.isDragging && 'opacity-50 rotate-1 scale-105',
                          editMode && 'cursor-move'
                        )}
                      >
                        {renderWidget(widget)}
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Empty State */}
      {selectedLayout.widgets.length === 0 && (
        <div className="text-center py-12 bg-slate-900/30 rounded-lg border border-indigo-500/20">
          <LayoutDashboard className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400">No widgets added yet</p>
          <Button
            onClick={() => setShowWidgetLibrary(true)}
            variant="outline"
            className="mt-4 border-indigo-500/30 text-indigo-400"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add your first widget
          </Button>
        </div>
      )}

      {/* Widget Library Modal */}
      <AnimatePresence>
        {showWidgetLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowWidgetLibrary(false)}
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
                    <CardTitle className="text-white">Widget Library</CardTitle>
                    <button
                      onClick={() => setShowWidgetLibrary(false)}
                      className="p-1 rounded-lg hover:bg-indigo-500/10"
                    >
                      <X className="w-5 h-5 text-zinc-400" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Category Filter */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['all', 'metrics', 'charts', 'monitoring', 'workflows', 'agents', 'finance', 'analytics'].map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm capitalize transition-all',
                          selectedCategory === category
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : 'bg-slate-800 text-zinc-400 hover:text-indigo-400'
                        )}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  {/* Widget Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-auto p-1">
                    {filteredTemplates.map((template) => {
                      const Icon = template.icon;
                      const isAdded = selectedLayout.widgets.some(w => w.templateId === template.id);

                      return (
                        <Card
                          key={template.id}
                          className={cn(
                            'bg-slate-800/50 border-indigo-500/20 hover:border-indigo-500/40 transition-colors cursor-pointer',
                            isAdded && 'opacity-50'
                          )}
                          onClick={() => !isAdded && handleAddWidget(template.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 rounded-lg bg-indigo-500/10">
                                <Icon className="w-4 h-4 text-indigo-400" />
                              </div>
                              <h3 className="font-medium text-white">{template.name}</h3>
                            </div>
                            <p className="text-xs text-zinc-400 mb-2">{template.description}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="border-indigo-500/30">
                                {template.category}
                              </Badge>
                              {isAdded && (
                                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
                                  Added
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Widget Modal */}
      <AnimatePresence>
        {editingWidget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setEditingWidget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-slate-900 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Edit Widget</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Widget Title</label>
                    <Input
                      value={widgetForm.title}
                      onChange={(e) => setWidgetForm({ ...widgetForm, title: e.target.value })}
                      className="bg-slate-900 border-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Size</label>
                    <select
                      value={widgetForm.size}
                      onChange={(e) => setWidgetForm({ ...widgetForm, size: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  {/* Widget-specific configuration would go here */}
                  <div className="p-3 bg-slate-800/30 rounded-lg">
                    <p className="text-sm text-zinc-400">Additional configuration options would appear here based on widget type.</p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleUpdateWidget}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingWidget(null)}
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