// components/ui/Footer.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Github, 
  Twitter, 
  Heart, 
  Server, 
  Cpu, 
  Activity,
  Mail,
  Globe,
  Shield,
  ExternalLink,
  HeartPulse
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function Footer() {
  const [systemStatus, setSystemStatus] = useState({
    workers: 0,
    processes: 0,
    agents: 0,
    uptime: '99.9%'
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [processes, workers] = await Promise.all([
          api.getProcesses().catch(() => ({ count: 0 })),
          api.getWorkers().catch(() => ({ count: 0 }))
        ]);
        
        // Get agents count from somewhere
        const agentsCount = 5; // This should come from your API
        
        setSystemStatus({
          workers: workers?.count || 0,
          processes: processes?.count || 0,
          agents: agentsCount,
          uptime: '99.9%'
        });
      } catch (error) {
        console.error('Failed to fetch system status');
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-indigo-500/20 bg-gradient-to-b from-slate-950/95 to-slate-900/95 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          
          {/* Left - Brand & Copyright */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">A</span>
                </div>
                <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <span className="text-sm font-semibold gradient-text-primary">AXR</span>
            </div>
            
            <span className="text-xs text-zinc-600 hidden sm:block">|</span>
            
            <p className="text-xs text-zinc-400 flex items-center gap-1">
              © {currentYear} • Made with
              <HeartPulse className="w-3 h-3 text-rose-400 animate-pulse" />
              by AXR Labs
            </p>
          </div>

          {/* Center - System Stats */}
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-1.5 group">
              <div className="p-1 rounded-md bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                <Server className="w-3 h-3 text-indigo-400" />
              </div>
              <span className="text-xs">
                <span className="text-white font-medium">{systemStatus.workers}</span>
                <span className="text-zinc-500 hidden sm:inline"> workers</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 group">
              <div className="p-1 rounded-md bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <Cpu className="w-3 h-3 text-purple-400" />
              </div>
              <span className="text-xs">
                <span className="text-white font-medium">{systemStatus.agents}</span>
                <span className="text-zinc-500 hidden sm:inline"> agents</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 group">
              <div className="p-1 rounded-md bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                <Activity className="w-3 h-3 text-emerald-400" />
              </div>
              <span className="text-xs">
                <span className="text-white font-medium">{systemStatus.processes}</span>
                <span className="text-zinc-500 hidden sm:inline"> processes</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 group">
              <div className="p-1 rounded-md bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                <Shield className="w-3 h-3 text-amber-400" />
              </div>
              <span className="text-xs">
                <span className="text-white font-medium">{systemStatus.uptime}</span>
                <span className="text-zinc-500 hidden sm:inline"> uptime</span>
              </span>
            </div>
          </div>

          {/* Right - Social Links */}
          <div className="flex items-center gap-3">
            <Link 
              href="https://github.com" 
              target="_blank" 
              className="p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors group"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            </Link>
            
            <Link 
              href="https://twitter.com" 
              target="_blank" 
              className="p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors group"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            </Link>
            
            <Link 
              href="mailto:contact@axr.io" 
              className="p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors group"
              aria-label="Email"
            >
              <Mail className="w-4 h-4 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            </Link>
            
            <Link 
              href="https://axr.io" 
              target="_blank" 
              className="p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors group"
              aria-label="Website"
            >
              <Globe className="w-4 h-4 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar - Optional additional info */}
        <div className="mt-2 pt-2 border-t border-indigo-500/10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-600">
          <div className="flex items-center gap-3">
            <Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy</Link>
            <span>•</span>
            <Link href="/security" className="hover:text-indigo-400 transition-colors">Security</Link>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Version 2.0.0</span>
            <span className="w-1 h-1 rounded-full bg-indigo-500/30" />
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              Live
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}