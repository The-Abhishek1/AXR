// app/templates/[templateId]/page.tsx
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  FileJson,
  Star,
  Users,
  Clock,
  Tag,
  GitBranch,
  Play,
  Edit,
  Copy,
  Trash2,
  Download,
  Share2,
  Code,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Award,
  TrendingUp,
  Calendar,
  User,
  MessageSquare,
  ThumbsUp,
  Flag,
  XCircle, Shield, Database, Cloud
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// 1. You need an array of all available templates to "find" from
const templates = [
  { 
    id: 'security-scan', 
    name: 'Security Scan', 
    icon: Shield, // Make sure Shield is imported from lucide-react
    description: 'Scan for vulnerabilities' 
  },
  { 
    id: 'data-pipeline', 
    name: 'Data Pipeline', 
    icon: Database, // Make sure Database is imported
    description: 'ETL processing' 
  },
  { 
    id: 'cloud-deploy', 
    name: 'Cloud Deploy', 
    icon: Cloud, // Make sure Cloud is imported
    description: 'AWS/GCP Deployment' 
  }
];

// Mock template data
const templateData = {
  id: 'ci-cd',
  name: 'CI/CD Pipeline',
  description: 'Complete CI/CD pipeline with build, test, and deploy stages',
  longDescription: `This comprehensive CI/CD pipeline template automates your entire software delivery process. 
    It includes source code checkout, building, testing, and deployment stages with built-in best practices 
    for security and reliability. The pipeline is designed to work with any Git repository and supports 
    multiple deployment targets including Kubernetes, serverless, and traditional VMs.`,
  icon: GitBranch,
  color: 'text-blue-400',
  bgColor: 'bg-blue-500/10',
  steps: [
    { id: 1, name: 'git.clone', description: 'Clone repository from Git', order: 1, timeout: 60 },
    { id: 2, name: 'build', description: 'Build application artifacts', order: 2, timeout: 300 },
    { id: 3, name: 'test.run', description: 'Run unit and integration tests', order: 3, timeout: 180 },
    { id: 4, name: 'deploy.service', description: 'Deploy to production', order: 4, timeout: 120 },
  ],
  category: 'ci-cd',
  tags: ['automation', 'deployment', 'testing', 'ci/cd'],
  author: {
    name: 'AXR Team',
    avatar: 'https://via.placeholder.com/40',
    bio: 'Core team at AXR, building automation tools',
    templates: 12,
    joined: '2023-01-15',
  },
  stats: {
    usageCount: 1234,
    rating: 4.8,
    reviewCount: 89,
    favorites: 456,
    forks: 78,
    lastUsed: '2024-01-20T15:30:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-18T14:20:00Z',
  },
  versions: [
    { version: '2.0.0', date: '2024-01-18', changes: 'Added parallel test execution' },
    { version: '1.5.0', date: '2024-01-10', changes: 'Improved error handling' },
    { version: '1.0.0', date: '2024-01-15', changes: 'Initial release' },
  ],
  requirements: [
    'Git repository access',
    'Node.js 18+',
    'Docker',
    'Kubernetes cluster (optional)',
  ],
  variables: [
    { name: 'GIT_REPO', description: 'Repository URL', type: 'string', required: true },
    { name: 'BRANCH', description: 'Branch to deploy', type: 'string', default: 'main' },
    { name: 'DOCKER_REGISTRY', description: 'Docker registry URL', type: 'string', required: true },
  ],
  reviews: [
    {
      id: 1,
      user: 'John Doe',
      rating: 5,
      comment: 'Excellent template, saved us hours of work!',
      date: '2024-01-19',
    },
    {
      id: 2,
      user: 'Jane Smith',
      rating: 4,
      comment: 'Works great, but could use more documentation',
      date: '2024-01-17',
    },
  ],
  related: ['security-scan', 'data-pipeline', 'cloud-deploy'],
};

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.templateId as string;

  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showJson, setShowJson] = useState(false);
  const [forking, setForking] = useState(false);

  const Icon = templateData.icon;

  const handleUse = () => {
    router.push(`/tasks/new?template=${templateId}`);
    toast.success('Template applied');
  };

  const handleFork = () => {
    setForking(true);
    setTimeout(() => {
      setForking(false);
      toast.success('Template forked successfully');
    }, 1500);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Back Navigation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        <Link href="/templates" className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors">
          <ArrowLeft className="w-5 h-5 text-indigo-400" />
        </Link>
        <span className="text-zinc-400">/</span>
        <Link href="/templates" className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors">
          Templates
        </Link>
        <span className="text-zinc-400">/</span>
        <span className="text-sm text-white">{templateData.name}</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-start justify-between gap-6"
      >
        <div className="flex items-start gap-4">
          <div className={cn('p-3 rounded-xl', templateData.bgColor)}>
            <Icon className={cn('w-8 h-8', templateData.color)} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold gradient-text-primary">
                {templateData.name}
              </h1>
              <Badge variant="outline" className="border-indigo-500/30">
                v{templateData.versions[0].version}
              </Badge>
            </div>
            <p className="text-zinc-400 text-sm lg:text-base max-w-2xl">
              {templateData.description}
            </p>
            
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-white">{templateData.stats.rating}</span>
                <span className="text-xs text-zinc-400">({templateData.stats.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-white">{templateData.stats.usageCount} uses</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-sm text-white">Updated {formatDate(templateData.stats.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            <Star className={cn('w-5 h-5', isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-400')} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            <Share2 className="w-5 h-5 text-zinc-400" />
          </button>
          <button
            onClick={() => setShowJson(!showJson)}
            className="p-2 rounded-lg hover:bg-indigo-500/10 transition-colors"
          >
            {showJson ? <EyeOff className="w-5 h-5 text-zinc-400" /> : <Code className="w-5 h-5 text-zinc-400" />}
          </button>
          <Button
            onClick={handleUse}
            className="bg-gradient-to-r from-indigo-500 to-purple-500"
          >
            <Play className="w-4 h-4 mr-2" />
            Use Template
          </Button>
        </div>
      </motion.div>

      {/* JSON View */}
      {showJson && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardContent className="p-4">
              <pre className="text-xs font-mono bg-slate-950 p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(templateData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-indigo-500/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-slate-900/50 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 whitespace-pre-line">
                    {templateData.longDescription}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1">
                    {templateData.requirements.map((req, i) => (
                      <li key={i} className="text-sm text-zinc-300">{req}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {templateData.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-indigo-500/30">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="bg-slate-900/50 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Author</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
                    <div>
                      <p className="font-medium text-white">{templateData.author.name}</p>
                      <p className="text-xs text-zinc-400">{templateData.author.bio}</p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400 pt-2 border-t border-indigo-500/20">
                    <span>{templateData.author.templates} templates</span>
                    <span>Joined {formatDate(templateData.author.joined)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-indigo-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Used</span>
                      <span className="text-white">{templateData.stats.usageCount} times</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Favorited</span>
                      <span className="text-white">{templateData.stats.favorites} times</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Forks</span>
                      <span className="text-white">{templateData.stats.forks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Created</span>
                      <span className="text-white">{formatDate(templateData.stats.createdAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Last used</span>
                      <span className="text-white">{formatDate(templateData.stats.lastUsed)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="steps">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Workflow Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templateData.steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative pl-8 pb-4 border-l-2 border-indigo-500/30 last:pb-0 last:border-l-0"
                  >
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                    <div className="bg-slate-800/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">Step {step.order}: {step.name}</h4>
                        <Badge variant="outline" className="border-indigo-500/30">
                          Timeout: {step.timeout}s
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-400">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variables">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Template Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-indigo-500/20">
                      <th className="text-left py-2 text-sm font-medium text-zinc-400">Variable</th>
                      <th className="text-left py-2 text-sm font-medium text-zinc-400">Description</th>
                      <th className="text-left py-2 text-sm font-medium text-zinc-400">Type</th>
                      <th className="text-left py-2 text-sm font-medium text-zinc-400">Default</th>
                      <th className="text-left py-2 text-sm font-medium text-zinc-400">Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templateData.variables.map((variable, i) => (
                      <tr key={i} className="border-b border-indigo-500/10">
                        <td className="py-2 text-sm font-mono text-indigo-400">{variable.name}</td>
                        <td className="py-2 text-sm text-zinc-300">{variable.description}</td>
                        <td className="py-2 text-sm text-zinc-300">{variable.type}</td>
                        <td className="py-2 text-sm text-zinc-300">{variable.default || '-'}</td>
                        <td className="py-2">
                          {variable.required ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-zinc-400" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Reviews</CardTitle>
                <Button variant="outline" className="border-indigo-500/30 text-indigo-400">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Write a Review
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templateData.reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-slate-800/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
                        <span className="font-medium text-white">{review.user}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              'w-3 h-3',
                              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-600'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-300">{review.comment}</p>
                    <p className="text-xs text-zinc-500 mt-2">{formatDate(review.date)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Version History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {templateData.versions.map((version, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 bg-slate-800/30 rounded-lg">
                    <Badge variant="outline" className="border-indigo-500/30">
                      v{version.version}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm text-white">{version.changes}</p>
                      <p className="text-xs text-zinc-500 mt-1">Released on {formatDate(version.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Related Templates */}
      <Card className="bg-slate-900/50 border-indigo-500/20">
        <CardHeader>
          <CardTitle className="text-white">Related Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {templateData.related.map((id) => {
              const related = templates.find(t => t.id === id);
              if (!related) return null;
              const RelatedIcon = related.icon;
              
              return (
                <Link key={id} href={`/templates/${id}`}>
                  <div className="p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', related.bgColor)}>
                        <RelatedIcon className={cn('w-4 h-4', related.color)} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{related.name}</p>
                        <p className="text-xs text-zinc-400">{related.usageCount} uses</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}