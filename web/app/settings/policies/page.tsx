// app/settings/policies/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Clock,
  Users,
  Globe,
  Server,
  Database,
  FileJson,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Filter,
  Search,
  MoreVertical,
  Play,
  Pause,
  AlertTriangle,
  Info
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
import toast from 'react-hot-toast';

// Mock policies data
const mockPolicies = [
  {
    id: 'policy-1',
    name: 'Data Retention Policy',
    description: 'Automatically delete data older than 90 days',
    type: 'retention',
    severity: 'info',
    status: 'active',
    scope: ['all'],
    rules: [
      { resource: 'logs', retention: 90, action: 'delete' },
      { resource: 'metrics', retention: 180, action: 'archive' },
      { resource: 'artifacts', retention: 30, action: 'delete' },
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T15:45:00Z',
    createdBy: 'admin@axr.io',
    enabled: true,
    violations: 0,
    compliance: ['GDPR', 'SOC2'],
  },
  {
    id: 'policy-2',
    name: 'Security Scanning Policy',
    description: 'Enforce security scanning on all deployments',
    type: 'security',
    severity: 'critical',
    status: 'active',
    scope: ['production', 'staging'],
    rules: [
      { scanType: 'sast', required: true, threshold: 90 },
      { scanType: 'dast', required: true, threshold: 85 },
      { scanType: 'dependency', required: true, threshold: 95 },
    ],
    createdAt: '2024-01-10T08:20:00Z',
    updatedAt: '2024-01-18T09:30:00Z',
    createdBy: 'security@axr.io',
    enabled: true,
    violations: 3,
    compliance: ['PCI-DSS', 'HIPAA'],
  },
  {
    id: 'policy-3',
    name: 'Budget Control Policy',
    description: 'Limit spending per workflow and notify on overages',
    type: 'financial',
    severity: 'warning',
    status: 'active',
    scope: ['all'],
    rules: [
      { metric: 'cost', limit: 100, action: 'warn' },
      { metric: 'cost', limit: 200, action: 'block' },
      { metric: 'duration', limit: 3600, action: 'warn' },
    ],
    createdAt: '2024-01-05T14:15:00Z',
    updatedAt: '2024-01-15T11:20:00Z',
    createdBy: 'finance@axr.io',
    enabled: true,
    violations: 12,
    compliance: ['SOX'],
  },
  {
    id: 'policy-4',
    name: 'Access Control Policy',
    description: 'Restrict access based on IP and authentication',
    type: 'access',
    severity: 'critical',
    status: 'active',
    scope: ['production'],
    rules: [
      { type: 'ip', allowed: ['10.0.0.0/8', '192.168.0.0/16'] },
      { type: 'mfa', required: true },
      { type: 'session', timeout: 3600 },
    ],
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-19T16:30:00Z',
    createdBy: 'security@axr.io',
    enabled: true,
    violations: 1,
    compliance: ['SOC2', 'ISO27001'],
  },
  {
    id: 'policy-5',
    name: 'Compliance Policy',
    description: 'Ensure workflows meet compliance standards',
    type: 'compliance',
    severity: 'info',
    status: 'draft',
    scope: ['production'],
    rules: [
      { standard: 'GDPR', requirements: ['data-retention', 'consent'] },
      { standard: 'SOC2', requirements: ['audit-log', 'access-control'] },
    ],
    createdAt: '2024-01-18T13:45:00Z',
    updatedAt: '2024-01-18T13:45:00Z',
    createdBy: 'compliance@axr.io',
    enabled: false,
    violations: 0,
    compliance: ['GDPR', 'SOC2'],
  },
];

const mockViolations = [
  {
    id: 'viol-1',
    policyId: 'policy-2',
    policyName: 'Security Scanning Policy',
    severity: 'critical',
    resource: 'deploy.service',
    message: 'SAST scan failed with 75% threshold (required 90%)',
    timestamp: '2024-01-20T14:30:00Z',
    status: 'active',
  },
  {
    id: 'viol-2',
    policyId: 'policy-3',
    policyName: 'Budget Control Policy',
    severity: 'warning',
    resource: 'data-pipeline',
    message: 'Budget exceeded $150 (limit $100)',
    timestamp: '2024-01-20T13:15:00Z',
    status: 'active',
  },
  {
    id: 'viol-3',
    policyId: 'policy-4',
    policyName: 'Access Control Policy',
    severity: 'critical',
    resource: 'login',
    message: 'Access attempt from unauthorized IP 203.0.113.45',
    timestamp: '2024-01-20T11:20:00Z',
    status: 'resolved',
    resolvedAt: '2024-01-20T11:25:00Z',
  },
  {
    id: 'viol-4',
    policyId: 'policy-1',
    policyName: 'Data Retention Policy',
    severity: 'info',
    resource: 'logs',
    message: 'Data older than 90 days marked for deletion',
    timestamp: '2024-01-20T09:45:00Z',
    status: 'resolved',
    resolvedAt: '2024-01-20T10:00:00Z',
  },
];

const policyTypes = [
  { id: 'all', name: 'All Policies', icon: Shield },
  { id: 'security', name: 'Security', icon: ShieldCheck },
  { id: 'access', name: 'Access Control', icon: Lock },
  { id: 'financial', name: 'Financial', icon: Database },
  { id: 'retention', name: 'Retention', icon: Clock },
  { id: 'compliance', name: 'Compliance', icon: FileJson },
];

const severityColors = {
  critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState(mockPolicies);
  const [violations, setViolations] = useState(mockViolations);
  const [showForm, setShowForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [search, setSearch] = useState('');
  const [showViolations, setShowViolations] = useState(false);
  const [activeTab, setActiveTab] = useState('policies');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'security',
    severity: 'info',
    scope: [] as string[],
    rules: [] as any[],
    compliance: [] as string[],
    enabled: true,
  });

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(search.toLowerCase()) ||
                         policy.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'all' || policy.type === selectedType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: policies.length,
    active: policies.filter(p => p.status === 'active' && p.enabled).length,
    draft: policies.filter(p => p.status === 'draft').length,
    violations: violations.filter(v => v.status === 'active').length,
    resolved: violations.filter(v => v.status === 'resolved').length,
    critical: violations.filter(v => v.severity === 'critical' && v.status === 'active').length,
  };

  const handleEdit = (policy: any) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description,
      type: policy.type,
      severity: policy.severity,
      scope: policy.scope,
      rules: policy.rules,
      compliance: policy.compliance || [],
      enabled: policy.enabled,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error('Please enter a policy name');
      return;
    }
    if (!formData.description) {
      toast.error('Please enter a policy description');
      return;
    }

    if (editingPolicy) {
      setPolicies(prev =>
        prev.map(p =>
          p.id === editingPolicy.id
            ? {
                ...p,
                ...formData,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      toast.success('Policy updated');
    } else {
      const newPolicy = {
        id: `policy-${Date.now()}`,
        ...formData,
        status: formData.enabled ? 'active' : 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin@axr.io',
        violations: 0,
      };
      setPolicies([newPolicy, ...policies]);
      toast.success('Policy created');
    }

    setShowForm(false);
    setEditingPolicy(null);
    setFormData({
      name: '',
      description: '',
      type: 'security',
      severity: 'info',
      scope: [],
      rules: [],
      compliance: [],
      enabled: true,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this policy?')) {
      setPolicies(policies.filter(p => p.id !== id));
      toast.success('Policy deleted');
    }
  };

  const handleTogglePolicy = (id: string) => {
    setPolicies(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, enabled: !p.enabled, status: !p.enabled ? 'active' : 'draft' }
          : p
      )
    );
    toast.success('Policy toggled');
  };

  const handleResolveViolation = (id: string) => {
    setViolations(prev =>
      prev.map(v =>
        v.id === id
          ? { ...v, status: 'resolved', resolvedAt: new Date().toISOString() }
          : v
      )
    );
    toast.success('Violation resolved');
  };

  const getTypeIcon = (type: string) => {
    const policyType = policyTypes.find(t => t.id === type);
    return policyType?.icon || Shield;
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'destructive',
      warning: 'warning',
      info: 'info',
      success: 'success',
    };
    return colors[severity as keyof typeof colors] || 'default';
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
          <h1 className="text-2xl font-bold gradient-text-primary">Policies</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage security, compliance, and governance policies
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingPolicy(null);
            setFormData({
              name: '',
              description: '',
              type: 'security',
              severity: 'info',
              scope: [],
              rules: [],
              compliance: [],
              enabled: true,
            });
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-indigo-500 to-purple-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Policy
        </Button>
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
              <Shield className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs text-zinc-400">Total Policies</p>
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
              <FileJson className="w-4 h-4 text-amber-400" />
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
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <div>
                <p className="text-xs text-zinc-400">Active Violations</p>
                <p className="text-lg font-bold text-rose-400">{stats.violations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="text-xs text-zinc-400">Resolved</p>
                <p className="text-lg font-bold text-emerald-400">{stats.resolved}</p>
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
                <p className="text-lg font-bold text-rose-400">{stats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-indigo-500/20">
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="violations">
            Violations
            {stats.violations > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stats.violations}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            {policyTypes.map((type) => {
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

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
            <Input
              type="text"
              placeholder="Search policies by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-900/50 border-indigo-500/20"
            />
          </div>

          {/* Policies List */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filteredPolicies.map((policy) => {
              const TypeIcon = getTypeIcon(policy.type);

              return (
                <motion.div key={policy.id} variants={item}>
                  <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={cn('p-2 rounded-lg', severityColors[policy.severity as keyof typeof severityColors])}>
                          <TypeIcon className="w-5 h-5" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-white">{policy.name}</h3>
                            <Badge className={severityColors[policy.severity as keyof typeof severityColors]}>
                              {policy.severity}
                            </Badge>
                            <Badge variant={policy.enabled ? 'success' : 'secondary'}>
                              {policy.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                            {policy.violations > 0 && (
                              <Badge variant="destructive">
                                {policy.violations} violations
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-zinc-300 mb-3">{policy.description}</p>

                          {/* Rules Preview */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {policy.rules.slice(0, 3).map((rule, i) => (
                              <Badge key={i} variant="outline" className="border-indigo-500/30">
                                {Object.entries(rule).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                              </Badge>
                            ))}
                            {policy.rules.length > 3 && (
                              <Badge variant="outline" className="border-indigo-500/30">
                                +{policy.rules.length - 3} more
                              </Badge>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              Scope: {policy.scope.join(', ')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Updated {new Date(policy.updatedAt).toLocaleDateString()}
                            </span>
                            {policy.compliance?.map((c) => (
                              <Badge key={c} variant="outline" className="border-indigo-500/30">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePolicy(policy.id)}
                            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
                            title={policy.enabled ? 'Disable' : 'Enable'}
                          >
                            {policy.enabled ? (
                              <Pause className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Play className="w-4 h-4 text-emerald-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(policy)}
                            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
                          >
                            <Edit className="w-4 h-4 text-indigo-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(policy.id)}
                            className="p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-rose-400" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-indigo-400" />
                Active Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {violations.map((violation) => (
                  <div
                    key={violation.id}
                    className={cn(
                      'p-4 rounded-lg border',
                      severityColors[violation.severity as keyof typeof severityColors]
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {violation.severity === 'critical' && <AlertCircle className="w-5 h-5 mt-0.5" />}
                        {violation.severity === 'warning' && <AlertTriangle className="w-5 h-5 mt-0.5" />}
                        {violation.severity === 'info' && <Info className="w-5 h-5 mt-0.5" />}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-white">{violation.policyName}</h4>
                            <Badge className={severityColors[violation.severity as keyof typeof severityColors]}>
                              {violation.severity}
                            </Badge>
                            <Badge variant={violation.status === 'active' ? 'destructive' : 'success'}>
                              {violation.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-zinc-300">{violation.message}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                            <span>Resource: {violation.resource}</span>
                            <span>•</span>
                            <span>{new Date(violation.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      {violation.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveViolation(violation.id)}
                          className="border-emerald-500/30 text-emerald-400"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Compliance Standards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['GDPR', 'SOC2', 'HIPAA', 'PCI-DSS', 'ISO27001', 'SOX'].map((standard) => {
                    const compliantPolicies = policies.filter(p => p.compliance?.includes(standard)).length;
                    const totalPolicies = policies.length;
                    const complianceRate = totalPolicies > 0 ? (compliantPolicies / totalPolicies) * 100 : 0;

                    return (
                      <div key={standard}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white">{standard}</span>
                          <span className="text-xs text-zinc-400">
                            {compliantPolicies}/{totalPolicies} policies
                          </span>
                        </div>
                        <Progress value={complianceRate} className="h-2 bg-slate-800" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-white">Compliance Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Monthly Compliance Report', 'Security Audit Summary', 'Policy Violation Analysis'].map((report, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileJson className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm text-white">{report}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg"
                  >
                    <div className="p-2 rounded-lg bg-indigo-500/10">
                      <Shield className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        Security Policy updated by admin@axr.io
                      </p>
                      <p className="text-xs text-zinc-400">2 hours ago</p>
                    </div>
                    <Badge variant="outline" className="border-indigo-500/30">
                      policy-2
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Policy Modal */}
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
                    {editingPolicy ? 'Edit Policy' : 'Create Policy'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Policy Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Data Retention Policy"
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
                      placeholder="Describe the policy purpose..."
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
                        {policyTypes.slice(1).map((type) => (
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
                        <option value="critical">Critical</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Scope</label>
                    <div className="flex gap-3">
                      {['all', 'production', 'staging', 'development'].map((s) => (
                        <label key={s} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.scope.includes(s)}
                            onChange={(e) => {
                              const scope = e.target.checked
                                ? [...formData.scope, s]
                                : formData.scope.filter(ss => ss !== s);
                              setFormData({ ...formData, scope });
                            }}
                            className="rounded border-indigo-500/30 bg-slate-900"
                          />
                          <span className="text-sm text-white capitalize">{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Compliance Standards</label>
                    <div className="flex flex-wrap gap-2">
                      {['GDPR', 'SOC2', 'HIPAA', 'PCI-DSS', 'ISO27001', 'SOX'].map((c) => (
                        <label key={c} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.compliance.includes(c)}
                            onChange={(e) => {
                              const compliance = e.target.checked
                                ? [...formData.compliance, c]
                                : formData.compliance.filter(cc => cc !== c);
                              setFormData({ ...formData, compliance });
                            }}
                            className="rounded border-indigo-500/30 bg-slate-900"
                          />
                          <span className="text-sm text-white">{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Rules</label>
                    <div className="space-y-2">
                      {formData.rules.map((rule, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-slate-800/30 rounded-lg">
                          <span className="text-sm text-white flex-1">
                            {Object.entries(rule).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                          </span>
                          <button
                            onClick={() => {
                              const rules = [...formData.rules];
                              rules.splice(index, 1);
                              setFormData({ ...formData, rules });
                            }}
                            className="p-1 hover:bg-rose-500/10 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-rose-400" />
                          </button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newRule = prompt('Enter rule (key:value format)');
                          if (newRule) {
                            const [key, value] = newRule.split(':');
                            setFormData({
                              ...formData,
                              rules: [...formData.rules, { [key.trim()]: value.trim() }],
                            });
                          }
                        }}
                        className="w-full border-indigo-500/30 text-indigo-400"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Rule
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm text-white">Enable Policy</label>
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
                      {editingPolicy ? 'Update' : 'Create'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingPolicy(null);
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