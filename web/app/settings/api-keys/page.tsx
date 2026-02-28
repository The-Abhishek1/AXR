// app/settings/api-keys/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Globe,
  Shield,
  Lock,
  Unlock,
  Download,
  Filter,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// Mock API keys data
const mockApiKeys = [
  {
    id: 'key-1',
    name: 'Production API Key',
    key: 'axr_live_sk_abc123def456ghi789jkl',
    prefix: 'axr_live_sk_abc123...',
    createdAt: '2024-01-15T10:30:00Z',
    expiresAt: '2025-01-15T10:30:00Z',
    lastUsed: '2024-01-20T15:45:00Z',
    usage: 15234,
    permissions: ['read', 'write', 'delete'],
    environments: ['production', 'staging'],
    status: 'active',
    createdBy: 'admin@axr.io',
  },
  {
    id: 'key-2',
    name: 'Development API Key',
    key: 'axr_dev_sk_xyz789uvw321rst456',
    prefix: 'axr_dev_sk_xyz789...',
    createdAt: '2024-01-10T08:20:00Z',
    expiresAt: '2024-07-10T08:20:00Z',
    lastUsed: '2024-01-19T09:30:00Z',
    usage: 4567,
    permissions: ['read', 'write'],
    environments: ['development'],
    status: 'active',
    createdBy: 'dev@axr.io',
  },
  {
    id: 'key-3',
    name: 'Read-only API Key',
    key: 'axr_ro_sk_lmn456opq789rst012',
    prefix: 'axr_ro_sk_lmn456...',
    createdAt: '2024-01-05T14:15:00Z',
    expiresAt: '2024-04-05T14:15:00Z',
    lastUsed: '2024-01-18T11:20:00Z',
    usage: 2345,
    permissions: ['read'],
    environments: ['staging'],
    status: 'active',
    createdBy: 'analytics@axr.io',
  },
  {
    id: 'key-4',
    name: 'Expired Key',
    key: 'axr_exp_sk_uvw321rst456xyz789',
    prefix: 'axr_exp_sk_uvw321...',
    createdAt: '2023-01-01T00:00:00Z',
    expiresAt: '2023-12-31T23:59:59Z',
    lastUsed: '2023-12-30T16:20:00Z',
    usage: 12345,
    permissions: ['read', 'write'],
    environments: ['production'],
    status: 'expired',
    createdBy: 'admin@axr.io',
  },
  {
    id: 'key-5',
    name: 'Revoked Key',
    key: 'axr_rev_sk_abc123def456ghi789',
    prefix: 'axr_rev_sk_abc123...',
    createdAt: '2023-06-15T09:00:00Z',
    expiresAt: '2024-06-15T09:00:00Z',
    lastUsed: '2023-12-25T10:15:00Z',
    usage: 6789,
    permissions: ['read', 'write', 'delete'],
    environments: ['development'],
    status: 'revoked',
    createdBy: 'dev@axr.io',
    revokedAt: '2023-12-26T14:30:00Z',
    revokedReason: 'Security rotation',
  },
];

const permissionsList = [
  { id: 'read', name: 'Read', description: 'View resources' },
  { id: 'write', name: 'Write', description: 'Create and update resources' },
  { id: 'delete', name: 'Delete', description: 'Delete resources' },
  { id: 'admin', name: 'Admin', description: 'Full administrative access' },
];

