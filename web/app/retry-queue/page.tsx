'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Timer, RotateCcw, AlertCircle, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface RetryItem {
  step_id: string;
  process_id: string;
  syscall: string;
  retry_count: number;
  max_retries: number;
  next_retry: string;
  error: string;
  status: 'pending' | 'retrying' | 'failed' | 'success';
}

export default function RetryQueuePage() {
  const [retries, setRetries] = useState<RetryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRetryQueue();
    const interval = setInterval(fetchRetryQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchRetryQueue = async () => {
    try {
      // This would be your actual endpoint
      const res = await axios.get('http://127.0.0.1:8000/retry-queue');
      setRetries(res.data.retries || []);
    } catch (error) {
      console.error('Failed to fetch retry queue');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryNow = async (stepId: string) => {
    try {
      await axios.post('http://127.0.0.1:8000/step/retry', { step_id: stepId });
      toast.success('Step queued for retry');
      fetchRetryQueue();
    } catch (error) {
      toast.error('Failed to retry step');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Timer className="w-4 h-4 text-yellow-400" />;
      case 'retrying':
        return <RotateCcw className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-zinc-400" />;
    }
  };

  const filteredRetries = retries.filter(r => 
    filter === 'all' || r.status === filter
  );

  const stats = {
    pending: retries.filter(r => r.status === 'pending').length,
    retrying: retries.filter(r => r.status === 'retrying').length,
    failed: retries.filter(r => r.status === 'failed').length,
    total: retries.length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
          Retry Queue
        </h1>
        <p className="text-zinc-400 mt-1">Monitor and manage failed step retries</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-yellow-500/20">
                <Timer className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-zinc-400">Pending Retries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/20">
                <RotateCcw className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.retrying}</p>
                <p className="text-xs text-zinc-400">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500/20">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.failed}</p>
                <p className="text-xs text-zinc-400">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-500/20">
                <AlertCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-zinc-400">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'pending', 'retrying', 'failed', 'success'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1 rounded-lg text-sm capitalize transition-colors',
              filter === f
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Retry Queue List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredRetries.map((item, idx) => (
            <motion.div
              key={item.step_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-lg hover:shadow-yellow-500/5 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className={cn(
                      'p-2 rounded-full',
                      item.status === 'pending' && 'bg-yellow-500/20',
                      item.status === 'retrying' && 'bg-blue-500/20',
                      item.status === 'success' && 'bg-emerald-500/20',
                      item.status === 'failed' && 'bg-red-500/20',
                    )}>
                      {getStatusIcon(item.status)}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Link 
                              href={`/workflows/${item.process_id}`}
                              className="font-mono text-sm hover:text-yellow-400 transition-colors"
                            >
                              {item.process_id.slice(0, 8)}...{item.process_id.slice(-4)}
                            </Link>
                            <Badge variant="outline" className="text-xs">
                              {item.syscall}
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">{item.error}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-xs text-zinc-400">
                              Retry {item.retry_count}/{item.max_retries}
                            </p>
                            {item.next_retry && (
                              <p className="text-xs text-zinc-500">
                                Next: {formatDistanceToNow(new Date(item.next_retry), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRetryNow(item.step_id)}
                            disabled={item.status === 'retrying'}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-zinc-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredRetries.length === 0 && (
          <div className="text-center py-12">
            <Timer className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">No items in retry queue</p>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}