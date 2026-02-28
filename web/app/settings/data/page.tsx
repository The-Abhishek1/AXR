// app/settings/data/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  HardDrive,
  Cloud,
  Download,
  Upload,
  Trash2,
  Archive,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  FileJson,
  FileText,
  FileSpreadsheet,
  Image,
  Settings,
  Save,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Minus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import toast from 'react-hot-toast';

// Mock data usage
const mockDataUsage = {
  total: 156.7,
  used: 98.3,
  free: 58.4,
  unit: 'GB',
  breakdown: [
    { category: 'Workflows', size: 45.2, color: '#6366f1' },
    { category: 'Logs', size: 23.8, color: '#8b5cf6' },
    { category: 'Metrics', size: 15.6, color: '#d946ef' },
    { category: 'Artifacts', size: 8.9, color: '#ec4899' },
    { category: 'Backups', size: 4.8, color: '#f43f5e' },
  ],
  retention: {
    logs: 30,
    metrics: 90,
    artifacts: 180,
    backups: 365,
  },
  growth: [
    { month: 'Jan', size: 82.4 },
    { month: 'Feb', size: 86.2 },
    { month: 'Mar', size: 89.1 },
    { month: 'Apr', size: 92.8 },
    { month: 'May', size: 95.3 },
    { month: 'Jun', size: 98.3 },
  ],
};

const mockBackups = [
  {
    id: 'backup-1',
    name: 'Full System Backup',
    date: '2024-01-20T03:00:00Z',
    size: '45.2 GB',
    status: 'completed',
    type: 'full',
    location: 's3://axr-backups/prod/',
    retention: '365 days',
  },
  {
    id: 'backup-2',
    name: 'Incremental Backup',
    date: '2024-01-19T03:00:00Z',
    size: '2.3 GB',
    status: 'completed',
    type: 'incremental',
    location: 's3://axr-backups/prod/',
    retention: '30 days',
  },
  {
    id: 'backup-3',
    name: 'Incremental Backup',
    date: '2024-01-18T03:00:00Z',
    size: '1.8 GB',
    status: 'completed',
    type: 'incremental',
    location: 's3://axr-backups/prod/',
    retention: '30 days',
  },
  {
    id: 'backup-4',
    name: 'Configuration Backup',
    date: '2024-01-17T03:00:00Z',
    size: '0.5 GB',
    status: 'failed',
    type: 'config',
    location: 's3://axr-backups/prod/',
    retention: '90 days',
    error: 'Connection timeout',
  },
];

