// app/settings/integrations/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Github,
  Gitlab,
  Slack,
  MessageSquare,
  Kanban,
  Trello,
  CheckSquare,
  Users,
  Video,
  Mail,
  Chrome,
  Monitor,
  Cloud,
  Server,
  HardDrive,
  Container,
  Box,
  GitBranch,
  Workflow,
  Link2,
  Unlink,
  Check,
  X,
  AlertCircle,
  Settings,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Briefcase,
  Code,
  Cpu,
  Globe,
  Lock,
  Key
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

// Mock integrations data
const mockIntegrations = {
  communication: [
    {
      id: 'slack',
      name: 'Slack',
      description: 'Send notifications and alerts to Slack channels',
      icon: Slack,
      color: 'text-[#4A154B]',
      bgColor: 'bg-[#4A154B]/10',
      connected: true,
      config: {
        workspace: 'axr.slack.com',
        channel: '#alerts',
        webhookUrl: 'https://hooks.slack.com/...',
      },
      features: ['Notifications', 'Alerts', 'Reports'],
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Integrate with Discord for real-time updates',
      icon: MessageSquare,
      color: 'text-[#5865F2]',
      bgColor: 'bg-[#5865F2]/10',
      connected: false,
      features: ['Notifications', 'Webhooks'],
    },
    {
      id: 'teams',
      name: 'Microsoft Teams',
      description: 'Connect with Teams for collaboration',
      icon: Users,
      color: 'text-[#464EB8]',
      bgColor: 'bg-[#464EB8]/10',
      connected: false,
      features: ['Notifications', 'Meetings'],
    },
    {
      id: 'zoom',
      name: 'Zoom',
      description: 'Schedule and join meetings directly',
      icon: Video,
      color: 'text-[#2D8CFF]',
      bgColor: 'bg-[#2D8CFF]/10',
      connected: false,
      features: ['Meetings', 'Recording'],
    },
  ],
  projectManagement: [
    {
      id: 'jira',
      name: 'Jira',
      description: 'Sync issues and track progress',
      icon: Briefcase,
      color: 'text-[#0052CC]',
      bgColor: 'bg-[#0052CC]/10',
      connected: true,
      config: {
        project: 'AXR',
        url: 'https://axr.atlassian.net',
      },
      features: ['Issues', 'Workflows', 'Reports'],
    },
    {
      id: 'trello',
      name: 'Trello',
      description: 'Manage boards and cards',
      icon: Trello,
      color: 'text-[#0079BF]',
      bgColor: 'bg-[#0079BF]/10',
      connected: false,
      features: ['Boards', 'Cards', 'Automation'],
    },
    {
      id: 'asana',
      name: 'Asana',
      description: 'Track tasks and projects',
      icon: CheckSquare,
      color: 'text-[#F06A6A]',
      bgColor: 'bg-[#F06A6A]/10',
      connected: false,
      features: ['Tasks', 'Projects', 'Timeline'],
    },
  ],
  versionControl: [
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connect repositories and automate workflows',
      icon: Github,
      color: 'text-[#181717]',
      bgColor: 'bg-[#181717]/10',
      connected: true,
      config: {
        organization: 'axr',
        repos: 12,
        webhooks: true,
      },
      features: ['Repositories', 'Actions', 'Webhooks'],
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      description: 'Integrate with GitLab CI/CD',
      icon: Gitlab,
      color: 'text-[#FC6D26]',
      bgColor: 'bg-[#FC6D26]/10',
      connected: false,
      features: ['Repositories', 'CI/CD', 'Registry'],
    },
  ],
  ciCd: [
    {
      id: 'jenkins',
      name: 'Jenkins',
      description: 'Trigger and monitor Jenkins jobs',
      icon: Workflow,
      color: 'text-[#D24939]',
      bgColor: 'bg-[#D24939]/10',
      connected: false,
      features: ['Jobs', 'Builds', 'Pipelines'],
    },
    {
      id: 'circleci',
      name: 'CircleCI',
      description: 'Automate your CI/CD pipelines',
      icon: GitBranch,
      color: 'text-[#343434]',
      bgColor: 'bg-[#343434]/10',
      connected: false,
      features: ['Pipelines', 'Workflows', 'Artifacts'],
    },
    {
      id: 'github-actions',
      name: 'GitHub Actions',
      description: 'Run workflows on GitHub',
      icon: Github,
      color: 'text-[#2088FF]',
      bgColor: 'bg-[#2088FF]/10',
      connected: true,
      config: {
        workflows: 8,
        runs: 234,
      },
      features: ['Workflows', 'Runners', 'Secrets'],
    },
  ],
  cloud: [
    {
      id: 'aws',
      name: 'AWS',
      description: 'Deploy and manage AWS resources',
      icon: Cloud,
      color: 'text-[#FF9900]',
      bgColor: 'bg-[#FF9900]/10',
      connected: true,
      config: {
        region: 'us-east-1',
        services: ['EC2', 'S3', 'Lambda'],
      },
      features: ['Compute', 'Storage', 'Serverless'],
    },
    {
      id: 'azure',
      name: 'Azure',
      description: 'Microsoft Azure integration',
      icon: Server,
      color: 'text-[#0078D4]',
      bgColor: 'bg-[#0078D4]/10',
      connected: false,
      features: ['Compute', 'Storage', 'AI'],
    },
    {
      id: 'gcp',
      name: 'Google Cloud',
      description: 'Google Cloud Platform services',
      icon: Globe,
      color: 'text-[#4285F4]',
      bgColor: 'bg-[#4285F4]/10',
      connected: false,
      features: ['Compute', 'Storage', 'ML'],
    },
  ],
  container: [
    {
      id: 'docker',
      name: 'Docker',
      description: 'Build and manage containers',
      icon: Container,
      color: 'text-[#2496ED]',
      bgColor: 'bg-[#2496ED]/10',
      connected: true,
      config: {
        registry: 'docker.io/axr',
        images: 24,
      },
      features: ['Images', 'Containers', 'Registry'],
    },
    {
      id: 'kubernetes',
      name: 'Kubernetes',
      description: 'Orchestrate containers',
      icon: Box,
      color: 'text-[#326CE5]',
      bgColor: 'bg-[#326CE5]/10',
      connected: false,
      features: ['Pods', 'Services', 'Deployments'],
    },
  ],
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(mockIntegrations);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  const categories = [
    { id: 'all', name: 'All Integrations' },
    { id: 'communication', name: 'Communication' },
    { id: 'projectManagement', name: 'Project Management' },
    { id: 'versionControl', name: 'Version Control' },
    { id: 'ciCd', name: 'CI/CD' },
    { id: 'cloud', name: 'Cloud' },
    { id: 'container', name: 'Container' },
  ];

  const handleConnect = (integration: any) => {
    // In a real app, this would open OAuth flow
    toast.success(`Connecting to ${integration.name}...`);
  };

  const handleDisconnect = (integration: any) => {
    if (confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
      toast.success(`Disconnected from ${integration.name}`);
    }
  };

  const handleConfigure = (integration: any) => {
    toast.success(`Configuring ${integration.name}`);
  };

  const filteredIntegrations = () => {
    let allIntegrations: any[] = [];
    
    if (selectedCategory === 'all') {
      Object.values(integrations).forEach(category => {
        allIntegrations = [...allIntegrations, ...category];
      });
    } else {
      allIntegrations = integrations[selectedCategory as keyof typeof integrations] || [];
    }

    if (search) {
      return allIntegrations.filter(i => 
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    return allIntegrations;
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold gradient-text-primary">Integrations</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Connect your favorite tools and services
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm transition-all',
              selectedCategory === category.id
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-slate-900/50 text-zinc-400 hover:text-indigo-400 border border-indigo-500/20'
            )}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search integrations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-4 bg-slate-900/50 border-indigo-500/20"
        />
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredIntegrations().map((integration) => {
          const Icon = integration.icon;

          return (
            <Card key={integration.id} className="bg-slate-900/50 border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', integration.bgColor)}>
                      <Icon className={cn('w-6 h-6', integration.color)} />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{integration.name}</h3>
                      <p className="text-xs text-zinc-400 mt-1">{integration.description}</p>
                    </div>
                  </div>
                  <Badge variant={integration.connected ? 'success' : 'secondary'}>
                    {integration.connected ? 'Connected' : 'Available'}
                  </Badge>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {integration.features.map((feature: string) => (
                    <Badge key={feature} variant="outline" className="border-indigo-500/30">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Connected Info */}
                {integration.connected && integration.config && (
                  <div className="mb-4 p-3 bg-slate-800/30 rounded-lg space-y-1">
                    {Object.entries(integration.config).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-zinc-400 capitalize">{key}:</span>
                        <span className="text-white">{value as string}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {integration.connected ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleConfigure(integration)}
                        className="flex-1 border-indigo-500/30 text-indigo-400"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDisconnect(integration)}
                        className="flex-1 border-rose-500/30 text-rose-400"
                      >
                        <Unlink className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => handleConnect(integration)}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    >
                      <Link2 className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}