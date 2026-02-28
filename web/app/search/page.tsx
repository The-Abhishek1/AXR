// app/search/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  Clock,
  Star,
  StarOff,
  History,
  TrendingUp,
  Activity,
  Workflow,
  Users,
  Server,
  FileJson,
  Settings,
  Zap,
  Brain,
  Cpu,
  Database,
  Globe,
  Shield,
  Bell,
  Calendar,
  Tag,
  Bookmark,
  Share2,
  Download,
  Copy,
  ExternalLink,
  MoreVertical,
  Loader2,
  AlertCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Mock search data
const mockSearchResults = {
  workflows: [
    {
      id: 'wf-123',
      type: 'workflow',
      title: 'Production Deployment',
      description: 'Deploy application to production environment',
      status: 'running',
      priority: 'high',
      tags: ['deployment', 'production', 'critical'],
      lastUpdated: '2024-01-20T15:30:00Z',
      matches: ['deployment', 'production'],
      score: 0.95,
    },
    {
      id: 'wf-456',
      type: 'workflow',
      title: 'Security Scan Pipeline',
      description: 'Automated security scanning for all commits',
      status: 'completed',
      priority: 'medium',
      tags: ['security', 'scanning', 'ci/cd'],
      lastUpdated: '2024-01-19T10:15:00Z',
      matches: ['security', 'scan'],
      score: 0.87,
    },
    {
      id: 'wf-789',
      type: 'workflow',
      title: 'Data Processing Job',
      description: 'ETL pipeline for daily data processing',
      status: 'failed',
      priority: 'low',
      tags: ['data', 'etl', 'batch'],
      lastUpdated: '2024-01-18T23:45:00Z',
      matches: ['data', 'process'],
      score: 0.76,
    },
  ],
  agents: [
    {
      id: 'agent-1',
      type: 'agent',
      name: 'DevSecOps Agent',
      description: 'AI agent for security and deployment tasks',
      model: 'gpt-4o',
      status: 'idle',
      capabilities: ['security', 'deployment', 'monitoring'],
      lastActive: '2024-01-20T15:45:00Z',
      matches: ['security', 'deploy'],
      score: 0.92,
    },
    {
      id: 'agent-2',
      type: 'agent',
      name: 'Data Pipeline Agent',
      description: 'Specialized in data processing and ETL',
      model: 'gpt-4o-mini',
      status: 'busy',
      capabilities: ['etl', 'data', 'analytics'],
      lastActive: '2024-01-20T14:30:00Z',
      matches: ['data', 'pipeline'],
      score: 0.88,
    },
    {
      id: 'agent-3',
      type: 'agent',
      name: 'Infrastructure Agent',
      description: 'Manages cloud resources and infrastructure',
      model: 'claude-3',
      status: 'idle',
      capabilities: ['terraform', 'kubernetes', 'cloud'],
      lastActive: '2024-01-20T13:15:00Z',
      matches: ['infra', 'cloud'],
      score: 0.84,
    },
  ],
  workers: [
    {
      id: 'worker-1',
      type: 'worker',
      name: 'worker-1.prod.axr.io',
      description: 'Production worker node',
      status: 'active',
      load: 45,
      capacity: 100,
      tools: ['git.clone', 'sast.scan', 'deploy.service'],
      lastSeen: '2024-01-20T15:48:00Z',
      matches: ['worker', 'prod'],
      score: 0.79,
    },
    {
      id: 'worker-2',
      type: 'worker',
      name: 'worker-2.staging.axr.io',
      description: 'Staging environment worker',
      status: 'active',
      load: 78,
      capacity: 100,
      tools: ['git.clone', 'lint', 'test.run'],
      lastSeen: '2024-01-20T15:47:00Z',
      matches: ['worker', 'stage'],
      score: 0.73,
    },
  ],
  tasks: [
    {
      id: 'task-123',
      type: 'task',
      title: 'Deploy v2.3.0 to production',
      description: 'Rolling update of production services',
      status: 'running',
      priority: 'high',
      assignedTo: 'agent-1',
      createdAt: '2024-01-20T14:00:00Z',
      matches: ['deploy', 'production'],
      score: 0.91,
    },
    {
      id: 'task-456',
      type: 'task',
      title: 'Security scan of dependencies',
      description: 'Check for vulnerabilities in package.json',
      status: 'completed',
      priority: 'medium',
      assignedTo: 'agent-2',
      createdAt: '2024-01-20T10:30:00Z',
      matches: ['security', 'scan'],
      score: 0.82,
    },
  ],
  templates: [
    {
      id: 'template-1',
      type: 'template',
      title: 'CI/CD Pipeline Template',
      description: 'Complete CI/CD workflow template',
      category: 'ci/cd',
      usageCount: 234,
      rating: 4.8,
      tags: ['ci/cd', 'deployment', 'automation'],
      matches: ['ci/cd', 'pipeline'],
      score: 0.86,
    },
    {
      id: 'template-2',
      type: 'template',
      title: 'Security Scanning Template',
      description: 'Comprehensive security workflow',
      category: 'security',
      usageCount: 156,
      rating: 4.9,
      tags: ['security', 'scanning', 'compliance'],
      matches: ['security', 'scan'],
      score: 0.94,
    },
  ],
};

