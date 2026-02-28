// app/templates/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileJson,
  Search,
  Filter,
  Plus,
  Star,
  GitBranch,
  Shield,
  Database,
  Cloud,
  TestTube,
  Rocket,
  Cpu,
  Zap,
  Clock,
  Users,
  Download,
  Copy,
  Trash2,
  Edit,
  Play,
  ChevronDown,
  Grid3x3,
  List,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// Mock templates data
const templates = [
  {
    id: 'ci-cd',
    name: 'CI/CD Pipeline',
    description: 'Complete CI/CD pipeline with build, test, and deploy stages',
    icon: GitBranch,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    steps: ['git.clone', 'build', 'test.run', 'deploy.service'],
    category: 'ci-cd',
    tags: ['automation', 'deployment', 'testing'],
    popularity: 1234,
    usageCount: 456,
    author: 'AXR Team',
    createdAt: '2024-01-15',
    rating: 4.8,
  },
  {
    id: 'security-scan',
    name: 'Security Scan',
    description: 'Automated security scanning with SAST, DAST, and dependency checks',
    icon: Shield,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    steps: ['git.clone', 'sast.scan', 'dast.scan', 'dependency.check'],
    category: 'security',
    tags: ['security', 'scanning', 'compliance'],
    popularity: 892,
    usageCount: 234,
    author: 'Security Team',
    createdAt: '2024-01-10',
    rating: 4.9,
  },
  {
    id: 'data-pipeline',
    name: 'Data Pipeline',
    description: 'ETL pipeline for data processing and analysis',
    icon: Database,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    steps: ['extract.data', 'transform.data', 'load.data', 'validate.data'],
    category: 'data',
    tags: ['etl', 'data', 'analytics'],
    popularity: 567,
    usageCount: 123,
    author: 'Data Team',
    createdAt: '2024-01-05',
    rating: 4.6,
  },
  {
    id: 'cloud-deploy',
    name: 'Cloud Deployment',
    description: 'Multi-cloud deployment workflow with rollback capabilities',
    icon: Cloud,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    steps: ['build.image', 'push.registry', 'deploy.k8s', 'health.check'],
    category: 'deployment',
    tags: ['cloud', 'kubernetes', 'docker'],
    popularity: 723,
    usageCount: 189,
    author: 'Cloud Team',
    createdAt: '2024-01-12',
    rating: 4.7,
  },
  {
    id: 'test-suite',
    name: 'Test Suite',
    description: 'Comprehensive testing pipeline with parallel execution',
    icon: TestTube,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    steps: ['unit.test', 'integration.test', 'e2e.test', 'performance.test'],
    category: 'testing',
    tags: ['testing', 'quality', 'automation'],
    popularity: 445,
    usageCount: 98,
    author: 'QA Team',
    createdAt: '2024-01-08',
    rating: 4.5,
  },
  {
    id: 'ml-training',
    name: 'ML Training Pipeline',
    description: 'Machine learning model training and evaluation pipeline',
    icon: Cpu,
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    steps: ['load.data', 'preprocess', 'train.model', 'evaluate', 'deploy.model'],
    category: 'ml',
    tags: ['machine-learning', 'ai', 'training'],
    popularity: 334,
    usageCount: 67,
    author: 'ML Team',
    createdAt: '2024-01-03',
    rating: 4.8,
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure as Code',
    description: 'Terraform workflow for infrastructure provisioning',
    icon: Cloud,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    steps: ['terraform.init', 'terraform.plan', 'terraform.apply', 'terraform.destroy'],
    category: 'infrastructure',
    tags: ['terraform', 'iac', 'cloud'],
    popularity: 289,
    usageCount: 56,
    author: 'Platform Team',
    createdAt: '2024-01-18',
    rating: 4.4,
  },
  {
    id: 'monitoring',
    name: 'Monitoring Setup',
    description: 'Set up monitoring and alerting with Prometheus and Grafana',
    icon: TrendingUp,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    steps: ['deploy.prometheus', 'deploy.grafana', 'configure.alerts', 'test.metrics'],
    category: 'monitoring',
    tags: ['monitoring', 'observability', 'alerting'],
    popularity: 178,
    usageCount: 34,
    author: 'SRE Team',
    createdAt: '2024-01-20',
    rating: 4.3,
  },
];

