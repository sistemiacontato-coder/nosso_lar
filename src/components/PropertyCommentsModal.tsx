'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Copy, Check, HelpCircle, Star, Save, Lock } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Property, VereditoSaymon, VereditoKelly } from '@/types/property';
import { decodeHtmlEntities } from '@/lib/utils';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Active Author (defaults to logged-in user or Saymon)
  const isKellyUser = user?.name?.toLowerCase().includes('kelly') || user?.username?.toLowerCase() === 'kelly';
  const [activeAuthor, setActiveAuthor] = useState<'saymon' | 'kelly'>(isKellyUser ? 'kelly' : 'saymon');

  // Form State
  const [notaSaymon, setNotaSaymon] = useState<number>(0);
  const [vereditoSaymon, setVereditoSaymon] = useState<VereditoSaymon | ''>('');
  const [opiniaoSaymon, setOpiniaoSaymon] = useState<string>('');

  const [notaKelly, setNotaKelly] = useState<number>(0);
  const [vereditoKelly, setVereditoKelly] = useState<VereditoKelly | ''>('');
  const [opiniaoKelly, setOpiniaoKelly] = useState<string>('');

  const [duvidasCorretor, setDuvidasCorretor] = useState<string>('');

  useEffect(() => {
    if (user) {
      const isK = user.name?.toLowerCase().includes('kelly') || user.username?.toLowerCase() === 'kelly';
      setActiveAuthor(isK ? 'kelly' : 'saymon');
    }
  }, [user]);

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
      <div className="flex flex-col max-h-[82vh] overflow-hidden -m-1">
        {/* 1. STICKY HEADER */}
        <div className="shrink-0 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 pr-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-rose-500 text-white font-bold shrink-0 shadow-sm">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1">
                {cleanTitle}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {cleanBairro} — Opiniões do Casal & Dúvidas
              </p>
            </div>
          </div>

          {/* Author Role Switcher Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
              Média: {property.mediaCasal || 0} ⭐
            </span>
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveAuthor('saymon')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeAuthor === 'saymon'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                🧔 Saymon
              </button>
              <button
                type="button"
                onClick={() => setActiveAuthor('kelly')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeAuthor === 'kelly'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                👩🏻 Kelly
              </button>
            </div>
          </div>
        </div>

        {/* 2. SCROLLABLE BODY WITH COMPACT SPACING */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
          {/* 2-Column Grid for Saymon & Kelly */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* SAYMON CARD */}
            <div
              className={`rounded-2xl border transition-all p-3 space-y-2.5 ${
                activeAuthor === 'saymon'
                  ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                  : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 font-bold text-xs">
                    🧔
                  </span>
                  <span className="font-extrabold text-xs text-indigo-950 dark:text-indigo-200">
                    Opinião do Saymon
                  </span>
                  {activeAuthor !== 'saymon' && (
                    <span title="Apenas Saymon pode alterar sua opinião">
                      <Lock className="h-3 w-3 text-slate-400 ml-0.5" />
                    </span>
                  )}
                </div>

                {/* Star selector */}
                <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={activeAuthor !== 'saymon'}
                      onClick={() => setNotaSaymon(notaSaymon === star ? 0 : star)}
                      className={`p-0.5 transition-transform focus:outline-none ${
                        activeAuthor === 'saymon' ? 'hover:scale-110' : 'cursor-not-allowed opacity-60'
                      }`}
                      title={activeAuthor === 'saymon' ? `Nota ${star}` : 'Alternar perfil para editar'}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          star <= notaSaymon
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 ml-0.5">
                    {notaSaymon}/5
                  </span>
                </div>
              </div>

              {/* Veredito Inline */}
              <div className="space-y-1">
                <Label className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                  Veredito do Saymon
                </Label>
                <select
                  value={vereditoSaymon}
                  disabled={activeAuthor !== 'saymon'}
                  onChange={(e) => setVereditoSaymon(e.target.value as any)}
                  className={`w-full h-8 px-2.5 text-xs font-bold rounded-xl border transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    activeAuthor === 'saymon'
                      ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800'
                      : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                  } ${
                    !vereditoSaymon ? 'text-slate-400 dark:text-slate-500 font-normal' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <option value="" className="text-slate-400 dark:text-slate-500 font-normal">
                    — Sem Veredito (Pendente)
                  </option>
                  <option value="Aprovado" className="text-slate-800 dark:text-slate-200 font-bold">
                    😍 Aprovado
                  </option>
                  <option value="Gostei" className="text-slate-800 dark:text-slate-200 font-bold">
                    👍 Gostei
                  </option>
                  <option value="Neutro" className="text-slate-800 dark:text-slate-200 font-bold">
                    😐 Neutro
                  </option>
                  <option value="Não Curti" className="text-slate-800 dark:text-slate-200 font-bold">
                    👎 Não Curti
                  </option>
                </select>
              </div>

              {/* Opiniao Textarea */}
              <div className="space-y-1">
                <Label className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                  Comentário / Opinião
                </Label>
                <Textarea
                  value={opiniaoSaymon}
                  disabled={activeAuthor !== 'saymon'}
                  onChange={(e) => setOpiniaoSaymon(e.target.value)}
                  placeholder="Ex: Sacada excelente, condomínio seguro, gostei da vaga..."
                  rows={2}
                  className={`text-xs ${
                    activeAuthor === 'saymon'
                      ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60 focus:border-indigo-500'
                      : 'bg-slate-100/70 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 cursor-not-allowed text-slate-600 dark:text-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* KELLY CARD */}
            <div
              className={`rounded-2xl border transition-all p-3 space-y-2.5 ${
                activeAuthor === 'kelly'
                  ? 'border-rose-300 dark:border-rose-700 bg-rose-50/40 dark:bg-rose-950/30 ring-2 ring-rose-500/20'
                  : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200 font-bold text-xs">
                    👩🏻
                  </span>
                  <span className="font-extrabold text-xs text-rose-950 dark:text-rose-200">
                    Opinião da Kelly
                  </span>
                  {activeAuthor !== 'kelly' && (
                    <span title="Apenas Kelly pode alterar sua opinião">
                      <Lock className="h-3 w-3 text-slate-400 ml-0.5" />
                    </span>
                  )}
                </div>

                {/* Star selector */}
                <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-900/50">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={activeAuthor !== 'kelly'}
                      onClick={() => setNotaKelly(notaKelly === star ? 0 : star)}
                      className={`p-0.5 transition-transform focus:outline-none ${
                        activeAuthor === 'kelly' ? 'hover:scale-110' : 'cursor-not-allowed opacity-60'
                      }`}
                      title={activeAuthor === 'kelly' ? `Nota ${star}` : 'Alternar perfil para editar'}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          star <= notaKelly
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 ml-0.5">
                    {notaKelly}/5
                  </span>
                </div>
              </div>

              {/* Veredito Inline */}
              <div className="space-y-1">
                <Label className="text-[10px] font-extrabold uppercase tracking-wider text-rose-900 dark:text-rose-300">
                  Veredito da Kelly
                </Label>
                <select
                  value={vereditoKelly}
                  disabled={activeAuthor !== 'kelly'}
                  onChange={(e) => setVereditoKelly(e.target.value as any)}
                  className={`w-full h-8 px-2.5 text-xs font-bold rounded-xl border transition-all focus:outline-none focus:ring-1 focus:ring-rose-500 ${
                    activeAuthor === 'kelly'
                      ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-800'
                      : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                  } ${
                    !vereditoKelly ? 'text-slate-400 dark:text-slate-500 font-normal' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <option value="" className="text-slate-400 dark:text-slate-500 font-normal">
                    — Sem Veredito (Pendente)
                  </option>
                  <option value="Aprovada" className="text-slate-800 dark:text-slate-200 font-bold">
                    😍 Aprovada
                  </option>
                  <option value="Gostei" className="text-slate-800 dark:text-slate-200 font-bold">
                    👍 Gostei
                  </option>
                  <option value="Neutra" className="text-slate-800 dark:text-slate-200 font-bold">
                    😐 Neutra
                  </option>
                  <option value="Não Curti" className="text-slate-800 dark:text-slate-200 font-bold">
                    👎 Não Curti
                  </option>
                </select>
              </div>

              {/* Opiniao Textarea */}
              <div className="space-y-1">
                <Label className="text-[10px] font-extrabold uppercase tracking-wider text-rose-900 dark:text-rose-300">
                  Comentário / Opinião
                </Label>
                <Textarea
                  value={opiniaoKelly}
                  disabled={activeAuthor !== 'kelly'}
                  onChange={(e) => setOpiniaoKelly(e.target.value)}
                  placeholder="Ex: Cozinha ampla, iluminação ótima, amei a suíte..."
                  rows={2}
                  className={`text-xs ${
                    activeAuthor === 'kelly'
                      ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/60 focus:border-rose-500'
                      : 'bg-slate-100/70 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 cursor-not-allowed text-slate-600 dark:text-slate-400'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Questions for Realtor Box */}
          <div className="rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[11px] uppercase tracking-wider text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                <HelpCircle className="h-3.5 w-3.5 text-amber-600" /> Dúvidas e Perguntas para o Corretor
              </span>
              {duvidasCorretor && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCopyQuestions}
                  className="h-6 text-[10px] font-bold border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 px-2"
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
              className="text-xs bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/60 focus:border-amber-500 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* 3. STICKY FOOTER (ALWAYS VISIBLE IN POPUP!) */}
        <div className="shrink-0 pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs text-slate-500 hover:text-slate-700 h-8 px-3"
          >
            Fechar
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={savedSuccess}
            className={`text-xs font-bold px-4 py-1.5 h-9 rounded-xl transition-all shadow-md ${
              savedSuccess
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : activeAuthor === 'kelly'
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
            }`}
          >
            {savedSuccess ? (
              <>
                <Check className="mr-1.5 h-4 w-4" /> Salvo com Sucesso!
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" /> Salvar Avaliação ({activeAuthor === 'kelly' ? 'Kelly' : 'Saymon'})
              </>
            )}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
