'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import {
  X,
  Trophy,
  ExternalLink,
  Check,
  Sparkles,
  Clock,
  Navigation,
  Star,
  Building,
  Heart,
} from 'lucide-react';
import { Property, STATUS_CONFIG, getCoupleMatchBadge } from '@/types/property';
import { formatCurrency, formatCurrencyPerM2, formatCommute, formatDistance } from '@/lib/utils';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';

interface PropertyComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties: Property[];
  onRemoveFromCompare: (id: string) => void;
  onClearAll: () => void;
  onEdit: (property: Property) => void;
}

export function PropertyComparisonModal({
  open,
  onOpenChange,
  properties,
  onRemoveFromCompare,
  onClearAll,
  onEdit,
}: PropertyComparisonModalProps) {
  // Compute winners in each metric
  const winners = useMemo(() => {
    if (properties.length < 2) {
      return {
        lowestTotalCostId: null,
        lowestPerM2Id: null,
        largestAreaId: null,
        shortestCommuteId: null,
        highestCoupleMediaId: null,
      };
    }

    const lowestTotalCost = Math.min(...properties.map((p) => p.custoTotalMensal));
    const lowestTotalCostId = properties.find((p) => p.custoTotalMensal === lowestTotalCost)?.id || null;

    const lowestPerM2 = Math.min(...properties.map((p) => p.precoMetroQuadrado));
    const lowestPerM2Id = properties.find((p) => p.precoMetroQuadrado === lowestPerM2)?.id || null;

    const largestArea = Math.max(...properties.map((p) => p.areaUtil));
    const largestAreaId = properties.find((p) => p.areaUtil === largestArea)?.id || null;

    const shortestCommute = Math.min(...properties.map((p) => p.tempoAteTrabalhoMinutos));
    const shortestCommuteId = properties.find((p) => p.tempoAteTrabalhoMinutos === shortestCommute)?.id || null;

    const highestCoupleMedia = Math.max(...properties.map((p) => p.mediaCasal));
    const highestCoupleMediaId = properties.find((p) => p.mediaCasal === highestCoupleMedia)?.id || null;

    return {
      lowestTotalCostId,
      lowestPerM2Id,
      largestAreaId,
      shortestCommuteId,
      highestCoupleMediaId,
    };
  }, [properties]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="6xl">
      <DialogHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pr-8 gap-2">
          <div>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Trophy className="h-5 w-5 text-amber-500" />
              Comparativo Lado a Lado do Casal
            </DialogTitle>
            <DialogDescription>
              Comparando {properties.length} {properties.length === 1 ? 'imóvel' : 'imóveis'} com as opiniões de Saymon & Kelly e melhores métricas.
            </DialogDescription>
          </div>
          {properties.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              Limpar Seleção
            </Button>
          )}
        </div>
      </DialogHeader>

      {properties.length === 0 ? (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nenhum imóvel selecionado para comparar.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Clique no botão "Comparar" nos cards dos imóveis desejados para visualizá-los aqui lado a lado.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[700px]">
            {/* Properties Columns Header */}
            <div
              className="grid gap-4 items-stretch pb-6 border-b border-slate-200 dark:border-slate-800"
              style={{
                gridTemplateColumns: `200px repeat(${properties.length}, minmax(240px, 1fr))`,
              }}
            >
              {/* Metric Label Column */}
              <div className="flex flex-col justify-end p-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Métricas de Análise
                </span>
              </div>

              {/* Property Card Previews */}
              {properties.map((prop) => {
                const statusCfg = STATUS_CONFIG[prop.status] || STATUS_CONFIG['Em Análise'];
                const coupleBadge = getCoupleMatchBadge(prop.notaSaymon, prop.notaKelly);

                return (
                  <div
                    key={prop.id}
                    className="relative flex flex-col rounded-xl border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/60 p-3"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => onRemoveFromCompare(prop.id)}
                      className="absolute top-2 right-2 z-10 rounded-full bg-white/80 dark:bg-slate-800/80 p-1 text-slate-400 hover:text-rose-600 shadow-sm transition-colors"
                      title="Remover da comparação"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    {/* Image Preview */}
                    <div className="relative h-28 w-full rounded-lg overflow-hidden mb-2 bg-slate-200 dark:bg-slate-800">
                      {prop.urlImagem ? (
                        <Image
                          src={prop.urlImagem}
                          alt={prop.titulo}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <Building className="h-6 w-6 opacity-40" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mb-1">
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.text}`}
                      >
                        {statusCfg.label}
                      </span>
                      {coupleBadge && (
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold border ${coupleBadge.bg} ${coupleBadge.border} ${coupleBadge.color}`}
                        >
                          {coupleBadge.label}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 mb-1" title={prop.titulo}>
                      {prop.titulo}
                    </h4>

                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                      {prop.bairro}
                    </span>

                    <div className="mt-auto flex items-center gap-1">
                      <a
                        href={prop.urlAnuncio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-1 px-2 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Ver Anúncio</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comparison Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {/* SECTION: AVALIAÇÃO DO CASAL */}
              <div className="py-2.5 px-2 font-bold uppercase tracking-wider text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20 rounded-lg mt-3 flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> 1. Sintonia e Avaliação do Casal
              </div>

              {/* Média do Casal */}
              <div
                className="grid gap-4 py-3 items-center"
                style={{
                  gridTemplateColumns: `200px repeat(${properties.length}, minmax(240px, 1fr))`,
                }}
              >
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Média do Casal
                </div>
                {properties.map((prop) => {
                  const isWinner = winners.highestCoupleMediaId === prop.id;
                  return (
                    <div
                      key={prop.id}
                      className={`p-2 rounded-lg ${
                        isWinner
                          ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 font-bold'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <Heart className="h-4 w-4 fill-rose-500" /> {prop.mediaCasal} ⭐
                        </span>
                        {isWinner && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-600 px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                            <Sparkles className="h-2.5 w-2.5" /> Mais Amado
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Ponto de Vista do Saymon */}
              <div
                className="grid gap-4 py-3 items-start"
                style={{
                  gridTemplateColumns: `200px repeat(${properties.length}, minmax(240px, 1fr))`,
                }}
              >
                <div className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                  <span>🧔 Ponto de Vista Saymon</span>
                </div>
                {properties.map((prop) => (
                  <div key={prop.id} className="p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {prop.notaSaymon} ⭐
                      </span>
                      {prop.vereditoSaymon && (
                        <span className="text-[9px] font-semibold bg-blue-600 text-white px-1.5 py-0.2 rounded">
                          {prop.vereditoSaymon}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                      "{prop.opiniaoSaymon || 'Sem comentários'}"
                    </p>
                  </div>
                ))}
              </div>

              {/* Ponto de Vista da Kelly */}
              <div
                className="grid gap-4 py-3 items-start"
                style={{
                  gridTemplateColumns: `200px repeat(${properties.length}, minmax(240px, 1fr))`,
                }}
              >
                <div className="font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                  <span>👩 Ponto de Vista Kelly</span>
                </div>
                {properties.map((prop) => (
                  <div key={prop.id} className="p-2 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {prop.notaKelly} ⭐
                      </span>
                      {prop.vereditoKelly && (
                        <span className="text-[9px] font-semibold bg-rose-600 text-white px-1.5 py-0.2 rounded">
                          {prop.vereditoKelly}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                      "{prop.opiniaoKelly || 'Sem comentários'}"
                    </p>
                  </div>
                ))}
              </div>

              {/* SECTION: FINANCEIRO */}
              <div className="py-2.5 px-2 font-bold uppercase tracking-wider text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-lg mt-3">
                2. Métricas Financeiras
              </div>

              {/* Custo Total Mensal */}
              <div
                className="grid gap-4 py-3 items-center"
                style={{
                  gridTemplateColumns: `200px repeat(${properties.length}, minmax(240px, 1fr))`,
                }}
              >
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Custo Total Mensal
                </div>
                {properties.map((prop) => {
                  const isWinner = winners.lowestTotalCostId === prop.id;
                  return (
                    <div
                      key={prop.id}
                      className={`p-2 rounded-lg ${
                        isWinner
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 font-bold'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(prop.custoTotalMensal)}
                        </span>
                        {isWinner && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-600 px-1.5 py-0.2 text-[9px] font-bold text-white uppercase">
                            <Sparkles className="h-2.5 w-2.5" /> Menor Custo
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Valor Aluguel */}
              <div
                className="grid gap-4 py-2.5 items-center"
                style={{
                  gridTemplateColumns: `200px repeat(${properties.length}, minmax(240px, 1fr))`,
                }}
              >
                <div className="text-slate-500 dark:text-slate-400">Aluguel Puro</div>
                {properties.map((prop) => (
                  <div key={prop.id} className="font-medium text-slate-800 dark:text-slate-200">
                    {formatCurrency(prop.valorAluguel)}
                  </div>
                ))}
              </div>

              {/* Condomínio & IPTU */}
              <div
                className="grid gap-4 py-2.5 items-center"
                style={{
                  gridTemplateColumns: `200px repeat(${properties.length}, minmax(240px, 1fr))`,
                }}
              >
                <div className="text-slate-500 dark:text-slate-400">Condomínio + IPTU</div>
                {properties.map((prop) => (
                  <div key={prop.id} className="text-slate-600 dark:text-slate-300">
                    Cond: {formatCurrency(prop.valorCondominio)} <br />
                    IPTU: {formatCurrency(prop.valorIptu)}
                  </div>
                ))}
              </div>

              {/* Preço por m² */}
              <div
                className="grid gap-4 py-2.5 items-center"
                style={{
                  gridTemplateColumns: `200px repeat(${properties.length}, minmax(240px, 1fr))`,
                }}
              >
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Preço por m²
                </div>
                {properties.map((prop) => {
                  const isWinner = winners.lowestPerM2Id === prop.id;
                  return (
                    <div
                      key={prop.id}
                      className={`p-1.5 rounded-lg ${
                        isWinner
                          ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 font-bold'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {formatCurrencyPerM2(prop.precoMetroQuadrado)}
                        </span>
                        {isWinner && (
                          <span className="inline-flex items-center rounded bg-blue-600 px-1 py-0.2 text-[9px] font-bold text-white uppercase">
                            Melhor R$/m²
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* SECTION: ESTRUTURA & ESPAÇO */}
              <div className="py-2.5 px-2 font-bold uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20 rounded-lg mt-3">
                3. Estrutura e Espaço
              </div>

              {/* Área Útil */}
              <div
                className="grid gap-4 py-2.5 items-center"
                style={{
                  gridTemplateColumns: `200px repeat(${properties.length}, minmax(240px, 1fr))`,
                }}
              >
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Área Útil (m²)
                </div>
                {properties.map((prop) => {
                  const isWinner = winners.largestAreaId === prop.id;
                  return (
                    <div
                      key={prop.id}
                      className={`p-1.5 rounded-lg ${
                        isWinner
                          ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 font-bold'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {prop.areaUtil} m²
                        </span>
                        {isWinner && (
                          <span className="inline-flex items-center rounded bg-amber-600 px-1 py-0.2 text-[9px] font-bold text-white uppercase">
                            Maior Área
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dormitórios & Suítes */}
              <div
                className="grid gap-4 py-2.5 items-center"
                style={{
                  gridTemplateColumns: `200px repeat(${properties.length}, minmax(240px, 1fr))`,
                }}
              >
                <div className="text-slate-500 dark:text-slate-400">Dormitórios / Suítes</div>
                {properties.map((prop) => (
                  <div key={prop.id} className="font-medium text-slate-800 dark:text-slate-200">
                    {prop.dormitorios} quarto{prop.dormitorios > 1 ? 's' : ''} ({prop.suites} suíte{prop.suites > 1 ? 's' : ''})
                  </div>
                ))}
              </div>

              {/* Banheiros & Vagas */}
              <div
                className="grid gap-4 py-2.5 items-center"
                style={{
                  gridTemplateColumns: `200px repeat(${properties.length}, minmax(240px, 1fr))`,
                }}
              >
                <div className="text-slate-500 dark:text-slate-400">Banheiros & Vagas</div>
                {properties.map((prop) => (
                  <div key={prop.id} className="text-slate-700 dark:text-slate-300">
                    {prop.banheiros} banheiros • {prop.vagasGaragem} vaga{prop.vagasGaragem > 1 ? 's' : ''}
                  </div>
                ))}
              </div>

              {/* SECTION: LOGÍSTICA & LOCALIZAÇÃO */}
              <div className="py-2.5 px-2 font-bold uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20 rounded-lg mt-3">
                4. Logística e Localização
              </div>

              {/* Tempo até o Trabalho */}
              <div
                className="grid gap-4 py-2.5 items-center"
                style={{
                  gridTemplateColumns: `200px repeat(${properties.length}, minmax(240px, 1fr))`,
                }}
              >
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Tempo até Trabalho
                </div>
                {properties.map((prop) => {
                  const isWinner = winners.shortestCommuteId === prop.id;
                  return (
                    <div
                      key={prop.id}
                      className={`p-1.5 rounded-lg ${
                        isWinner
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-700 font-bold'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-indigo-500" />
                          {formatCommute(prop.tempoAteTrabalhoMinutos)}
                        </span>
                        {isWinner && (
                          <span className="inline-flex items-center rounded bg-indigo-600 px-1 py-0.2 text-[9px] font-bold text-white uppercase">
                            Mais Rápido
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Distância do Metrô */}
              <div
                className="grid gap-4 py-2.5 items-center"
                style={{
                  gridTemplateColumns: `200px repeat(${properties.length}, minmax(240px, 1fr))`,
                }}
              >
                <div className="text-slate-500 dark:text-slate-400">Distância Metrô / Trem</div>
                {properties.map((prop) => (
                  <div key={prop.id} className="text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Navigation className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{formatDistance(prop.distanciaMetroKm)}</span>
                  </div>
                ))}
              </div>

              {/* SECTION: DIFERENCIAIS */}
              <div className="py-2.5 px-2 font-bold uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50/40 dark:bg-blue-950/20 rounded-lg mt-3">
                5. Diferenciais Presentes
              </div>

              <div
                className="grid gap-4 py-3 items-start"
                style={{
                  gridTemplateColumns: `200px repeat(${properties.length}, minmax(240px, 1fr))`,
                }}
              >
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Comodidades
                </div>
                {properties.map((prop) => (
                  <div key={prop.id} className="space-y-1">
                    {prop.diferenciais.length === 0 ? (
                      <span className="text-slate-400 italic">Nenhum cadastrado</span>
                    ) : (
                      prop.diferenciais.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{tag}</span>
                        </div>
                      ))
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}
