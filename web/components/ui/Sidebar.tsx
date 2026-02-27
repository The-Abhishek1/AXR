// components/ui/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Workflow,
  Users,
  Timer,
  Activity,
  ChevronLeft,
  ChevronRight,
  Server,
  Sparkles,
  Menu,
  X,
  Zap,
  FileJson,
  BarChart3,
  Settings

} from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeProcesses, setActiveProcesses] = useState(0);

  // Fetch active processes count
  useEffect(() => {
    const fetchActiveCount = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/processes');
        const running = res.data.processes.filter((p: any) => p.state === 'RUNNING').length;
        setActiveProcesses(running);
      } catch (error) {
        console.error('Failed to fetch active processes');
      }
    };

    fetchActiveCount();
    const interval = setInterval(fetchActiveCount, 5000);
    return () => clearInterval(interval);
  }, []);

  // components/ui/Sidebar.tsx - Add new navigation items

  const mainNavItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      count: null,
    },
    {
      name: 'Workflows',
      href: '/workflows',
      icon: Workflow,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      count: activeProcesses,
    },
    {
      name: 'Agents',
      href: '/agents',
      icon: Users,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      count: null,
    },
    {
      name: 'Templates',
      href: '/templates',
      icon: FileJson,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      count: null,
    },
    {
      name: 'Analytics',
      href: '/analytics/costs',
      icon: BarChart3,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      count: null,
      children: [
        { name: 'Costs', href: '/analytics/costs' },
        { name: 'Performance', href: '/analytics/performance' },
        { name: 'Agents', href: '/agents/analytics' },
      ],
    },
    {
      name: 'Monitoring',
      href: '/monitoring',
      icon: Activity,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      count: null,
      children: [
        { name: 'Timeline', href: '/monitoring/timeline' },
        { name: 'Metrics', href: '/monitoring/metrics' },
        { name: 'Alerts', href: '/monitoring/alerts' },
      ],
    },
        {
      name: 'Timeline',
      href: '/monitoring/timeline',
      icon: Activity,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      count: null,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      color: 'text-zinc-400',
      bgColor: 'bg-zinc-500/10',
      count: null,
      children: [
        { name: 'Webhooks', href: '/settings/webhooks' },
        { name: 'API Keys', href: '/settings/api-keys' },
        { name: 'Team', href: '/settings/team' },
      ],
    },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-900 border border-zinc-800"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 80 : 260,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex h-full bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border-r border-zinc-800 flex-col relative z-30"
      >
        {/* Logo Area - Improved */}
        <div className={cn(
          'flex items-center h-20 px-4 border-b border-zinc-800',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          {!collapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              {/* Logo Icon */}
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              
              {/* Logo Text */}
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                    AXR
                  </span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">
                    BETA
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 tracking-wider">
                  Autonomous Execution
                </span>
              </div>
            </motion.div>
          ) : (
            /* Collapsed Logo */
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            </div>
          )}

          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
          <div className="px-3 space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer',
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                        : 'hover:bg-zinc-800/50',
                      collapsed && 'justify-center px-2'
                    )}
                  >
                    <div className={cn(
                      'p-2 rounded-lg transition-all duration-200',
                      isActive 
                        ? item.bgColor 
                        : 'bg-zinc-800/50 group-hover:bg-zinc-800'
                    )}>
                      <Icon className={cn(
                        'w-4 h-4',
                        isActive ? item.color : 'text-zinc-400'
                      )} />
                    </div>
                    
                    {!collapsed && (
                      <>
                        <span className={cn(
                          'flex-1 text-sm font-medium',
                          isActive ? 'text-white' : 'text-zinc-400'
                        )}>
                          {item.name}
                        </span>
                        {item.count !== null && item.count > 0 && (
                          <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                            {item.count}
                          </span>
                        )}
                      </>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Section - System Status */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 border-t border-zinc-800"
          >
            <div className="relative">
              {/* Status Card */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 p-4 border border-zinc-700/50">
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5" />
                
                <div className="relative flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Server className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-3 h-3">
                      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                      <span className="absolute inset-0 rounded-full bg-emerald-500" />
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-zinc-400">System Status</p>
                    <p className="text-sm font-semibold text-emerald-400">Operational</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">All systems healthy</p>
                  </div>
                </div>

                {/* Mini Stats */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-zinc-900/50 rounded-lg p-2">
                    <p className="text-zinc-500">Uptime</p>
                    <p className="text-emerald-400 font-medium">99.9%</p>
                  </div>
                  <div className="bg-zinc-900/50 rounded-lg p-2">
                    <p className="text-zinc-500">Latency</p>
                    <p className="text-blue-400 font-medium">24ms</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Collapsed Bottom */}
        {collapsed && (
          <div className="p-4 border-t border-zinc-800">
            <div className="relative flex justify-center">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Server className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="absolute -top-1 -right-1 w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                  <span className="absolute inset-0 rounded-full bg-emerald-500" />
                </span>
              </div>
            </div>
          </div>
        )}
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:hidden fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-zinc-900 to-zinc-950 border-r border-zinc-800 z-50 shadow-2xl"
          >
            {/* Mobile Logo */}
            <div className="flex items-center h-20 px-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                    AXR
                  </span>
                  <span className="text-[10px] text-zinc-500">Autonomous Execution</span>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 py-6 overflow-y-auto">
              <div className="px-3 space-y-1">
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                      <div className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer',
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30'
                          : 'hover:bg-zinc-800/50'
                      )}>
                        <div className={cn(
                          'p-2 rounded-lg',
                          isActive ? item.bgColor : 'bg-zinc-800'
                        )}>
                          <Icon className={cn('w-4 h-4', isActive ? item.color : 'text-zinc-400')} />
                        </div>
                        <span className={cn(
                          'flex-1 text-sm font-medium',
                          isActive ? 'text-white' : 'text-zinc-400'
                        )}>
                          {item.name}
                        </span>
                        {item.count !== null && item.count > 0 && (
                          <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full">
                            {item.count}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile Status */}
            <div className="p-4 border-t border-zinc-800">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Server className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-zinc-400">System Status</p>
                  <p className="text-sm font-medium text-emerald-400">Operational</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}