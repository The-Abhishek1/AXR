// app/workflows/[pid]/debug/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, Play, Pause, SkipForward, RotateCcw } from 'lucide-react';
import { getProcessDetails, retryStep, pauseProcess, resumeProcess } from '@/lib/api';

export default function ProcessDebuggerPage() {
  const { pid } = useParams();
  const [process, setProcess] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchProcess = async () => {
      const data = await getProcessDetails(pid as string);
      setProcess(data);
    };
    
    fetchProcess();
    const interval = setInterval(fetchProcess, 2000);
    return () => clearInterval(interval);
  }, [pid]);

  const handleStepRetry = async (stepId: string) => {
    await retryStep(stepId);
    // Show toast
  };

  const handleStepInspect = (step: any) => {
    setSelectedStep(step);
    // Fetch step logs
    fetchStepLogs(step.step_id);
  };

  return (
    <div className="p-6 h-full flex gap-6">
      {/* Left Panel - Process Graph */}
      <div className="w-2/3 space-y-4">
        <Card className="h-[calc(100vh-12rem)]">
          <CardContent className="p-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Process Debugger</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => pauseProcess(pid as string)}>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button size="sm" variant="outline" onClick={() => resumeProcess(pid as string)}>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              </div>
            </div>
            
            {/* Interactive Step Graph */}
            <div className="h-[calc(100%-8rem)]">
              {/* Your graph component here with click handlers */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Step Inspector */}
      <div className="w-1/3 space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Step Inspector
            </h3>
            
            {selectedStep ? (
              <div className="space-y-4">
                <div className="bg-zinc-900 p-3 rounded-lg">
                  <p className="text-sm text-zinc-400">Step ID</p>
                  <p className="font-mono text-sm">{selectedStep.step_id}</p>
                </div>
                
                <div className="bg-zinc-900 p-3 rounded-lg">
                  <p className="text-sm text-zinc-400">Syscall</p>
                  <p className="text-emerald-400 font-medium">{selectedStep.syscall}</p>
                </div>
                
                <div className="bg-zinc-900 p-3 rounded-lg">
                  <p className="text-sm text-zinc-400">Status</p>
                  <p className={cn(
                    'font-medium',
                    selectedStep.status === 'SUCCESS' && 'text-emerald-400',
                    selectedStep.status === 'FAILED' && 'text-red-400',
                    selectedStep.status === 'RUNNING' && 'text-blue-400'
                  )}>
                    {selectedStep.status}
                  </p>
                </div>
                
                <div className="bg-zinc-900 p-3 rounded-lg">
                  <p className="text-sm text-zinc-400 mb-2">Input/Output</p>
                  <pre className="text-xs bg-zinc-950 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(selectedStep.inputs || selectedStep.outputs, null, 2)}
                  </pre>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => handleStepRetry(selectedStep.step_id)}
                  disabled={selectedStep.status !== 'FAILED'}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry Step
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-400">
                Click on a step to inspect
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Logs */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Live Logs</h3>
            <div className="bg-zinc-900 rounded-lg p-3 h-64 overflow-auto font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="text-zinc-300 mb-1">
                  <span className="text-zinc-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}