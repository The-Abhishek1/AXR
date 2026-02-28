// app/settings/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Moon,
  Sun,
  Globe,
  Clock,
  Bell,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  Tablet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState({
    organizationName: 'AXR Labs',
    adminEmail: 'admin@axr.io',
    timezone: 'UTC',
    language: 'en',
    theme: 'dark',
    autoRefresh: true,
    compactMode: false,
    animations: true,
    telemetry: true,
    emailNotifications: true,
    desktopNotifications: false,
    slackIntegration: false,
  });

  const [showApiWarning, setShowApiWarning] = useState(false);

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold gradient-text-primary">General Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">Manage your organization preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-indigo-500/20">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Organization Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Organization Name</label>
                  <Input
                    value={settings.organizationName}
                    onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
                    className="bg-slate-900 border-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Admin Email</label>
                  <Input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                    className="bg-slate-900 border-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Regional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Date Format</label>
                  <select className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-zinc-400 mb-1 block">Time Format</label>
                  <select className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm">
                    <option>12-hour (AM/PM)</option>
                    <option>24-hour</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-1 block">First Day of Week</label>
                <select className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm">
                  <option>Sunday</option>
                  <option>Monday</option>
                  <option>Saturday</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Theme Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-3 block">Color Scheme</label>
                <div className="grid grid-cols-3 gap-3">
                  {['dark', 'light', 'system'].map((theme) => (
                    <button
                      key={theme}
                      onClick={() => setSettings({ ...settings, theme })}
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2',
                        settings.theme === theme
                          ? 'border-indigo-500 bg-indigo-500/10'
                          : 'border-indigo-500/20 hover:border-indigo-500/30'
                      )}
                    >
                      {theme === 'dark' && <Moon className="w-6 h-6 text-indigo-400" />}
                      {theme === 'light' && <Sun className="w-6 h-6 text-indigo-400" />}
                      {theme === 'system' && <Smartphone className="w-6 h-6 text-indigo-400" />}
                      <span className="text-sm capitalize">{theme}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Auto-refresh Dashboard</p>
                    <p className="text-xs text-zinc-400">Automatically refresh data every 5 seconds</p>
                  </div>
                  <Switch
                    checked={settings.autoRefresh}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoRefresh: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Compact Mode</p>
                    <p className="text-xs text-zinc-400">Show more items with reduced spacing</p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => setSettings({ ...settings, compactMode: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Enable Animations</p>
                    <p className="text-xs text-zinc-400">Smooth transitions and effects</p>
                  </div>
                  <Switch
                    checked={settings.animations}
                    onCheckedChange={(checked) => setSettings({ ...settings, animations: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Layout Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Default View</label>
                  <div className="flex gap-3">
                    {['Grid', 'List', 'Compact'].map((view) => (
                      <button
                        key={view}
                        className="px-4 py-2 rounded-lg border border-indigo-500/20 hover:border-indigo-500/30 text-sm"
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Items Per Page</label>
                  <select className="px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                    <option>100</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Email Notifications</p>
                  <p className="text-xs text-zinc-400">Receive updates via email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Desktop Notifications</p>
                  <p className="text-xs text-zinc-400">Show browser notifications</p>
                </div>
                <Switch
                  checked={settings.desktopNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, desktopNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Slack Integration</p>
                  <p className="text-xs text-zinc-400">Send alerts to Slack channel</p>
                </div>
                <Switch
                  checked={settings.slackIntegration}
                  onCheckedChange={(checked) => setSettings({ ...settings, slackIntegration: checked })}
                />
              </div>

              <div className="pt-4 border-t border-indigo-500/20">
                <label className="text-sm text-zinc-400 mb-2 block">Notify when</label>
                <div className="space-y-2">
                  {['Task completes', 'Task fails', 'New agent registered', 'Budget threshold reached'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-indigo-500/30 bg-slate-900" />
                      <span className="text-sm text-white">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card className="bg-slate-900/50 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-white">Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">Telemetry</p>
                  <p className="text-xs text-zinc-400">Send anonymous usage data</p>
                </div>
                <Switch
                  checked={settings.telemetry}
                  onCheckedChange={(checked) => setSettings({ ...settings, telemetry: checked })}
                />
              </div>

              <div className="pt-4 border-t border-indigo-500/20">
                <label className="text-sm text-zinc-400 mb-2 block">API Rate Limiting</label>
                <select className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm">
                  <option>100 requests per minute</option>
                  <option>500 requests per minute</option>
                  <option>1000 requests per minute</option>
                  <option>Unlimited</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Log Retention</label>
                <select className="w-full px-3 py-2 bg-slate-900 border border-indigo-500/20 rounded-lg text-sm">
                  <option>7 days</option>
                  <option>30 days</option>
                  <option>90 days</option>
                  <option>1 year</option>
                </select>
              </div>

              <div className="pt-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    if (confirm('Are you sure? This action cannot be undone.')) {
                      toast.success('System reset initiated');
                    }
                  }}
                >
                  Reset All Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-gradient-to-r from-indigo-500 to-purple-500"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}