// Mock saved searches
const mockSavedSearches = [
  {
    id: 'saved-1',
    name: 'Failed Workflows',
    query: 'status:failed',
    filters: { type: 'workflow', status: 'failed' },
    lastUsed: '2024-01-20T09:30:00Z',
    count: 12,
  },
  {
    id: 'saved-2',
    name: 'Security Related',
    query: 'security OR scan OR vulnerability',
    filters: { tags: ['security'] },
    lastUsed: '2024-01-19T14:15:00Z',
    count: 34,
  },
  {
    id: 'saved-3',
    name: 'High Priority Tasks',
    query: 'priority:high',
    filters: { type: 'task', priority: 'high' },
    lastUsed: '2024-01-18T11:45:00Z',
    count: 8,
  },
];

// Mock search history
const mockSearchHistory = [
  { query: 'deployment failed', timestamp: '2024-01-20T15:30:00Z', results: 23 },
  { query: 'security scan', timestamp: '2024-01-20T14:15:00Z', results: 45 },
  { query: 'agent status', timestamp: '2024-01-20T13:45:00Z', results: 12 },
  { query: 'production workflow', timestamp: '2024-01-20T11:30:00Z', results: 34 },
  { query: 'budget alert', timestamp: '2024-01-20T09:15:00Z', results: 5 },
];

// Mock search suggestions
const mockSuggestions = [
  'deployment workflow',
  'security scan',
  'agent status',
  'failed tasks',
  'budget report',
  'worker load',
  'template ci/cd',
  'vulnerability scan',
];

const searchTypes = [
  { id: 'all', name: 'All', icon: Search },
  { id: 'workflows', name: 'Workflows', icon: Workflow },
  { id: 'agents', name: 'Agents', icon: Brain },
  { id: 'workers', name: 'Workers', icon: Server },
  { id: 'tasks', name: 'Tasks', icon: Zap },
  { id: 'templates', name: 'Templates', icon: FileJson },
];

