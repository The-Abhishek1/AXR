'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, PlayCircle } from 'lucide-react';

interface TimelineItemData {
  id: string;
  processId: string;
  name: string;
  startTime: number;
  endTime: number;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING';
  duration: number;
}

interface TimelineProps {
  data: TimelineItemData[];
}

export function Timeline({ data }: TimelineProps) {
  // Find the earliest start time and latest end time for scaling
  const times = data.flatMap(d => [d.startTime, d.endTime]).filter(t => t > 0);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const totalDuration = maxTime - minTime;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'RUNNING':
        return <PlayCircle className="w-4 h-4 text-blue-400 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-emerald-500';
      case 'FAILED':
        return 'bg-red-500';
      case 'RUNNING':
        return 'bg-blue-500';
      default:
        return 'bg-zinc-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
        <span>Start</span>
        <span>Timeline</span>
        <span>End</span>
      </div>

      {/* Timeline Items */}
      <div className="space-y-3">
        {data.map((item, index) => {
          const startPercent = ((item.startTime - minTime) / totalDuration) * 100;
          const durationPercent = (item.duration / totalDuration) * 100;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <div className="flex items-center gap-3 mb-1">
                {getStatusIcon(item.status)}
                <span className="text-sm font-medium text-white">{item.name}</span>
                <span className="text-xs text-zinc-400 ml-auto">
                  {item.duration ? `${(item.duration / 1000).toFixed(2)}s` : 'in progress'}
                </span>
              </div>
              
              {/* Timeline Bar */}
              <div className="relative h-8 w-full bg-zinc-800/50 rounded-lg overflow-hidden">
                <div
                  className="absolute top-0 h-full bg-zinc-800"
                  style={{ left: `${startPercent}%`, width: `${durationPercent}%` }}
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${durationPercent}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    'absolute top-0 h-full rounded-lg',
                    getStatusColor(item.status)
                  )}
                  style={{ left: `${startPercent}%` }}
                />
              </div>
              
              {/* Time Labels */}
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>{new Date(item.startTime).toLocaleTimeString()}</span>
                {item.endTime > 0 && (
                  <span>{new Date(item.endTime).toLocaleTimeString()}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          No timeline data available
        </div>
      )}
    </div>
  );
}

export interface TimelineItemProps {
  item: TimelineItemData;
}

export function TimelineItem({ item }: TimelineItemProps) {
  return (
    <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm text-white">{item.name}</span>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full',
          item.status === 'SUCCESS' && 'bg-emerald-500/20 text-emerald-400',
          item.status === 'FAILED' && 'bg-red-500/20 text-red-400',
          item.status === 'RUNNING' && 'bg-blue-500/20 text-blue-400'
        )}>
          {item.status}
        </span>
      </div>
      <div className="flex justify-between text-xs text-zinc-400">
        <span>Process: {item.processId.slice(0, 8)}...</span>
        <span>{item.duration ? `${(item.duration / 1000).toFixed(1)}s` : 'Running'}</span>
      </div>
    </div>
  );
}