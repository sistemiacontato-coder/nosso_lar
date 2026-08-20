'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  X,
  Building,
  DollarSign,
  Heart,
  Clock,
  TrendingDown,
  MapPin,
  Sparkles,
  ArrowUpRight,
  User,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { formatCurrency, formatCommute } from '@/lib/utils';
import { Property, getCoupleMatchBadge, CommuteAnchors } from '@/types/property';
import { getStoredCommuteAnchors, DEFAULT_COMMUTE_ANCHORS } from './CommuteAnchorsModal';

interface SidebarDashboardProps {
  open: boolean;
  onClose: () => void;
  kpis: {
    total: number;
    mediaCusto: number;
    menorCustoTotal: Property | null;
    maisPertoTrabalho: Property | null;
    topCasalMatch: Property | null;
    favoritoSaymon: Property | null;
    favoritaKelly: Property | null;
  };
  onSelectProperty?: (property: Property) => void;
  onOpenCommuteAnchorsModal?: () => void;
}

export function SidebarDashboard({
  open,
  onClose,
  kpis,
  onSelectProperty,
  onOpenCommuteAnchorsModal,
}: SidebarDashboardProps) {
  const [anchors, setAnchors] = useState<CommuteAnchors>(DEFAULT_COMMUTE_ANCHORS);

  useEffect(() => {
    if (open) {
      setAnchors(getStoredCommuteAnchors());
    }
  }, [open]);

  if (!open) return null;

  const { total, mediaCusto, menorCustoTotal, maisPertoTrabalho, topCasalMatch } = kpis;
  const topMatchInfo = topCasalMatch ? getCoupleMatchBadge(topCasalMatch.notaSaymon, topCasalMatch.notaKelly) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Sidebar Panel */}
      <aside className="fixed inset-y-0 left-0 z-50 w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-transform animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 shrink-0">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Painel & Dashboard
              </h2>
              <p className="text-xs text-slate-500">Dados consolidados do Nosso Lar</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* SECTION 1: CONSOLIDATED KPIS */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Métricas Principais
            </h3>

            {/* Total Imóveis */}
            <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Imóveis na Lista</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{total}</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <Building className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            {/* Média Custo Total */}
            <Card className="border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500">Média Custo Total</span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(mediaCusto)}
                  </div>
                  <span className="text-[10px] text-slate-400">Aluguel + Cond. + IPTU</span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <DollarSign className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            {/* Top Match do Casal */}
            <Card
              onClick={() => topCasalMatch && onSelectProperty && onSelectProperty(topCasalMatch)}
              className={`border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 transition-all ${
                topCasalMatch ? 'cursor-pointer hover:border-rose-400' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Top Match do Casal</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
                    <Heart className="h-4 w-4 fill-rose-500/20" />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {topCasalMatch ? `${topCasalMatch.mediaCasal} ⭐` : '-'}
                  </span>
                  {topMatchInfo && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${topMatchInfo.bg} ${topMatchInfo.color}`}>
                      {topMatchInfo.label}
                    </span>
                  )}
                </div>
                {topCasalMatch && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-1">
                    {topCasalMatch.titulo}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Menor Custo Mensal */}
            {menorCustoTotal && (
              <Card
                onClick={() => onSelectProperty && onSelectProperty(menorCustoTotal)}
                className="border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 cursor-pointer hover:border-emerald-400 transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Menor Custo Mensal</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                      <TrendingDown className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                    {formatCurrency(menorCustoTotal.custoTotalMensal)}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-1">
                    {menorCustoTotal.bairro} ({menorCustoTotal.areaUtil}m²)
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Mais Perto do Trabalho */}
            {maisPertoTrabalho && (
              <Card
                onClick={() => onSelectProperty && onSelectProperty(maisPertoTrabalho)}
                className="border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 cursor-pointer hover:border-purple-400 transition-all"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Mais Perto do Trabalho</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                      <Clock className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">
                    {formatCommute(maisPertoTrabalho.tempoAteTrabalhoMinutos)}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-1">
                    {maisPertoTrabalho.titulo}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* SECTION 2: ENDEREÇOS FIXOS DO PERFIL (SAYMON & KELLY) */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Perfil de Endereços Fixos
              </h3>
              <button
                type="button"
                onClick={onOpenCommuteAnchorsModal}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Settings className="h-3 w-3" /> Editar
              </button>
            </div>

            {/* Saymon Addresses */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-1.5 text-xs">
              <div className="font-extrabold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <span>🧑🏻‍🦱 Saymon</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 truncate">
                <span className="font-bold">1:</span> {anchors.saymonAddress1 || 'Não cadastrado'}
              </p>
              {anchors.saymonAddress2 && (
                <p className="text-slate-600 dark:text-slate-300 truncate">
                  <span className="font-bold">2:</span> {anchors.saymonAddress2}
                </p>
              )}
            </div>

            {/* Kelly Addresses */}
            <div className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 space-y-1.5 text-xs">
              <div className="font-extrabold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                <span>👩🏻‍🦱 Kelly</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 truncate">
                <span className="font-bold">1:</span> {anchors.kellyAddress1 || 'Não cadastrado'}
              </p>
              {anchors.kellyAddress2 && (
                <p className="text-slate-600 dark:text-slate-300 truncate">
                  <span className="font-bold">2:</span> {anchors.kellyAddress2}
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={onOpenCommuteAnchorsModal}
              className="w-full text-xs font-bold border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100"
            >
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-indigo-600" /> Cadastrar / Editar Endereços do Perfil
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