const environmentsList = [
  { id: 'development', name: 'Development' },
  { id: 'staging', name: 'Staging' },
  { id: 'production', name: 'Production' },
];

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState(mockApiKeys);
  const [showForm, setShowForm] = useState(false);
  const [editingKey, setEditingKey] = useState<any>(null);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[],
    environments: [] as string[],
    expiresIn: '90',
    description: '',
  });

  const [newKeyData, setNewKeyData] = useState<{
    key: string;
    name: string;
  } | null>(null);

  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(search.toLowerCase()) ||
                         key.prefix.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || key.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: apiKeys.length,
    active: apiKeys.filter(k => k.status === 'active').length,
    expired: apiKeys.filter(k => k.status === 'expired').length,
    revoked: apiKeys.filter(k => k.status === 'revoked').length,
    totalUsage: apiKeys.reduce((acc, k) => acc + k.usage, 0),
  };

  const handleEdit = (key: any) => {
    setEditingKey(key);
    setFormData({
      name: key.name,
      permissions: key.permissions,
      environments: key.environments,
      expiresIn: '90',
      description: '',
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error('Please enter a key name');
      return;
    }
    if (formData.permissions.length === 0) {
      toast.error('Select at least one permission');
      return;
    }
    if (formData.environments.length === 0) {
      toast.error('Select at least one environment');
      return;
    }

    if (editingKey) {
      setApiKeys(prev =>
        prev.map(k =>
          k.id === editingKey.id
            ? {
                ...k,
                name: formData.name,
                permissions: formData.permissions,
                environments: formData.environments,
              }
            : k
        )
      );
      toast.success('API key updated');
    } else {
      // Generate new key
      const newKey = `axr_${formData.environments[0]}_sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const newKeyObj = {
        id: `key-${Date.now()}`,
        name: formData.name,
        key: newKey,
        prefix: newKey.substring(0, 20) + '...',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + parseInt(formData.expiresIn) * 24 * 60 * 60 * 1000).toISOString(),
        lastUsed: null,
        usage: 0,
        permissions: formData.permissions,
        environments: formData.environments,
        status: 'active',
        createdBy: 'admin@axr.io',
      };
      
      setApiKeys(prev => [newKeyObj, ...prev]);
      setNewKeyData({ key: newKey, name: formData.name });
      toast.success('API key created');
    }

    setShowForm(false);
    setEditingKey(null);
    setFormData({ name: '', permissions: [], environments: [], expiresIn: '90', description: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      setApiKeys(prev => prev.filter(k => k.id !== id));
      toast.success('API key deleted');
    }
  };

  const handleRevoke = (id: string) => {
    if (confirm('Are you sure you want to revoke this API key? It will immediately stop working.')) {
      setApiKeys(prev =>
        prev.map(k =>
          k.id === id
            ? { ...k, status: 'revoked', revokedAt: new Date().toISOString(), revokedReason: 'Manually revoked' }
            : k
        )
      );
      toast.success('API key revoked');
    }
  };

  const handleRotate = (id: string) => {
    if (confirm('Rotating the key will generate a new key. The old key will stop working immediately. Continue?')) {
      const newKey = `axr_rot_sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setApiKeys(prev =>
        prev.map(k =>
          k.id === id
            ? {
                ...k,
                key: newKey,
                prefix: newKey.substring(0, 20) + '...',
                status: 'active',
                lastUsed: null,
              }
            : k
        )
      );
      toast.success('API key rotated');
    }
  };

  const copyToClipboard = (text: string, message: string = 'Copied to clipboard') => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'expired': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'revoked': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active': return CheckCircle;
      case 'expired': return Clock;
      case 'revoked': return XCircle;
      default: return AlertCircle;
    }
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
          <h1 className="text-2xl font-bold gradient-text-primary">API Keys</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage API keys for programmatic access
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingKey(null);
            setFormData({ name: '', permissions: [], environments: [], expiresIn: '90', description: '' });
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-indigo-500 to-purple-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          New API Key
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
              <Key className="w-4 h-4 text-indigo-400" />
              <div>
                <p className="text-xs text-zinc-400">Total Keys</p>
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
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs text-zinc-400">Expired</p>
                <p className="text-lg font-bold text-amber-400">{stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <div>
                <p className="text-xs text-zinc-400">Revoked</p>
                <p className="text-lg font-bold text-rose-400">{stats.revoked}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-indigo-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs text-zinc-400">Total Usage</p>
                <p className="text-lg font-bold text-purple-400">{stats.totalUsage.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Search keys by name or prefix..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-4 bg-slate-900/50 border-indigo-500/20"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="all">All Keys</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      {/* New Key Display */}
      <AnimatePresence>
        {newKeyData && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-emerald-400">API Key Created</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Make sure to copy your new API key now. You won't be able to see it again!
                </p>
                <div className="mt-3 p-3 bg-slate-900 rounded-lg font-mono text-sm flex items-center justify-between">
                  <span className="text-indigo-400">{newKeyData.key}</span>
                  <button
                    onClick={() => copyToClipboard(newKeyData.key, 'API key copied')}
                    className="p-1 hover:bg-indigo-500/10 rounded"
                  >
                    <Copy className="w-4 h-4 text-indigo-400" />
                  </button>
                </div>
                <button
                  onClick={() => setNewKeyData(null)}
                  className="mt-2 text-xs text-zinc-400 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Keys List */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {filteredKeys.map((key) => {
          const StatusIcon = getStatusIcon(key.status);
          const expiresIn = new Date(key.expiresAt).getTime() - Date.now();
          const daysLeft = Math.ceil(expiresIn / (1000 * 60 * 60 * 24));
          const isExpiringSoon = daysLeft <= 30 && daysLeft > 0;

          return (
            <motion.div key={key.id} variants={item}>
              <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={cn('p-2 rounded-lg', getStatusColor(key.status))}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-white">{key.name}</h3>
                          <Badge className={cn(getStatusColor(key.status))}>
                            {key.status}
                          </Badge>
                          {key.status === 'active' && isExpiringSoon && (
                            <Badge variant="warning" className="text-xs">
                              Expires in {daysLeft} days
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-3">
                          {/* Key Preview */}
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-slate-800 px-2 py-1 rounded text-indigo-400">
                              {showKey === key.id ? key.key : key.prefix}
                            </code>
                            <button
                              onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                              className="p-1 hover:bg-indigo-500/10 rounded"
                            >
                              {showKey === key.id ? (
                                <EyeOff className="w-3 h-3 text-zinc-400" />
                              ) : (
                                <Eye className="w-3 h-3 text-zinc-400" />
                              )}
                            </button>
                            <button
                              onClick={() => copyToClipboard(key.key)}
                              className="p-1 hover:bg-indigo-500/10 rounded"
                            >
                              <Copy className="w-3 h-3 text-zinc-400" />
                            </button>
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {key.createdBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Created {new Date(key.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Expires {new Date(key.expiresAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {key.usage.toLocaleString()} requests
                            </span>
                          </div>

                          {/* Permissions */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Lock className="w-3 h-3 text-zinc-400" />
                            {key.permissions.map((perm) => (
                              <Badge key={perm} variant="outline" className="text-xs border-indigo-500/30">
                                {perm}
                              </Badge>
                            ))}
                          </div>

                          {/* Environments */}
                          <div className="flex flex-wrap items-center gap-2">
                            <Globe className="w-3 h-3 text-zinc-400" />
                            {key.environments.map((env) => (
                              <Badge key={env} variant="outline" className="text-xs border-indigo-500/30">
                                {env}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {key.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleRotate(key.id)}
                            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
                            title="Rotate key"
                          >
                            <RefreshCw className="w-4 h-4 text-indigo-400" />
                          </button>
                          <button
                            onClick={() => handleEdit(key)}
                            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-indigo-400" />
                          </button>
                          <button
                            onClick={() => handleRevoke(key.id)}
                            className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors"
                            title="Revoke"
                          >
                            <XCircle className="w-4 h-4 text-amber-400" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(key.id)}
                        className="p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                    </div>
                  </div>

                  {/* Revocation reason (if revoked) */}
                  {key.status === 'revoked' && key.revokedReason && (
                    <div className="mt-3 pt-3 border-t border-indigo-500/20 text-xs text-zinc-400">
                      <span className="text-rose-400">Revoked:</span> {key.revokedReason} on {new Date(key.revokedAt).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Create/Edit Modal */}
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
                    {editingKey ? 'Edit API Key' : 'Create API Key'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Key Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Production API Key"
                      className="bg-slate-900 border-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Permissions</label>
                    <div className="grid grid-cols-2 gap-2">
                      {permissionsList.map((perm) => (
                        <label
                          key={perm.id}
                          className={cn(
                            'flex items-start gap-2 p-3 rounded-lg border cursor-pointer transition-colors',
                            formData.permissions.includes(perm.id)
                              ? 'border-indigo-500 bg-indigo-500/10'
                              : 'border-indigo-500/20 hover:border-indigo-500/30'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(perm.id)}
                            onChange={(e) => {
                              const perms = e.target.checked
                                ? [...formData.permissions, perm.id]
                                : formData.permissions.filter(p => p !== perm.id);
                              setFormData({ ...formData, permissions: perms });
                            }}
                            className="mt-1 rounded border-indigo-500/30 bg-slate-900"
                          />
                          <div>
                            <p className="text-sm font-medium text-white">{perm.name}</p>
                            <p className="text-xs text-zinc-400">{perm.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Environments</label>
                    <div className="flex gap-3">
                      {environmentsList.map((env) => (
                        <label
                          key={env.id}
                          className={cn(
                            'flex-1 p-3 rounded-lg border text-center cursor-pointer transition-colors',
                            formData.environments.includes(env.id)
                              ? 'border-indigo-500 bg-indigo-500/10'
                              : 'border-indigo-500/20 hover:border-indigo-500/30'
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={formData.environments.includes(env.id)}
                            onChange={(e) => {
                              const envs = e.target.checked
                                ? [...formData.environments, env.id]
                                : formData.environments.filter(e => e !== env.id);
                              setFormData({ ...formData, environments: envs });
                            }}
                            className="hidden"
                          />
                          <span className="text-sm text-white">{env.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {!editingKey && (
                    <div>
                      <label className="text-sm text-zinc-400 mb-1 block">Expires In</label>
                      <select
                        value={formData.expiresIn}
                        onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                      >
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                        <option value="180">180 days</option>
                        <option value="365">1 year</option>
                        <option value="0">Never expires</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-zinc-400 mb-1 block">Description (optional)</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="What's this key for?"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                    >
                      {editingKey ? 'Update' : 'Create'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingKey(null);
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

      {/* Documentation */}
      <Card className="bg-slate-900/50 border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            API Key Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800/30 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">Use Environment-Specific Keys</h4>
              <p className="text-xs text-zinc-400">
                Create separate keys for development, staging, and production environments to limit blast radius.
              </p>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">Set Expiration Dates</h4>
              <p className="text-xs text-zinc-400">
                Regular key rotation reduces the risk of compromised credentials.
              </p>
            </div>
            <div className="p-4 bg-slate-800/30 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">Limit Permissions</h4>
              <p className="text-xs text-zinc-400">
                Grant only the minimum permissions necessary for each key's purpose.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}