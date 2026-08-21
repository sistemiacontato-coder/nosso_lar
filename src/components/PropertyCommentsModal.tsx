'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Copy, Check, HelpCircle, Star, Save } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Property, VereditoSaymon, VereditoKelly } from '@/types/property';
import { decodeHtmlEntities } from '@/lib/utils';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface PropertyCommentsModalProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuickUpdateProperty?: (id: string, updates: Partial<Property>) => void;
}

export function PropertyCommentsModal({
  property,
  open,
  onOpenChange,
  onQuickUpdateProperty,
}: PropertyCommentsModalProps) {
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [notaSaymon, setNotaSaymon] = useState<number>(0);
  const [vereditoSaymon, setVereditoSaymon] = useState<VereditoSaymon | ''>('');
  const [opiniaoSaymon, setOpiniaoSaymon] = useState<string>('');

  const [notaKelly, setNotaKelly] = useState<number>(0);
  const [vereditoKelly, setVereditoKelly] = useState<VereditoKelly | ''>('');
  const [opiniaoKelly, setOpiniaoKelly] = useState<string>('');

  const [duvidasCorretor, setDuvidasCorretor] = useState<string>('');

  useEffect(() => {
    if (property) {
      setNotaSaymon(property.notaSaymon || 0);
      setVereditoSaymon(property.vereditoSaymon || '');
      setOpiniaoSaymon(property.opiniaoSaymon || '');

      setNotaKelly(property.notaKelly || 0);
      setVereditoKelly(property.vereditoKelly || '');
      setOpiniaoKelly(property.opiniaoKelly || '');

      setDuvidasCorretor(property.duvidasCorretor || '');
      setSavedSuccess(false);
    }
  }, [property]);

  if (!property) return null;

  const cleanTitle = decodeHtmlEntities(property.titulo);
  const cleanBairro = decodeHtmlEntities(property.bairro);

  const handleCopyQuestions = () => {
    if (!duvidasCorretor) return;
    const text = `Olá! Tudo bem? Estou analisando o imóvel "${cleanTitle}" (${cleanBairro}) e gostaria de tirar as seguintes dúvidas:\n\n${duvidasCorretor}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!onQuickUpdateProperty || !property) return;

    const nSaymon = Number(notaSaymon || 0);
    const nKelly = Number(notaKelly || 0);
    const media = (nSaymon > 0 && nKelly > 0) ? Number(((nSaymon + nKelly) / 2).toFixed(1)) : (nSaymon || nKelly || 0);

    onQuickUpdateProperty(property.id, {
      notaSaymon: nSaymon,
      vereditoSaymon: vereditoSaymon || undefined,
      opiniaoSaymon: opiniaoSaymon.trim() || undefined,

      notaKelly: nKelly,
      vereditoKelly: vereditoKelly || undefined,
      opiniaoKelly: opiniaoKelly.trim() || undefined,

      duvidasCorretor: duvidasCorretor.trim() || undefined,
      mediaCasal: media,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onOpenChange(false);
    }, 800);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="3xl">
      <div className="space-y-4">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-rose-500 text-white font-bold shrink-0 shadow-md shadow-indigo-500/20">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white line-clamp-1">
                  {cleanTitle}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  {cleanBairro} — Opiniões do Casal & Perguntas para o Corretor
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 shadow-xs">
                Média: {property.mediaCasal || 0} / 5 ⭐
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* 2-Column Grid for Saymon & Kelly */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SAYMON CARD */}
          <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 font-bold text-xs">
                  🧔
                </span>
                <span className="font-extrabold text-sm text-indigo-950 dark:text-indigo-200">
                  Opinião do Saymon
                </span>
              </div>
              {/* Star selector */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-xs">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNotaSaymon(notaSaymon === star ? 0 : star)}
                    className="p-0.5 hover:scale-110 transition-transform focus:outline-none"
                    title={`Nota ${star}`}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        star <= notaSaymon
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 ml-1">
                  {notaSaymon}/5
                </span>
              </div>
            </div>

            {/* Veredito */}
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300">Veredito do Saymon</Label>
              <select
                value={vereditoSaymon}
                onChange={(e) => setVereditoSaymon(e.target.value as any)}
                className="w-full h-9 px-3 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">— Sem Veredito (Pendente)</option>
                <option value="Aprovado">😍 Aprovado</option>
                <option value="Gostei">👍 Gostei</option>
                <option value="Neutro">😐 Neutro</option>
                <option value="Não Curti">👎 Não Curti</option>
              </select>
            </div>

            {/* Opiniao Textarea */}
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300">Comentário / Opinião</Label>
              <Textarea
                value={opiniaoSaymon}
                onChange={(e) => setOpiniaoSaymon(e.target.value)}
                placeholder="Ex: Sacada excelente, condomínio seguro, gostei da vaga..."
                rows={3}
                className="text-xs bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* KELLY CARD */}
          <div className="rounded-2xl border border-rose-200/80 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200 font-bold text-xs">
                  👩🏻
                </span>
                <span className="font-extrabold text-sm text-rose-950 dark:text-rose-200">
                  Opinião da Kelly
                </span>
              </div>
              {/* Star selector */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-rose-100 dark:border-rose-900/50 shadow-xs">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNotaKelly(notaKelly === star ? 0 : star)}
                    className="p-0.5 hover:scale-110 transition-transform focus:outline-none"
                    title={`Nota ${star}`}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        star <= notaKelly
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 ml-1">
                  {notaKelly}/5
                </span>
              </div>
            </div>

            {/* Veredito */}
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-rose-900 dark:text-rose-300">Veredito da Kelly</Label>
              <select
                value={vereditoKelly}
                onChange={(e) => setVereditoKelly(e.target.value as any)}
                className="w-full h-9 px-3 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800/80 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">— Sem Veredito (Pendente)</option>
                <option value="Aprovada">😍 Aprovada</option>
                <option value="Gostei">👍 Gostei</option>
                <option value="Neutra">😐 Neutra</option>
                <option value="Não Curti">👎 Não Curti</option>
              </select>
            </div>

            {/* Opiniao Textarea */}
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-rose-900 dark:text-rose-300">Comentário / Opinião</Label>
              <Textarea
                value={opiniaoKelly}
                onChange={(e) => setOpiniaoKelly(e.target.value)}
                placeholder="Ex: Cozinha ampla, iluminação ótima, amei a suíte..."
                rows={3}
                className="text-xs bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/60 focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Questions for Realtor & Notes */}
        <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-amber-600" /> Dúvidas e Perguntas para o Corretor
            </span>
            {duvidasCorretor && (
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
          <Textarea
            value={duvidasCorretor}
            onChange={(e) => setDuvidasCorretor(e.target.value)}
            placeholder="Ex: Aceita pet? Qual a andar da vaga? O condomínio inclui água e gás?..."
            rows={2}
            className="text-xs bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/60 focus:border-amber-500"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            Fechar
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={savedSuccess}
            className={`text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-md ${
              savedSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="mr-1.5 h-4 w-4" /> Opiniões Salvas!
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" /> Salvar Avaliação e Notas
              </>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
