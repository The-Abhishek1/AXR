// app/monitoring/timeline/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timeline } from '@/components/monitoring/Timeline';
import { getProcesses } from '@/lib/api';
import { formatDistance } from 'date-fns';

export default function TimelinePage() {
  const [processes, setProcesses] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProcesses();
        setProcesses(data.processes);
        
        // Transform process data into timeline events
        const events = data.processes.flatMap((p: any) => 
          p.steps.map((step: any) => ({
            id: step.step_id,
            processId: p.pid,
            name: step.syscall,
            startTime: step.started_at || Date.now() - Math.random() * 10000,
            endTime: step.completed_at || Date.now(),
            status: step.status,
            duration: step.completed_at ? step.completed_at - step.started_at : 0,
          }))
        ).sort((a: any, b: any) => b.startTime - a.startTime).slice(0, 20);
        
        setTimelineData(events);
      } catch (error) {
        console.error('Failed to fetch timeline data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-zinc-800 rounded-lg animate-pulse" />
        <div className="h-96 bg-zinc-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Execution Timeline
          </h1>
          <p className="text-zinc-400 mt-2">Visualize process execution over time</p>
        </div>
        <div className="text-sm text-zinc-400">
          Last 20 steps
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Process Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Timeline data={timelineData} />
        </CardContent>
      </Card>
    </div>
  );
}