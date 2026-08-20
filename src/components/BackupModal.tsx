'use client';

import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';

interface BackupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalProperties: number;
  onExport: () => void;
  onImport: (jsonData: string) => { success: boolean; count?: number; error?: string };
  onResetToDefault: () => void;
  onClearRatings?: () => void;
}

export function BackupModal({
  open,
  onOpenChange,
  totalProperties,
  onExport,
  onImport,
  onResetToDefault,
  onClearRatings,
}: BackupModalProps) {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = onImport(content);
        if (result.success) {
          setFeedback({
            type: 'success',
            message: `Sucesso! ${result.count} imóveis foram importados com êxito.`,
          });
        } else {
          setFeedback({
            type: 'error',
            message: result.error || 'Falha ao processar arquivo JSON.',
          });
        }
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Tem certeza que deseja restaurar os imóveis de exemplo padrão? Os dados atuais serão substituídos.'
      )
    ) {
      onResetToDefault();
      setFeedback({
        type: 'success',
        message: 'Dados de exemplo restaurados com sucesso!',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Gerenciar Dados e Backup
        </DialogTitle>
        <DialogDescription>
          Exporte seus dados em JSON para guardar ou importe um backup existente.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {feedback && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Export JSON Option */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <FileJson className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Exportar Backup JSON
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Baixa um arquivo com todos os {totalProperties} imóveis cadastrados.
            </p>
          </div>
          <Button size="sm" onClick={onExport} className="shrink-0">
            <Download className="h-4 w-4 mr-1.5" />
            Baixar JSON
          </Button>
        </div>

        {/* Import JSON Option */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Importar Backup JSON
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Carregue um arquivo .json para restaurar seus dados salvos.
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,application/json"
            className="hidden"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0"
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Selecionar
          </Button>
        </div>

        {/* Zerar Avaliações & Status */}
        {onClearRatings && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4 text-rose-500" />
                Zerar Notas, Vereditos & Status
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Limpa as notas e opiniões do Saymon/Kelly e define status como "Para Analisar".
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onClearRatings();
                setFeedback({
                  type: 'success',
                  message: 'Avaliações zeradas e status alterados para Para Analisar!',
                });
              }}
              className="shrink-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              Zerar Notas
            </Button>
          </div>
        )}

        {/* Reset to Samples */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <RotateCcw className="h-4 w-4 text-amber-500" />
              Restaurar Exemplos Padrão
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recarrega a base com 5 apartamentos realistas de demonstração.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReset}
            className="shrink-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40"
          >
            Restaurar
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
