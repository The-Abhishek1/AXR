'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface ProcessSelectorProps {
  onSelect: (pid: string) => void;
  selectedPid?: string;
  className?: string;
}

export default function ProcessSelector({ onSelect, selectedPid, className }: ProcessSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [processes, setProcesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProcesses = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://127.0.0.1:8000/processes');
        setProcesses(res.data.processes);
      } catch (error) {
        console.error('Failed to fetch processes');
      } finally {
        setLoading(false);
      }
    };

    fetchProcesses();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProcesses = processes.filter(p =>
    p.pid.toLowerCase().includes(search.toLowerCase()) ||
    p.state.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProcess = processes.find(p => p.pid === selectedPid);

  const getStatusColor = (status: string) => {
    const colors = {
      RUNNING: 'bg-blue-500',
      TERMINATED: 'bg-emerald-500',
      FAILED: 'bg-red-500',
      PENDING: 'bg-yellow-500',
      PAUSED: 'bg-orange-500',
    };
    return colors[status as keyof typeof colors] || 'bg-zinc-500';
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
      >
        {selectedProcess ? (
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', getStatusColor(selectedProcess.state))} />
            <span className="font-mono text-sm">{selectedProcess.pid.slice(0, 8)}...</span>
            <span className="text-xs text-zinc-400">({selectedProcess.state})</span>
          </div>
        ) : (
          <span className="text-zinc-400">Select a process...</span>
        )}
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50"
          >
            {/* Search */}
            <div className="p-2 border-b border-zinc-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search processes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>

            {/* Process List */}
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
              {loading ? (
                <div className="p-4 text-center text-zinc-400">Loading...</div>
              ) : filteredProcesses.length > 0 ? (
                filteredProcesses.map((process) => (
                  <button
                    key={process.pid}
                    onClick={() => {
                      onSelect(process.pid);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 transition-colors"
                  >
                    <div className={cn('w-2 h-2 rounded-full', getStatusColor(process.state))} />
                    <span className="font-mono text-sm flex-1 text-left">{process.pid}</span>
                    <span className="text-xs text-zinc-400">{process.state}</span>
                    {selectedPid === process.pid && (
                      <Check className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-zinc-400">No processes found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}