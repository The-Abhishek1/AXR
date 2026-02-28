// components/ui/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Workflow,
  Brain,
  Server,
  Zap,
  BarChart3,
  Activity,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Users,
  FileJson,
  Clock,
  AlertCircle,
  Webhook,
  Key,
  Shield,
  Bell,
  Palette,
  Globe,
  Database,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeProcesses, setActiveProcesses] = useState(0);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

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

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(m => m !== menuName)
        : [...prev, menuName]
    );
  };

  // Main navigation items
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
      name: 'AI Agents',
      href: '/agents',
      icon: Brain,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      count: null,
    },
    {
      name: 'Workers',
      href: '/workers',
      icon: Server,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      count: null,
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      count: null,
    },
    {
      name: 'Templates',
      href: '/templates',
      icon: FileJson,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      count: null,
    },
  ];

  // Analytics submenu
  const analyticsItems = [
    { name: 'Overview', href: '/analytics', icon: BarChart3 },
    { name: 'Performance', href: '/analytics/performance', icon: Activity },
    { name: 'Costs', href: '/analytics/costs', icon: Database },
    { name: 'Agents', href: '/analytics/agents', icon: Brain },
    { name: 'Workers', href: '/analytics/workers', icon: Cpu },
    { name: 'Reports', href: '/analytics/reports', icon: FileJson },
  ];

  // Monitoring submenu
  const monitoringItems = [
    { name: 'Overview', href: '/monitoring', icon: Activity },
    { name: 'Alerts', href: '/monitoring/alerts', icon: AlertCircle },
    { name: 'Events', href: '/monitoring/events', icon: Zap },
    { name: 'Metrics', href: '/monitoring/metrics', icon: BarChart3 },
    { name: 'Timeline', href: '/monitoring/timeline', icon: Clock },
  ];

  // Settings submenu
  const settingsItems = [
    { name: 'General', href: '/settings', icon: Settings },
    { name: 'Appearance', href: '/settings/appearance', icon: Palette },
    { name: 'Integrations', href: '/settings/integrations', icon: Globe },
    { name: 'Data', href: '/settings/data', icon: Database },
    { name: 'Webhooks', href: '/settings/webhooks', icon: Webhook },
    { name: 'API Keys', href: '/settings/api-keys', icon: Key },
    { name: 'Team', href: '/settings/team', icon: Users },
    { name: 'Policies', href: '/settings/policies', icon: Shield },
    { name: 'Notifications', href: '/settings/notifications', icon: Bell },
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl border border-indigo-500/30 shadow-lg"
      >
        {mobileOpen ? (
          <X className="w-5 h-5 text-indigo-400" />
        ) : (
          <Menu className="w-5 h-5 text-indigo-400" />
        )}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: collapsed ? 88 : 250,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:block h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-indigo-500/20 relative z-30 shadow-2xl shadow-indigo-500/5"
      >
        <div className="flex flex-col h-full">
          {/* Logo Area - More spacing */}
          <div className={cn(
            'flex items-center py-8 px-4 border-b border-indigo-500/20',
            collapsed ? 'justify-center' : 'justify-between'
          )}>
            {!collapsed ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-glow">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                </div>
                <div>
                  <span className="text-xl font-bold gradient-text-primary">AXR</span>
                  <span className="text-[10px] text-indigo-400/60 block -mt-1">Autonomous Runtime</span>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </div>
            )}
            
            {/* Collapse Button */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 text-indigo-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-indigo-400" />
              )}
            </button>
          </div>

          {/* Navigation - Scrollable with proper spacing */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-500/20 py-6">
            <div className="px-3 space-y-1">
              {/* Main Navigation */}
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer group',
                        collapsed ? 'justify-center' : 'justify-start',
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                          : 'hover:bg-indigo-500/10 hover:border hover:border-indigo-500/20'
                      )}
                    >
                      <div className={cn(
                        'p-2 rounded-lg transition-all',
                        isActive ? 'bg-indigo-500/20' : 'bg-slate-800/50 group-hover:bg-indigo-500/10'
                      )}>
                        <Icon className={cn('w-4 h-4', item.color)} />
                      </div>
                      
                      {!collapsed && (
                        <>
                          <span className={cn(
                            'flex-1 text-sm font-medium',
                            isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'
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
                    </div>
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="my-4 border-t border-indigo-500/20" />

              {/* Analytics Section */}
              {!collapsed && (
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Analytics</p>
                </div>
              )}
              
              {analyticsItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                        collapsed ? 'justify-center' : 'justify-start',
                        isActive
                          ? 'bg-indigo-500/10 border border-indigo-500/20'
                          : 'hover:bg-indigo-500/5'
                      )}
                    >
                      <Icon className={cn(
                        'w-4 h-4',
                        isActive ? 'text-indigo-400' : 'text-zinc-400'
                      )} />
                      
                      {!collapsed && (
                        <span className={cn(
                          'text-sm',
                          isActive ? 'text-white' : 'text-zinc-400'
                        )}>
                          {item.name}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="my-4 border-t border-indigo-500/20" />

              {/* Monitoring Section */}
              {!collapsed && (
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Monitoring</p>
                </div>
              )}
              
              {monitoringItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                        collapsed ? 'justify-center' : 'justify-start',
                        isActive
                          ? 'bg-indigo-500/10 border border-indigo-500/20'
                          : 'hover:bg-indigo-500/5'
                      )}
                    >
                      <Icon className={cn(
                        'w-4 h-4',
                        isActive ? 'text-indigo-400' : 'text-zinc-400'
                      )} />
                      
                      {!collapsed && (
                        <span className={cn(
                          'text-sm',
                          isActive ? 'text-white' : 'text-zinc-400'
                        )}>
                          {item.name}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="my-4 border-t border-indigo-500/20" />

              {/* Settings Section */}
              {!collapsed && (
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Settings</p>
                </div>
              )}
              
              {settingsItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                        collapsed ? 'justify-center' : 'justify-start',
                        isActive
                          ? 'bg-indigo-500/10 border border-indigo-500/20'
                          : 'hover:bg-indigo-500/5'
                      )}
                    >
                      <Icon className={cn(
                        'w-4 h-4',
                        isActive ? 'text-indigo-400' : 'text-zinc-400'
                      )} />
                      
                      {!collapsed && (
                        <span className={cn(
                          'text-sm',
                          isActive ? 'text-white' : 'text-zinc-400'
                        )}>
                          {item.name}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* System Status - With proper spacing */}
          {!collapsed && (
            <div className="p-4 border-t border-indigo-500/20">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-indigo-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Cpu className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-400">System Status</p>
                    <p className="text-sm font-semibold gradient-text-primary">Operational</p>
                    <p className="text-[10px] text-zinc-500 mt-1">99.9% uptime</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:hidden fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-slate-950 to-slate-900 border-r border-indigo-500/20 z-50 shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Logo */}
              <div className="flex items-center justify-between p-6 border-b border-indigo-500/20">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xl font-bold gradient-text-primary">AXR</span>
                    <span className="text-[10px] text-indigo-400/60 block">Autonomous Runtime</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-indigo-500/10"
                >
                  <X className="w-5 h-5 text-indigo-400" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6">
                  {/* Main */}
                  <div>
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider px-3 mb-2">Main</p>
                    {mainNavItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link key={item.href} href={item.href}>
                          <div
                            className={cn(
                              'flex items-center gap-3 px-3 py-3 rounded-xl transition-all',
                              isActive
                                ? 'bg-indigo-500/20 border border-indigo-500/30'
                                : 'hover:bg-indigo-500/10'
                            )}
                          >
                            <Icon className={cn('w-4 h-4', item.color)} />
                            <span className="flex-1 text-sm font-medium text-white">{item.name}</span>
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

                  {/* Analytics */}
                  <div>
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider px-3 mb-2">Analytics</p>
                    {analyticsItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link key={item.href} href={item.href}>
                          <div
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                              isActive
                                ? 'bg-indigo-500/10 border border-indigo-500/20'
                                : 'hover:bg-indigo-500/5'
                            )}
                          >
                            <Icon className={cn('w-4 h-4', isActive ? 'text-indigo-400' : 'text-zinc-400')} />
                            <span className={cn('text-sm', isActive ? 'text-white' : 'text-zinc-400')}>
                              {item.name}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Monitoring */}
                  <div>
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider px-3 mb-2">Monitoring</p>
                    {monitoringItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link key={item.href} href={item.href}>
                          <div
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                              isActive
                                ? 'bg-indigo-500/10 border border-indigo-500/20'
                                : 'hover:bg-indigo-500/5'
                            )}
                          >
                            <Icon className={cn('w-4 h-4', isActive ? 'text-indigo-400' : 'text-zinc-400')} />
                            <span className={cn('text-sm', isActive ? 'text-white' : 'text-zinc-400')}>
                              {item.name}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Settings */}
                  <div>
                    <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider px-3 mb-2">Settings</p>
                    {settingsItems.slice(0, 5).map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;
                      return (
                        <Link key={item.href} href={item.href}>
                          <div
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                              isActive
                                ? 'bg-indigo-500/10 border border-indigo-500/20'
                                : 'hover:bg-indigo-500/5'
                            )}
                          >
                            <Icon className={cn('w-4 h-4', isActive ? 'text-indigo-400' : 'text-zinc-400')} />
                            <span className={cn('text-sm', isActive ? 'text-white' : 'text-zinc-400')}>
                              {item.name}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Mobile Status */}
              <div className="p-4 border-t border-indigo-500/20">
                <div className="bg-slate-800/30 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">System Status</p>
                      <p className="text-sm font-medium text-emerald-400">Operational</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}