// components/graph/StepNode.tsx
'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { motion } from 'framer-motion';
import { theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export default function StepNode({ data }: NodeProps) {
  const color = theme.statusColors[data.status as keyof typeof theme.statusColors] || theme.colors.muted;
  const isRunning = data.status === 'RUNNING';
  const isSuccess = data.status === 'SUCCESS';
  const isFailed = data.status === 'FAILED';

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={cn(
              'px-4 py-3 rounded-xl text-white text-sm shadow-xl backdrop-blur-sm border border-white/10',
              'transition-all duration-300 cursor-pointer',
              isRunning && 'animate-pulse ring-2 ring-blue-400/50',
              isSuccess && 'hover:shadow-emerald-500/25',
              isFailed && 'hover:shadow-red-500/25'
            )}
            style={{ 
              backgroundColor: color,
              boxShadow: `0 8px 32px ${color}33`
            }}
          >
            <Handle 
              type="target" 
              position={Position.Top} 
              className="w-3 h-3 bg-white border-2 border-zinc-900" 
              style={{ backgroundColor: color }}
            />
            <div className="font-semibold tracking-wide">{data.label}</div>
            <div className="text-xs opacity-90 mt-1 flex items-center gap-1">
              <span className={cn(
                'w-1.5 h-1.5 rounded-full',
                isRunning ? 'bg-white animate-ping' : 'bg-white/50'
              )} />
              {data.status}
            </div>
            <Handle 
              type="source" 
              position={Position.Bottom} 
              className="w-3 h-3 bg-white border-2 border-zinc-900"
              style={{ backgroundColor: color }}
            />
          </motion.div>
        </Tooltip.Trigger>

        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-zinc-900/95 backdrop-blur-sm text-xs px-3 py-2 rounded-lg shadow-xl border border-zinc-700 text-white z-50"
            sideOffset={5}
          >
            <div className="font-medium">{data.label}</div>
            <div className="text-zinc-400 mt-1">Status: {data.status}</div>
            <Tooltip.Arrow className="fill-zinc-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}