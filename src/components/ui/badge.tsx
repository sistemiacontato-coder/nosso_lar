import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-blue-600 text-white shadow hover:bg-blue-700',
    secondary: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
    destructive: 'bg-red-500/10 text-red-700 border-red-500/20 dark:bg-red-500/20 dark:text-red-300',
    outline: 'text-foreground border border-border',
    success: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/25 dark:text-emerald-300',
    warning: 'bg-amber-500/15 text-amber-800 border-amber-500/30 dark:bg-amber-500/25 dark:text-amber-300',
    info: 'bg-sky-500/15 text-sky-800 border-sky-500/30 dark:bg-sky-500/25 dark:text-sky-300',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
