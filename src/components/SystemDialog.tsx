'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, Info, Trash2, X } from 'lucide-react';

export type DialogType = 'confirm' | 'alert' | 'info';

interface SystemDialogProps {
  open: boolean;
  type?: DialogType;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ICONS = {
  confirm: <Trash2 className="h-6 w-6 text-rose-500" />,
  alert: <AlertTriangle className="h-6 w-6 text-amber-500" />,
  info: <CheckCircle className="h-6 w-6 text-indigo-500" />,
};

const CONFIRM_STYLES = {
  confirm: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/30',
  alert: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-400/30',
  info: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30',
};

export function SystemDialog({
  open,
  type = 'confirm',
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: SystemDialogProps) {
  if (!open) return null;

  const isAlertOnly = type === 'info';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/20 animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="p-6">
          {/* Icon + Title */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              {ICONS[type]}
            </div>
            <div className="pt-1">
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                {title}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-slate-800 mb-4" />

          {/* Buttons */}
          <div className={`flex gap-2 ${isAlertOnly ? 'justify-end' : 'justify-between'}`}>
            {!isAlertOnly && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {cancelLabel}
              </button>
            )}
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-black shadow-lg transition-all hover:scale-[1.02] ${CONFIRM_STYLES[type]}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>

        {/* Brand accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl bg-gradient-to-r from-rose-500 via-indigo-500 to-purple-500" />
      </div>
    </div>
  );
}
