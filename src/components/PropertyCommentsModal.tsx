'use client';

import React from 'react';
import { MessageSquare, Copy, Check, HelpCircle } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Property } from '@/types/property';
import { decodeHtmlEntities } from '@/lib/utils';

interface PropertyCommentsModalProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyCommentsModal({ property, open, onOpenChange }: PropertyCommentsModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!property) return null;

  const cleanTitle = decodeHtmlEntities(property.titulo);
  const cleanBairro = decodeHtmlEntities(property.bairro);

  const handleCopyQuestions = () => {
    if (!property.duvidasCorretor) return;
    const text = `Olá! Tudo bem? Estou analisando o imóvel "${cleanTitle}" (${cleanBairro}) e gostaria de tirar as seguintes dúvidas:\n\n${property.duvidasCorretor}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="lg">
      <div className="space-y-4">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                  {cleanTitle}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  {cleanBairro} — Opiniões do Casal & Perguntas para o Corretor
                </DialogDescription>
              </div>
            </div>
            <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              Média: {property.mediaCasal} / 5 ⭐
            </span>
          </div>
        </DialogHeader>

        {/* Content list without unnecessary height lock so scrollbar only appears if content exceeds screen */}
        <div className="space-y-3">
          {/* Saymon Opinion */}
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/30 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <span className="text-base">👨🏻</span> Opinião do Saymon
                {property.vereditoSaymon && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                    {property.vereditoSaymon}
                  </span>
                )}
              </span>
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                ⭐ {property.notaSaymon}/5
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 font-normal leading-relaxed bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 italic">
              {property.opiniaoSaymon || 'Nenhum comentário cadastrado pelo Saymon.'}
            </p>
          </div>

          {/* Kelly Opinion */}
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/30 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                <span className="text-base">👩🏻</span> Opinião da Kelly
                {property.vereditoKelly && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300">
                    {property.vereditoKelly}
                  </span>
                )}
              </span>
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                ⭐ {property.notaKelly}/5
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 font-normal leading-relaxed bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40 italic">
              {property.opiniaoKelly || 'Nenhum comentário cadastrado pela Kelly.'}
            </p>
          </div>

          {/* Questions for Realtor */}
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/30 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-amber-600" /> Dúvidas e Perguntas para o Corretor
              </span>
              {property.duvidasCorretor && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyQuestions}
                  className="h-7 text-[11px] font-bold border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1 h-3 w-3 text-emerald-600" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3 text-amber-600" /> Copiar p/ WhatsApp
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200/80 dark:border-amber-900/40 text-xs text-slate-800 dark:text-slate-100 whitespace-pre-wrap font-medium leading-relaxed">
              {property.duvidasCorretor || 'Nenhuma dúvida cadastrada para este imóvel.'}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
            Fechar
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
