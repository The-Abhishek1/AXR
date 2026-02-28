// app/analytics/layout.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  DollarSign,
  Activity,
  Brain,
  Cpu,
  Clock,
  Users,
  Zap,
  Target,
  Award,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const analyticsNav = [
  {
    name: 'Overview',
    href: '/analytics',
    icon: BarChart3,
    color: 'text-indigo-400',
  },
  {
    name: 'Cost Analytics',
    href: '/analytics/costs',
    icon: DollarSign,
    color: 'text-emerald-400',
  },
  {
    name: 'Performance',
    href: '/analytics/performance',
    icon: Activity,
    color: 'text-blue-400',
  },
  {
    name: 'Agent Analytics',
    href: '/analytics/agents',
    icon: Brain,
    color: 'text-purple-400',
  },
  {
    name: 'Worker Metrics',
    href: '/analytics/workers',
    icon: Cpu,
    color: 'text-amber-400',
  },
  {
    name: 'Custom Reports',
    href: '/analytics/reports',
    icon: PieChart,
    color: 'text-rose-400',
  },
];

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full">
      {/* Analytics Sidebar */}
      <div className="w-64 border-r border-indigo-500/20 bg-slate-900/30 p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold gradient-text-primary">Analytics</h2>
          <p className="text-xs text-zinc-400 mt-1">Data insights and metrics</p>
        </div>

        <nav className="space-y-1">
          {analyticsNav.map((item) => {
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
                    layoutId="activeAnalytics"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-indigo-500/20">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-lg p-4 border border-indigo-500/20">
            <Sparkles className="w-5 h-5 text-indigo-400 mb-2" />
            <p className="text-sm font-medium text-white">Custom Reports</p>
            <p className="text-xs text-zinc-400 mt-1">Create your own analytics dashboards</p>
            <button className="mt-3 text-xs text-indigo-400 hover:text-indigo-300">
              Create Report →
            </button>
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