// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    RUNNING: 'bg-blue-500',
    TERMINATED: 'bg-emerald-500',
    FAILED: 'bg-red-500',
    PENDING: 'bg-yellow-500',
    PAUSED: 'bg-orange-500',
    SUCCESS: 'bg-emerald-500',
    RETRY: 'bg-purple-500'
  };
  return colors[status] || 'bg-zinc-500';
}

export function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" {
  const variants: Record<string, any> = {
    RUNNING: 'info',
    TERMINATED: 'success',
    FAILED: 'destructive',
    PENDING: 'warning',
    PAUSED: 'warning',
    SUCCESS: 'success',
    RETRY: 'secondary'
  };
  return variants[status] || 'default';
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}