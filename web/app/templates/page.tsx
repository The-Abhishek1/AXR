// app/templates/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  GitBranch, 
  Shield, 
  Database,
  Search,
  Plus,
  Star,
  Cloud,
  TestTube
} from 'lucide-react';
import { cn } from '@/lib/utils';

const templates = [
  {
    id: 'ci-cd',
    name: 'CI/CD Pipeline',
    description: 'Complete CI/CD pipeline with build, test, and deploy stages',
    icon: GitBranch,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    steps: ['git.clone', 'build', 'test.run', 'deploy.service'],
    popularity: 234,
  },
  {
    id: 'security-scan',
    name: 'Security Scan',
    description: 'Automated security scanning with SAST, DAST, and dependency checks',
    icon: Shield,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    steps: ['git.clone', 'sast.scan', 'dast.scan', 'dependency.check'],
    popularity: 156,
  },
  {
    id: 'data-pipeline',
    name: 'Data Pipeline',
    description: 'ETL pipeline for data processing and analysis',
    icon: Database,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    steps: ['extract.data', 'transform.data', 'load.data', 'validate.data'],
    popularity: 89,
  },
  {
    id: 'cloud-deploy',
    name: 'Cloud Deployment',
    description: 'Multi-cloud deployment workflow with rollback capabilities',
    icon: Cloud,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    steps: ['build.image', 'push.registry', 'deploy.k8s', 'health.check'],
    popularity: 67,
  },
  {
    id: 'test-suite',
    name: 'Test Suite',
    description: 'Comprehensive testing pipeline with parallel execution',
    icon: TestTube,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    steps: ['unit.test', 'integration.test', 'e2e.test', 'performance.test'],
    popularity: 45,
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const useTemplate = (templateId: string) => {
    // Create new process from template
    router.push(`/workflows/new?template=${templateId}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Templates
          </h1>
          <p className="text-zinc-400 mt-2">Start quickly with pre-built workflows</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-800"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => {
          const Icon = template.icon;
          
          return (
            <Card key={template.id} className="group hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn('p-3 rounded-xl', template.bgColor)}>
                    <Icon className={cn('w-6 h-6', template.color)} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {template.popularity}
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-1 text-white">{template.name}</h3>
                <p className="text-sm text-zinc-400 mb-4">{template.description}</p>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {template.steps.map((step, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded">
                        {step}
                      </span>
                    ))}
                  </div>

                  <Button 
                    className="w-full mt-4 border-zinc-700 hover:bg-zinc-800 hover:text-white" 
                    variant="outline"
                    onClick={() => useTemplate(template.id)}
                  >
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400">No templates found</p>
        </div>
      )}
    </div>
  );
}