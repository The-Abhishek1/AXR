// components/ui/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Bell, 
  Search, 
  User, 
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  Menu,
  X,
  Sparkles,
  Sun,
  Moon,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications] = useState(3);
  const [fullscreen, setFullscreen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menus when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setFullscreen(false);
      }
    }
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/workflows')) return 'Workflows';
    if (pathname.startsWith('/agents')) return 'AI Agents';
    if (pathname.startsWith('/workers')) return 'Workers';
    if (pathname.startsWith('/tasks')) return 'Tasks';
    if (pathname.startsWith('/templates')) return 'Templates';
    if (pathname.startsWith('/analytics')) return 'Analytics';
    if (pathname.startsWith('/monitoring')) return 'Monitoring';
    if (pathname.startsWith('/settings')) return 'Settings';
    if (pathname.startsWith('/profile')) return 'Profile';
    return 'AXR';
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'sticky top-0 z-50 transition-all duration-500 mx-4 lg:mx-6 mt-4 rounded-2xl',
          scrolled 
            ? 'bg-slate-950/80 backdrop-blur-xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/10' 
            : 'bg-slate-950/50 backdrop-blur-sm border border-indigo-500/20'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Left - Mobile Menu + Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-indigo-500/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-indigo-400" />
              ) : (
                <Menu className="w-5 h-5 text-indigo-400" />
              )}
            </button>

            {/* Logo - Always visible */}
            <Link href="/" className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <span className="font-bold text-lg hidden sm:block gradient-text-primary">
                AXR
              </span>
            </Link>

            {/* Page Title - Hidden on mobile when search open */}
            {!mobileSearchOpen && (
              <>
                <span className="hidden lg:block text-zinc-400">/</span>
                <h1 className="hidden lg:block text-lg font-medium">
                  <span className="gradient-text-primary">{getPageTitle()}</span>
                </h1>
              </>
            )}
          </div>

          {/* Center - Search (Desktop) */}
          <div className="hidden lg:block flex-1 max-w-md mx-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-400/50 group-hover:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder="Search workflows, agents, tasks..."
                className="w-full pl-12 pr-20 py-2.5 bg-slate-900/50 border border-indigo-500/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/30 text-white placeholder-slate-500 transition-all"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-indigo-500/30 bg-indigo-500/10 px-1.5 font-mono text-[10px] font-medium text-indigo-400">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-indigo-500/10 transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5 text-indigo-400" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden lg:block p-2 rounded-xl hover:bg-indigo-500/10 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-indigo-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-400" />
              )}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="hidden lg:block p-2 rounded-xl hover:bg-indigo-500/10 transition-colors"
              aria-label="Toggle fullscreen"
            >
              {fullscreen ? (
                <Minimize2 className="w-5 h-5 text-indigo-400" />
              ) : (
                <Maximize2 className="w-5 h-5 text-indigo-400" />
              )}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-indigo-500/10 transition-colors group">
              <Bell className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              {notifications > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
                </>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 pl-3 rounded-xl hover:bg-indigo-500/10 transition-colors group"
                aria-label="User menu"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-indigo-400">admin@axr.io</p>
                </div>
                <ChevronDown className={cn(
                  'hidden lg:block w-4 h-4 text-indigo-400 transition-transform duration-200',
                  userMenuOpen && 'rotate-180'
                )} />
              </button>

              {/* Dropdown Menu - Now with working links */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    {/* User Header */}
                    <div className="p-4 border-b border-indigo-500/20">
                      <p className="text-sm font-medium text-white">Admin User</p>
                      <p className="text-xs text-indigo-400 mt-0.5">admin@axr.io</p>
                    </div>

                    {/* Menu Items with Links */}
                    <div className="py-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-indigo-500/10 transition-colors w-full text-left"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 text-indigo-400" />
                        <span className="text-zinc-300">Profile</span>
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-indigo-500/10 transition-colors w-full text-left"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-indigo-400" />
                        <span className="text-zinc-300">Settings</span>
                      </Link>

                      <Link
                        href="/help"
                        className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-indigo-500/10 transition-colors w-full text-left"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <HelpCircle className="w-4 h-4 text-indigo-400" />
                        <span className="text-zinc-300">Help</span>
                      </Link>

                      <div className="border-t border-indigo-500/20 my-1" />

                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          // Handle logout logic here
                          console.log('Logout clicked');
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-rose-500/10 transition-colors w-full text-left text-rose-400"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-indigo-500/20 overflow-hidden"
            >
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-indigo-500/20 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Menu - Slide Down Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed inset-x-4 top-20 z-40 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-2 max-h-[70vh] overflow-y-auto">
              {/* Quick Actions */}
              <div className="p-3">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/tasks/new"
                    className="flex items-center gap-2 p-3 bg-indigo-500/10 rounded-xl hover:bg-indigo-500/20 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-sm text-white">New Task</span>
                  </Link>
                  <Link
                    href="/monitoring"
                    className="flex items-center gap-2 p-3 bg-indigo-500/10 rounded-xl hover:bg-indigo-500/20 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-sm text-white">Monitoring</span>
                  </Link>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="p-3 space-y-1">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Navigation</p>
                {[
                  { name: 'Dashboard', href: '/' },
                  { name: 'Workflows', href: '/workflows' },
                  { name: 'AI Agents', href: '/agents' },
                  { name: 'Workers', href: '/workers' },
                  { name: 'Tasks', href: '/tasks' },
                  { name: 'Templates', href: '/templates' },
                  { name: 'Analytics', href: '/analytics' },
                  { name: 'Monitoring', href: '/monitoring' },
                ].map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-3 rounded-xl transition-colors',
                        isActive
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'text-zinc-400 hover:bg-indigo-500/10 hover:text-white'
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="text-sm font-medium">{item.name}</span>
                      {isActive && (
                        <span className="ml-auto text-xs bg-indigo-500/30 px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Settings Links */}
              <div className="p-3 space-y-1">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Settings</p>
                {[
                  { name: 'Profile', href: '/profile' },
                  { name: 'Settings', href: '/settings' },
                  { name: 'Help', href: '/help' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-400 hover:bg-indigo-500/10 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="text-sm">{item.name}</span>
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    // Handle logout
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                >
                  <span className="text-sm">Logout</span>
                </button>
              </div>

              {/* System Status */}
              <div className="p-3">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-indigo-500/20">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-400">System Status</p>
                      <p className="text-sm font-medium text-emerald-400">Operational</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Quick Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="lg:hidden grid grid-cols-4 gap-1 mx-4 mt-2 mb-2 p-2 bg-slate-900/50 backdrop-blur-sm border border-indigo-500/20 rounded-xl"
      >
        <div className="text-center">
          <p className="text-xs text-zinc-400">Active</p>
          <p className="text-sm font-semibold text-emerald-400">0</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-zinc-400">Agents</p>
          <p className="text-sm font-semibold text-indigo-400">2</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-zinc-400">Tasks</p>
          <p className="text-sm font-semibold text-amber-400">0</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-zinc-400">Workers</p>
          <p className="text-sm font-semibold text-purple-400">4</p>
        </div>
      </motion.div>
    </>
  );
}