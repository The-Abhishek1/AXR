// app/analytics/costs/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { getCostAnalytics } from '@/lib/api';

export default function CostAnalyticsPage() {
  const [costData, setCostData] = useState([]);
  const [budgetAlerts, setBudgetAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCostAnalytics();
      setCostData(data.timeline);
      setBudgetAlerts(data.alerts);
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Cost Analytics</h1>
      
      {/* Budget Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-zinc-400">Total Spent</p>
            <p className="text-3xl font-bold text-white">$1,234</p>
            <p className="text-xs text-emerald-400 mt-2">↓ 12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-zinc-400">Budget Remaining</p>
            <p className="text-3xl font-bold text-white">$3,766</p>
            <p className="text-xs text-zinc-400 mt-2">of $5,000 total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-zinc-400">Avg Cost/Step</p>
            <p className="text-3xl font-bold text-white">$0.42</p>
            <p className="text-xs text-yellow-400 mt-2">↑ 3% from average</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-zinc-400">Budget Alerts</p>
            <p className="text-3xl font-bold text-yellow-400">3</p>
            <p className="text-xs text-zinc-400 mt-2">2 critical, 1 warning</p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="cost" stroke="#10b981" fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Budget Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {budgetAlerts.map((alert: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg">
                <div>
                  <p className="font-medium">{alert.process_name}</p>
                  <p className="text-xs text-zinc-400">{alert.message}</p>
                </div>
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs',
                  alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                )}>
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}