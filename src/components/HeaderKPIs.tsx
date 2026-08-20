'use client';

import React from 'react';
import { Building, DollarSign, TrendingDown, Clock, Heart, Sparkles, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { formatCurrency, formatCommute } from '@/lib/utils';
import { Property, getCoupleMatchBadge } from '@/types/property';

interface HeaderKPIsProps {
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
}

export function HeaderKPIs({ kpis, onSelectProperty }: HeaderKPIsProps) {
  const { total, mediaCusto, menorCustoTotal, maisPertoTrabalho, topCasalMatch } = kpis;

  const topMatchInfo = topCasalMatch ? getCoupleMatchBadge(topCasalMatch.notaSaymon, topCasalMatch.notaKelly) : null;

  return (
    <div className="mb-6 max-w-[1600px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total de Imóveis & Match */}
      <Card className="border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Imóveis na Lista
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/20">
              <Building className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {total}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
              Em avaliação por Saymon & Kelly
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Média Custo Total */}
      <Card className="border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Média Custo Total
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(mediaCusto)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Aluguel + Condomínio + IPTU / mês
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Top Match do Casal */}
      <Card
        onClick={() => topCasalMatch && onSelectProperty && onSelectProperty(topCasalMatch)}
        className={`border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 shadow-sm hover:shadow-md transition-all ${
          topCasalMatch ? 'cursor-pointer hover:border-rose-400 dark:hover:border-rose-600' : ''
        }`}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Top Match do Casal
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20">
              <Heart className="h-5 w-5 fill-rose-500/20" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {topCasalMatch ? `${topCasalMatch.mediaCasal} ⭐` : '-'}
              </span>
              {topMatchInfo && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${topMatchInfo.bg} ${topMatchInfo.border} ${topMatchInfo.color}`}>
                  {topMatchInfo.label}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="truncate max-w-[180px] font-medium text-slate-700 dark:text-slate-300">
                {topCasalMatch ? topCasalMatch.titulo : 'Sem dados'}
              </span>
              {topCasalMatch && <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Menor Custo ou Mais Próximo */}
      <Card
        onClick={() => menorCustoTotal && onSelectProperty && onSelectProperty(menorCustoTotal)}
        className={`border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50 shadow-sm hover:shadow-md transition-all ${
          menorCustoTotal ? 'cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600' : ''
        }`}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Menor Custo Mensal
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 dark:bg-teal-500/20">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {menorCustoTotal ? formatCurrency(menorCustoTotal.custoTotalMensal) : '-'}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="truncate max-w-[180px] font-medium text-slate-700 dark:text-slate-300">
                {menorCustoTotal ? `${menorCustoTotal.bairro} (${menorCustoTotal.areaUtil}m²)` : 'Sem dados'}
              </span>
              {menorCustoTotal && <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