export default function DataSettingsPage() {
  const [dataUsage, setDataUsage] = useState(mockDataUsage);
  const [backups, setBackups] = useState(mockBackups);
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState('daily');
  const [retentionDays, setRetentionDays] = useState(30);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  const [dataRetention, setDataRetention] = useState({
    logs: 30,
    metrics: 90,
    artifacts: 180,
    backups: 365,
  });

  const usagePercentage = (dataUsage.used / dataUsage.total) * 100;

  const handleCreateBackup = () => {
    toast.success('Starting backup...');
  };

  const handleRestoreBackup = (backup: any) => {
    if (confirm(`Are you sure you want to restore from ${backup.name}?`)) {
      toast.success('Restore started');
    }
  };

  const handleDeleteBackup = (backup: any) => {
    if (confirm(`Are you sure you want to delete this backup?`)) {
      toast.success('Backup deleted');
    }
  };

  const handleExportData = () => {
    toast.success('Data export started');
  };

  const handleImportData = () => {
    toast.success('Data import started');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      toast.success('Data cleared');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold gradient-text-primary">Data Management</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your data, backups, and retention policies
        </p>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-indigo-500/20">
          <TabsTrigger value="usage">Storage Usage</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="import-export">Import/Export</TabsTrigger>
        </TabsList>

        {/* Storage Usage Tab */}
        <TabsContent value="usage" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Usage Overview */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Storage Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400">Total Storage</p>
                    <p className="text-2xl font-bold text-white">{dataUsage.total} {dataUsage.unit}</p>
                  </div>
                  <Database className="w-8 h-8 text-indigo-400 opacity-50" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-400">Used</span>
                    <span className="text-white">{dataUsage.used} {dataUsage.unit}</span>
                  </div>
                  <Progress value={usagePercentage} className="h-2 bg-slate-800" />
                  <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>Free: {dataUsage.free} {dataUsage.unit}</span>
                    <span>{usagePercentage.toFixed(1)}% used</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-indigo-500/20">
                  <p className="text-sm text-zinc-400 mb-3">Storage Breakdown</p>
                  <div className="space-y-3">
                    {dataUsage.breakdown.map((item) => (
                      <div key={item.category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-white">{item.category}</span>
                          <span className="text-zinc-400">{item.size} {dataUsage.unit}</span>
                        </div>
                        <Progress
                          value={(item.size / dataUsage.used) * 100}
                          className="h-1.5 bg-slate-800"
                          indicatorClassName="bg-gradient-to-r from-indigo-500 to-purple-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Growth Chart */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Storage Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dataUsage.growth}>
                      <defs>
                        <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#71717a" />
                      <YAxis stroke="#71717a" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #6366f1',
                          borderRadius: '8px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="size"
                        stroke="#6366f1"
                        fill="url(#colorGrowth)"
                        name="Storage (GB)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={handleCreateBackup}
                  className="border-indigo-500/30 text-indigo-400"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Backup Now
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="border-indigo-500/30 text-indigo-400"
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button
                  variant="outline"
                  onClick={handleImportData}
                  className="border-indigo-500/30 text-indigo-400"
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearData}
                  className="border-rose-500/30 text-rose-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backups Tab */}
        <TabsContent value="backups" className="space-y-4">
          {/* Backup Settings */}
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Backup Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Automatic Backups</p>
                  <p className="text-xs text-zinc-400">Schedule regular backups</p>
                </div>
                <Switch
                  checked={autoBackup}
                  onCheckedChange={setAutoBackup}
                />
              </div>

              {autoBackup && (
                <>
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Backup Schedule</label>
                    <select
                      value={backupSchedule}
                      onChange={(e) => setBackupSchedule(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Retention Period (days)</label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[retentionDays]}
                        onValueChange={([value]) => setRetentionDays(value)}
                        max={365}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-sm text-white w-16">{retentionDays} days</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Encryption</p>
                      <p className="text-xs text-zinc-400">Encrypt backup data</p>
                    </div>
                    <Switch
                      checked={encryptionEnabled}
                      onCheckedChange={setEncryptionEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Compression</p>
                      <p className="text-xs text-zinc-400">Compress backup data</p>
                    </div>
                    <Switch
                      checked={compressionEnabled}
                      onCheckedChange={setCompressionEnabled}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Backup History */}
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Backup History</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateBackup}
                  className="border-indigo-500/30 text-indigo-400"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Backup
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'p-2 rounded-lg',
                        backup.status === 'completed' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                      )}>
                        {backup.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white">{backup.name}</h4>
                        <p className="text-xs text-zinc-400">
                          {new Date(backup.date).toLocaleString()} • {backup.size} • {backup.type}
                        </p>
                        {backup.error && (
                          <p className="text-xs text-rose-400 mt-1">{backup.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestoreBackup(backup)}
                        className="p-1.5 rounded-lg hover:bg-indigo-500/10"
                        title="Restore"
                      >
                        <RefreshCw className="w-4 h-4 text-indigo-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(backup)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Retention Tab */}
        <TabsContent value="retention">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Data Retention Policies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Logs Retention (days)</label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[dataRetention.logs]}
                    onValueChange={([value]) => setDataRetention({ ...dataRetention, logs: value })}
                    max={365}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-white w-16">{dataRetention.logs} days</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Metrics Retention (days)</label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[dataRetention.metrics]}
                    onValueChange={([value]) => setDataRetention({ ...dataRetention, metrics: value })}
                    max={365}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-white w-16">{dataRetention.metrics} days</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Artifacts Retention (days)</label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[dataRetention.artifacts]}
                    onValueChange={([value]) => setDataRetention({ ...dataRetention, artifacts: value })}
                    max={365}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-white w-16">{dataRetention.artifacts} days</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-1 block">Backups Retention (days)</label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[dataRetention.backups]}
                    onValueChange={([value]) => setDataRetention({ ...dataRetention, backups: value })}
                    max={365}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-white w-16">{dataRetention.backups} days</span>
                </div>
              </div>

              <Button className="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500">
                <Save className="w-4 h-4 mr-2" />
                Save Retention Policies
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import/Export Tab */}
        <TabsContent value="import-export">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Export Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-indigo-500/30" />
                    <span className="text-sm text-white">Workflows</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-indigo-500/30" />
                    <span className="text-sm text-white">Agents</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-indigo-500/30" />
                    <span className="text-sm text-white">Workers</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-indigo-500/30" />
                    <span className="text-sm text-white">Templates</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-indigo-500/30" />
                    <span className="text-sm text-white">Settings</span>
                  </label>
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Export Format</label>
                  <select className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm">
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="yaml">YAML</option>
                  </select>
                </div>

                <Button
                  onClick={handleExportData}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Export Selected
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Import Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-indigo-500/30 rounded-lg p-8 text-center">
                  <UploadIcon className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <p className="text-sm text-white">Drag and drop file here</p>
                  <p className="text-xs text-zinc-400 mt-1">or click to browse</p>
                  <input type="file" className="hidden" />
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Import Options</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-indigo-500/30" />
                      <span className="text-sm text-white">Overwrite existing data</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-indigo-500/30" />
                      <span className="text-sm text-white">Merge with existing</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-indigo-500/30" />
                      <span className="text-sm text-white">Validate before import</span>
                    </label>
                  </div>
                </div>

                <Button
                  onClick={handleImportData}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}