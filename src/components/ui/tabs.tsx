'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn('w-full', className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { currentValue: value, onSelect: onValueChange } as any);
        }
        return child;
      })}
    </div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  currentValue?: string;
  onSelect?: (val: string) => void;
}

export function TabsList({ children, className, currentValue, onSelect }: TabsListProps) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-xl bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isSelected: child.props.value === currentValue,
            onClick: () => onSelect && onSelect(child.props.value),
          } as any);
        }
        return child;
      })}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function TabsTrigger({
  value,
  children,
  className,
  isSelected,
  onClick,
}: TabsTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50',
        isSelected
          ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100 font-semibold'
          : 'hover:text-slate-900 dark:hover:text-slate-100',
        className
      )}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  currentValue?: string;
  className?: string;
}

export function TabsContent({
  value,
  children,
  currentValue,
  className,
}: TabsContentProps) {
  if (value !== currentValue) return null;
  return (
    <div
      className={cn(
        'mt-4 ring-offset-background focus-visible:outline-none animate-fade-in',
        className
      )}
    >
      {children}
    </div>
  );
}
