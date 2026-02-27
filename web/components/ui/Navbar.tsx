// components/ui/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { 
  Bell, 
  Search, 
  Settings, 
  User, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X,
  Github,
  HelpCircle,
  Maximize2,
  Minimize2,
  LayoutDashboard,
  Workflow,
  Users,
  Timer,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications] = useState(3);
  const [scrolled, setScrolled] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Get current page title based on pathname
  const getPageTitle = () => {
    if (pathname === '/') return { name: 'Dashboard', icon: LayoutDashboard };
    if (pathname.startsWith('/workflows')) return { name: 'Workflows', icon: Workflow };
    if (pathname.startsWith('/agents')) return { name: 'Agents', icon: Users };
    if (pathname.startsWith('/retry-queue')) return { name: 'Retry Queue', icon: Timer };
    if (pathname.startsWith('/monitoring')) return { name: 'Monitoring', icon: Activity };
    return { name: 'AXR', icon: LayoutDashboard };
  };

  const currentPage = getPageTitle();
  const PageIcon = currentPage.icon;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'sticky top-0 z-40 border-b transition-all duration-300',
          scrolled 
            ? 'bg-zinc-950/95 backdrop-blur-xl border-zinc-800 shadow-lg shadow-black/5' 
            : 'bg-zinc-950 border-zinc-800'
        )}
      >
        <div className="flex items-center justify-between h-16 px-3 sm:px-4 lg:px-6">
          {/* Left section - Mobile menu & Page Title */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Page Title with Icon */}
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 lg:hidden">
                <PageIcon className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-semibold lg:text-base lg:font-bold text-white">
                  {currentPage.name}
                </h1>
                <p className="text-xs text-zinc-500 hidden lg:block">
                  {pathname === '/' ? 'Overview & Metrics' : `Manage your ${currentPage.name.toLowerCase()}`}
                </p>
              </div>
            </div>
          </div>

          {/* Center - Search Bar (Desktop) */}
          <div className="hidden lg:block flex-1 max-w-xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="Search processes, agents, or steps..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-10 pr-20 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all text-white placeholder-zinc-500 hover:bg-zinc-900/80"
              />
              
              {/* Keyboard shortcut hint */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-1.5 font-mono text-[10px] font-medium text-zinc-400">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                aria-label="Toggle fullscreen"
              >
                {fullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>

              <button className="p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-zinc-800 transition-colors group">
              <Bell className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
              
              {/* Notification badge */}
              {notifications > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
                </>
              )}
            </button>

            {/* Settings - Desktop only */}
            <button className="hidden lg:block p-2 rounded-lg hover:bg-zinc-800 transition-colors group">
              <Settings className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-lg hover:bg-zinc-800 transition-colors group"
              >
                {/* Avatar with status */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
                </div>

                {/* User info - Hidden on tablet/mobile */}
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-white">Admin User</p>
                  <p className="text-xs text-zinc-400">admin@axr.io</p>
                </div>

                <ChevronDown className={cn(
                  'hidden lg:block w-4 h-4 text-zinc-400 transition-transform duration-200',
                  userMenuOpen && 'rotate-180'
                )} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    {/* User header */}
                    <div className="p-3 border-b border-zinc-800">
                      <p className="text-sm font-medium text-white">Admin User</p>
                      <p className="text-xs text-zinc-400 mt-0.5">admin@axr.io</p>
                    </div>

                    {/* Menu items */}
                    {[
                      { label: 'Profile', icon: User },
                      { label: 'Settings', icon: Settings },
                      { label: 'GitHub', icon: Github },
                      { label: 'Help & Support', icon: HelpCircle },
                      { label: 'Logout', icon: LogOut, danger: true },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-zinc-800 transition-colors',
                            item.danger ? 'text-red-400 hover:text-red-300' : 'text-zinc-300'
                          )}
                        >
                          <Icon className={cn('w-4 h-4', item.danger && 'text-red-400')} />
                          <span className="flex-1 text-left">{item.label}</span>
                        </button>
                      );
                    })}
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
              className="lg:hidden border-t border-zinc-800 overflow-hidden"
            >
              <div className="p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white placeholder-zinc-500"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed inset-x-0 top-16 z-30 bg-zinc-900 border-b border-zinc-800 shadow-xl"
          >
            <div className="p-2">
              {/* Mobile Navigation */}
              {[
                { name: 'Dashboard', href: '/', icon: LayoutDashboard },
                { name: 'Workflows', href: '/workflows', icon: Workflow },
                { name: 'Agents', href: '/agents', icon: Users },
                { name: 'Retry Queue', href: '/retry-queue', icon: Timer },
                { name: 'Monitoring', href: '/monitoring', icon: Activity },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                      isActive 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'text-zinc-400 hover:bg-zinc-800'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <span className="ml-auto text-xs bg-emerald-500/20 px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats Bar - Mobile only */}
      <div className="lg:hidden grid grid-cols-4 gap-1 p-2 bg-zinc-900/50 border-b border-zinc-800 text-xs">
        <div className="text-center">
          <p className="text-zinc-400">Processes</p>
          <p className="text-emerald-400 font-medium">24</p>
        </div>
        <div className="text-center">
          <p className="text-zinc-400">Agents</p>
          <p className="text-blue-400 font-medium">12</p>
        </div>
        <div className="text-center">
          <p className="text-zinc-400">Tasks</p>
          <p className="text-purple-400 font-medium">1.4k</p>
        </div>
        <div className="text-center">
          <p className="text-zinc-400">Alerts</p>
          <p className="text-yellow-400 font-medium">3</p>
        </div>
      </div>
    </>
  );
}