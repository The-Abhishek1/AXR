// app/settings/webhooks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Webhook, 
  Plus, 
  Trash2, 
  TestTube,
  Copy,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { getWebhooks, createWebhook, deleteWebhook, testWebhook } from '@/lib/api';
import toast from 'react-hot-toast';

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: ['process.started', 'process.completed', 'step.failed'],
    active: true,
  });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    const data = await getWebhooks();
    setWebhooks(data);
  };

  const handleCreateWebhook = async () => {
    try {
      await createWebhook(newWebhook);
      toast.success('Webhook created successfully');
      setShowForm(false);
      fetchWebhooks();
    } catch (error) {
      toast.error('Failed to create webhook');
    }
  };

  const handleTestWebhook = async (id: string) => {
    try {
      const result = await testWebhook(id);
      toast.success(result.success ? 'Webhook test successful' : 'Webhook test failed');
    } catch (error) {
      toast.error('Webhook test failed');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-zinc-400 mt-2">Configure outgoing webhooks for events</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Webhook
        </Button>
      </div>

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.map((webhook: any) => (
          <Card key={webhook.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Webhook className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold">{webhook.url}</h3>
                      {webhook.active ? (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs bg-zinc-500/20 text-zinc-400 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {webhook.events.map((event: string) => (
                        <span key={event} className="text-xs bg-zinc-800 px-2 py-1 rounded">
                          {event}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-400">
                      Created {new Date(webhook.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleTestWebhook(webhook.id)}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Test
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(webhook.url);
                      toast.success('URL copied to clipboard');
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => deleteWebhook(webhook.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Webhook Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Webhook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-zinc-400">URL</label>
                <Input
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                  placeholder="https://example.com/webhook"
                />
              </div>
              
              <div>
                <label className="text-sm text-zinc-400">Events</label>
                <div className="space-y-2 mt-2">
                  {['process.started', 'process.completed', 'step.started', 'step.completed', 'step.failed'].map((event) => (
                    <label key={event} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newWebhook.events.includes(event)}
                        onChange={(e) => {
                          const events = e.target.checked
                            ? [...newWebhook.events, event]
                            : newWebhook.events.filter((e) => e !== event);
                          setNewWebhook({ ...newWebhook, events });
                        }}
                        className="rounded border-zinc-700 bg-zinc-900"
                      />
                      {event}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm text-zinc-400">Active</label>
                <Switch
                  checked={newWebhook.active}
                  onCheckedChange={(checked) => setNewWebhook({ ...newWebhook, active: checked })}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button className="flex-1" onClick={handleCreateWebhook}>
                  Create
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}