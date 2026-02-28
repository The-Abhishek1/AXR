// app/settings/layout.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Settings,
  Webhook,
  Key,
  Users,
  Shield,
  Bell,
  Palette,
  Globe,
  Database,
  Zap,
  Mail,
  Lock,
  UserCog,
  History,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsNav = [
  {
    name: 'General',
    href: '/settings',
    icon: Settings,
    color: 'text-zinc-400',
  },
  {
    name: 'Webhooks',
    href: '/settings/webhooks',
    icon: Webhook,
    color: 'text-indigo-400',
  },
  {
    name: 'API Keys',
    href: '/settings/api-keys',
    icon: Key,
    color: 'text-emerald-400',
  },
  {
    name: 'Team',
    href: '/settings/team',
    icon: Users,
    color: 'text-purple-400',
  },
  {
    name: 'Policies',
    href: '/settings/policies',
    icon: Shield,
    color: 'text-amber-400',
  },
  {
    name: 'Notifications',
    href: '/settings/notifications',
    icon: Bell,
    color: 'text-rose-400',
  },
  {
    name: 'Appearance',
    href: '/settings/appearance',
    icon: Palette,
    color: 'text-pink-400',
  },
  {
    name: 'Integrations',
    href: '/settings/integrations',
    icon: Globe,
    color: 'text-cyan-400',
  },
  {
    name: 'Data',
    href: '/settings/data',
    icon: Database,
    color: 'text-blue-400',
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {/* Settings Sidebar */}
      <div className="w-64 border-r border-indigo-500/20 bg-slate-900/30 p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold gradient-text-primary">Settings</h2>
          <p className="text-xs text-zinc-400 mt-1">Manage your account and system</p>
        </div>

        <nav className="space-y-1">
          {settingsNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
                  isActive
                    ? 'bg-indigo-500/20 text-white border border-indigo-500/30'
                    : 'text-zinc-400 hover:bg-indigo-500/10 hover:text-white'
                )}
              >
                <Icon className={cn('w-4 h-4', item.color)} />
                <span className="text-sm">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeSettings"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-indigo-500/20">
          <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-amber-400">Need help?</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Check our documentation or contact support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}