const sortOptions = [
  { id: 'relevance', name: 'Relevance' },
  { id: 'recent', name: 'Most Recent' },
  { id: 'popular', name: 'Most Popular' },
  { id: 'alphabetical', name: 'Alphabetical' },
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [savedSearches, setSavedSearches] = useState(mockSavedSearches);
  const [searchHistory, setSearchHistory] = useState(mockSearchHistory);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    status: [] as string[],
    tags: [] as string[],
    priority: [] as string[],
  });

  // Simulate search
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.trim()) {
        performSearch();
      } else {
        setResults(null);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, selectedType, filters, sortBy]);

  const performSearch = useCallback(() => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Filter results based on type
      let filtered: any = {};
      
      if (selectedType === 'all' || selectedType === 'workflows') {
        filtered.workflows = mockSearchResults.workflows;
      }
      if (selectedType === 'all' || selectedType === 'agents') {
        filtered.agents = mockSearchResults.agents;
      }
      if (selectedType === 'all' || selectedType === 'workers') {
        filtered.workers = mockSearchResults.workers;
      }
      if (selectedType === 'all' || selectedType === 'tasks') {
        filtered.tasks = mockSearchResults.tasks;
      }
      if (selectedType === 'all' || selectedType === 'templates') {
        filtered.templates = mockSearchResults.templates;
      }

      setResults(filtered);
      setLoading(false);

      // Add to search history
      if (query.trim()) {
        setSearchHistory(prev => [
          { query, timestamp: new Date().toISOString(), results: Object.values(filtered).flat().length },
          ...prev.slice(0, 9)
        ]);
      }
    }, 500);
  }, [query, selectedType]);

  const handleSaveSearch = () => {
    const name = prompt('Enter a name for this search:');
    if (!name) return;

    const newSaved = {
      id: `saved-${Date.now()}`,
      name,
      query,
      filters: { type: selectedType, ...filters },
      lastUsed: new Date().toISOString(),
      count: Object.values(results || {}).flat().length,
    };

    setSavedSearches(prev => [newSaved, ...prev]);
    toast.success('Search saved');
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
    toast.success(favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites');
  };

  const getResultIcon = (type: string) => {
    switch(type) {
      case 'workflow': return Workflow;
      case 'agent': return Brain;
      case 'worker': return Server;
      case 'task': return Zap;
      case 'template': return FileJson;
      default: return Search;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'running': return 'text-blue-400 bg-blue-500/10';
      case 'completed': return 'text-emerald-400 bg-emerald-500/10';
      case 'failed': return 'text-rose-400 bg-rose-500/10';
      case 'idle': return 'text-zinc-400 bg-zinc-500/10';
      case 'busy': return 'text-amber-400 bg-amber-500/10';
      case 'active': return 'text-emerald-400 bg-emerald-500/10';
      default: return 'text-zinc-400 bg-zinc-500/10';
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
    <div className="min-h-screen bg-slate-950">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400/50" />
              <Input
                type="text"
                placeholder="Search workflows, agents, workers, tasks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-24 py-3 bg-slate-900/50 border-indigo-500/20 text-lg focus:ring-2 focus:ring-indigo-500/50"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-20 top-1/2 transform -translate-y-1/2 p-1 hover:bg-indigo-500/10 rounded"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              )}
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-indigo-500/30 bg-indigo-500/10 px-2 font-mono text-xs text-indigo-400">
                  ⌘K
                </kbd>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'border',
                showFilters ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' : 'border-zinc-700'
              )}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-zinc-700">
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-900 border-indigo-500/20 w-64">
                <DropdownMenuLabel>Recent Searches</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {searchHistory.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => setQuery(item.query)}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{item.query}</span>
                    <span className="text-xs text-zinc-500">{item.results} results</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4"
              >
                <div className="p-4 bg-slate-900/30 rounded-lg border border-indigo-500/20">
                  <div className="grid lg:grid-cols-4 gap-4">
                    {/* Type Filter */}
                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">Type</label>
                      <div className="space-y-2">
                        {searchTypes.map((type) => (
                          <label key={type.id} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="type"
                              value={type.id}
                              checked={selectedType === type.id}
                              onChange={(e) => setSelectedType(e.target.value)}
                              className="rounded-full border-indigo-500/30 bg-slate-900"
                            />
                            <type.icon className="w-4 h-4 text-indigo-400" />
                            <span className="text-sm text-white">{type.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">Status</label>
                      <div className="space-y-2">
                        {['running', 'completed', 'failed', 'pending'].map((status) => (
                          <label key={status} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={filters.status.includes(status)}
                              onChange={(e) => {
                                const newStatus = e.target.checked
                                  ? [...filters.status, status]
                                  : filters.status.filter(s => s !== status);
                                setFilters({ ...filters, status: newStatus });
                              }}
                              className="rounded border-indigo-500/30 bg-slate-900"
                            />
                            <span className="text-sm capitalize text-white">{status}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Priority Filter */}
                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">Priority</label>
                      <div className="space-y-2">
                        {['high', 'medium', 'low'].map((priority) => (
                          <label key={priority} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={filters.priority.includes(priority)}
                              onChange={(e) => {
                                const newPriority = e.target.checked
                                  ? [...filters.priority, priority]
                                  : filters.priority.filter(p => p !== priority);
                                setFilters({ ...filters, priority: newPriority });
                              }}
                              className="rounded border-indigo-500/30 bg-slate-900"
                            />
                            <span className="text-sm capitalize text-white">{priority}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="text-sm text-zinc-400 mb-2 block">Date Range</label>
                      <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm"
                      >
                        <option value="all">All time</option>
                        <option value="today">Today</option>
                        <option value="week">This week</option>
                        <option value="month">This month</option>
                        <option value="year">This year</option>
                      </select>
                    </div>
                  </div>

                  {/* Advanced Filters Toggle */}
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm text-indigo-400 mt-4"
                  >
                    <ChevronDown className={cn('w-4 h-4 transition-transform', showAdvanced && 'rotate-180')} />
                    Advanced Filters
                  </button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-indigo-500/20">
                          <div>
                            <label className="text-sm text-zinc-400 mb-2 block">Tags</label>
                            <Input
                              placeholder="Enter tags (comma separated)"
                              className="bg-slate-900 border-indigo-500/20"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-zinc-400 mb-2 block">Created By</label>
                            <Input
                              placeholder="User email or ID"
                              className="bg-slate-900 border-indigo-500/20"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-zinc-400 mb-2 block">Custom Query</label>
                            <Input
                              placeholder="Lucene query syntax"
                              className="bg-slate-900 border-indigo-500/20 font-mono"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Stats */}
          {query && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <div className="flex items-center gap-4">
                <span className="text-zinc-400">
                  Found {Object.values(results || {}).flat().length} results
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">in {(0.3).toFixed(2)}s</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2 py-1 bg-slate-900 border border-indigo-500/20 rounded text-xs"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleSaveSearch}
                  className="p-1.5 rounded hover:bg-indigo-500/10"
                  title="Save search"
                >
                  <Bookmark className="w-4 h-4 text-indigo-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {!query ? (
          // Empty State - Suggestions & History
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Saved Searches */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-indigo-400" />
                  Saved Searches
                </h3>
                <div className="space-y-3">
                  {savedSearches.map((saved) => (
                    <div
                      key={saved.id}
                      className="flex items-center justify-between p-2 hover:bg-slate-800/30 rounded-lg cursor-pointer"
                      onClick={() => setQuery(saved.query)}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{saved.name}</p>
                        <p className="text-xs text-zinc-400">{saved.count} results</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Searches */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  Recent Searches
                </h3>
                <div className="space-y-3">
                  {searchHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-slate-800/30 rounded-lg cursor-pointer"
                      onClick={() => setQuery(item.query)}
                    >
                      <div>
                        <p className="text-sm text-white">{item.query}</p>
                        <p className="text-xs text-zinc-400">
                          {format(new Date(item.timestamp), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Searches */}
            <Card className="bg-slate-900/50 border-indigo-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Popular Searches
                </h3>
                <div className="space-y-3">
                  {mockSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 hover:bg-slate-800/30 rounded-lg cursor-pointer"
                      onClick={() => setQuery(suggestion)}
                    >
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span className="text-sm text-white">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : loading ? (
          // Loading State
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
        ) : (
          // Search Results
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Results by Type */}
            {Object.entries(results || {}).map(([type, items]: [string, any]) => (
              <div key={type}>
                <h2 className="text-lg font-semibold text-white mb-3 capitalize">
                  {type} ({items.length})
                </h2>
                <div className="space-y-3">
                  {items.map((item: any, index: number) => {
                    const Icon = getResultIcon(item.type);

                    return (
                      <motion.div key={item.id} variants={item}>
                        <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              {/* Type Icon */}
                              <div className="p-2 rounded-lg bg-indigo-500/10">
                                <Icon className="w-5 h-5 text-indigo-400" />
                              </div>

                              {/* Content */}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="font-medium text-white">
                                    {item.title || item.name}
                                  </h3>
                                  {item.status && (
                                    <Badge className={getStatusColor(item.status)}>
                                      {item.status}
                                    </Badge>
                                  )}
                                  {item.priority && (
                                    <Badge className={getPriorityColor(item.priority)}>
                                      {item.priority}
                                    </Badge>
                                  )}
                                </div>

                                <p className="text-sm text-zinc-300 mb-2">
                                  {item.description}
                                </p>

                                {/* Tags */}
                                {item.tags && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {item.tags.map((tag: string) => (
                                      <Badge key={tag} variant="outline" className="border-indigo-500/30">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Type-specific details */}
                                {item.type === 'workflow' && (
                                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                                    <span>ID: {item.id}</span>
                                    <span>•</span>
                                    <span>Updated: {format(new Date(item.lastUpdated), 'MMM d, h:mm a')}</span>
                                  </div>
                                )}

                                {item.type === 'agent' && (
                                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                                    <span>Model: {item.model}</span>
                                    <span>•</span>
                                    <span>Capabilities: {item.capabilities.join(', ')}</span>
                                  </div>
                                )}

                                {item.type === 'worker' && (
                                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                                    <span>Load: {item.load}%</span>
                                    <span>•</span>
                                    <span>Tools: {item.tools.length}</span>
                                    <span>•</span>
                                    <span>Last seen: {format(new Date(item.lastSeen), 'HH:mm:ss')}</span>
                                  </div>
                                )}

                                {/* Match highlights */}
                                {item.matches && (
                                  <div className="mt-2 flex items-center gap-1 text-xs">
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                    <span className="text-amber-400">Matched:</span>
                                    {item.matches.map((match: string, i: number) => (
                                      <Badge key={i} variant="outline" className="border-amber-500/30 text-amber-400">
                                        {match}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleFavorite(item.id)}
                                  className="p-2 rounded-lg hover:bg-indigo-500/10"
                                >
                                  {favorites.includes(item.id) ? (
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  ) : (
                                    <StarOff className="w-4 h-4 text-zinc-400" />
                                  )}
                                </button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button className="p-2 rounded-lg hover:bg-indigo-500/10">
                                      <MoreVertical className="w-4 h-4 text-zinc-400" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="bg-slate-900 border-indigo-500/20">
                                    <DropdownMenuItem>
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Copy className="w-4 h-4 mr-2" />
                                      Copy ID
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Share2 className="w-4 h-4 mr-2" />
                                      Share
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
                </div>
              </div>
            ))}

            {/* No Results */}
            {Object.values(results || {}).flat().length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No results found for "{query}"</p>
                <p className="text-sm text-zinc-600 mt-2">Try adjusting your filters or search terms</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}