const categories = [
  { id: 'all', name: 'All Templates', icon: FileJson },
  { id: 'ci-cd', name: 'CI/CD', icon: GitBranch },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'data', name: 'Data', icon: Database },
  { id: 'deployment', name: 'Deployment', icon: Cloud },
  { id: 'testing', name: 'Testing', icon: TestTube },
  { id: 'ml', name: 'ML/AI', icon: Cpu },
  { id: 'infrastructure', name: 'Infrastructure', icon: Cloud },
  { id: 'monitoring', name: 'Monitoring', icon: TrendingUp },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'newest'>('popularity');
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredTemplates = templates
    .filter((t) => {
      const matchesSearch = 
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some(tag => tag.includes(search.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'popularity') return b.popularity - a.popularity;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
    toast.success(favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites');
  };

  const useTemplate = (templateId: string) => {
    router.push(`/tasks/new?template=${templateId}`);
    toast.success('Template applied');
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
            <span className="gradient-text-primary">Templates</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm lg:text-base">
            Start quickly with pre-built workflow templates
          </p>
        </div>

        <Button
          onClick={() => router.push('/templates/new')}
          className="bg-gradient-to-r from-indigo-500 to-purple-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </motion.div>

      {/* Categories */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-wrap gap-2"
      >
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'px-4 py-2 rounded-lg flex items-center gap-2 transition-all',
                isActive
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-slate-900/50 text-zinc-400 hover:text-indigo-400 border border-indigo-500/20'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{category.name}</span>
              {isActive && (
                <span className="ml-2 text-xs bg-indigo-500/30 px-1.5 py-0.5 rounded-full">
                  {filteredTemplates.length}
                </span>
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={item} className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
          <Input
            type="text"
            placeholder="Search templates by name, description, or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-900/50 border-indigo-500/20 focus:border-indigo-500/40"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          <option value="popularity">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest First</option>
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
      </motion.div>

      {/* Results Count */}
      <motion.div variants={item} className="text-sm text-zinc-400">
        Showing {filteredTemplates.length} of {templates.length} templates
      </motion.div>

      {/* Templates Grid/List */}
      {viewMode === 'grid' ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            const isFavorite = favorites.includes(template.id);

            return (
              <motion.div key={template.id} variants={item}>
                <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-all group h-full">
                  <CardContent className="p-5">
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-indigo-500/10 transition-colors"
                    >
                      <Star
                        className={cn(
                          'w-4 h-4',
                          isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-400'
                        )}
                      />
                    </button>

                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className={cn('p-2 rounded-lg', template.bgColor)}>
                        <Icon className={cn('w-5 h-5', template.color)} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-white group-hover:text-indigo-400 transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1">{template.author}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-zinc-300 mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Steps Preview */}
                    <div className="mb-4">
                      <p className="text-xs text-zinc-400 mb-2">Steps</p>
                      <div className="flex flex-wrap gap-1">
                        {template.steps.slice(0, 3).map((step, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-slate-800/50">
                            {step}
                          </Badge>
                        ))}
                        {template.steps.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-slate-800/50">
                            +{template.steps.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Footer Stats */}
                    <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-indigo-500/20 pt-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        <span>{template.usageCount} uses</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{template.rating}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => useTemplate(template.id)}
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Use
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/templates/${template.id}`)}
                        className="flex-1 border-indigo-500/30 text-indigo-400"
                      >
                        Details
                      </Button>
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
          {filteredTemplates.map((template) => {
            const Icon = template.icon;
            const isFavorite = favorites.includes(template.id);

            return (
              <motion.div key={template.id} variants={item}>
                <Card className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-all group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn('p-2 rounded-lg', template.bgColor)}>
                        <Icon className={cn('w-5 h-5', template.color)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium text-white group-hover:text-indigo-400 transition-colors">
                            {template.name}
                          </h3>
                          <Badge variant="outline" className="border-indigo-500/30">
                            {template.category}
                          </Badge>
                          <span className="text-xs text-zinc-400">by {template.author}</span>
                        </div>

                        <p className="text-sm text-zinc-300 mb-2">{template.description}</p>

                        <div className="flex items-center gap-4">
                          <div className="flex flex-wrap gap-1">
                            {template.steps.map((step, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {step}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {template.usageCount} uses
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {template.rating}
                          </div>
                          <div className="flex gap-1">
                            {template.tags.map((tag) => (
                              <span key={tag} className="text-indigo-400">#{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFavorite(template.id)}
                          className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
                        >
                          <Star
                            className={cn(
                              'w-4 h-4',
                              isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-400'
                            )}
                          />
                        </button>
                        <Button
                          size="sm"
                          onClick={() => useTemplate(template.id)}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Use
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/templates/${template.id}`)}
                          className="border-indigo-500/30 text-indigo-400"
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}