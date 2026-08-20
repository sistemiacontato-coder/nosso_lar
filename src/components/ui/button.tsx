import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'emerald';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]';

    const variants = {
      default:
        'bg-blue-600 text-white shadow hover:bg-blue-700 hover:shadow-blue-500/20 hover:shadow-md dark:bg-blue-600 dark:hover:bg-blue-500',
      destructive:
        'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-red-500/20 hover:shadow-md dark:bg-red-700 dark:hover:bg-red-600',
      outline:
        'border border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-800 dark:text-slate-100',
      secondary:
        'bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
      ghost:
        'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:hover:text-slate-100',
      link: 'text-blue-600 underline-offset-4 hover:underline dark:text-blue-400',
      emerald:
        'bg-emerald-600 text-white shadow hover:bg-emerald-700 hover:shadow-emerald-500/20 hover:shadow-md dark:bg-emerald-600 dark:hover:bg-emerald-500',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-11 rounded-lg px-6 text-base font-semibold',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
