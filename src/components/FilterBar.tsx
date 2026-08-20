'use client';

import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  Table,
  Heart,
  X,
  Sparkles,
  Filter,
} from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  AVAILABLE_DIFFERENTIALS,
  PropertyFilters,
  PropertySortKey,
  PropertyStatus,
  STATUS_CONFIG,
} from '@/types/property';

interface FilterBarProps {
  filters: PropertyFilters;
  onFilterChange: (filters: PropertyFilters) => void;
  sortKey: PropertySortKey;
  onSortChange: (sortKey: PropertySortKey) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  totalFiltered: number;
  totalOverall: number;
}

export function FilterBar({
  filters,
  onFilterChange,
  sortKey,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalFiltered,
  totalOverall,
}: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (status: PropertyStatus | 'todos') => {
    onFilterChange({ ...filters, status });
  };

  const handleToggleFavorite = () => {
    onFilterChange({ ...filters, apenasFavoritos: !filters.apenasFavoritos });
  };

  const handleToggleMatchPerfeito = () => {
    onFilterChange({ ...filters, apenasMatchPerfeito: !filters.apenasMatchPerfeito });
  };

  const handleToggleDifferential = (tag: string) => {
    const list = filters.diferenciais || [];
    const exists = list.includes(tag);
    const updated = exists ? list.filter((d) => d !== tag) : [...list, tag];
    onFilterChange({ ...filters, diferenciais: updated });
  };

  const clearAllFilters = () => {
    onFilterChange({
      search: '',
      status: 'todos',
      precoMax: undefined,
      dormitoriosMin: undefined,
      vagasMin: undefined,
      diferenciais: [],
      apenasFavoritos: false,
      apenasMatchPerfeito: false,
      tempoMaxTrabalho: undefined,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== 'todos' ||
    filters.precoMax ||
    filters.dormitoriosMin ||
    filters.vagasMin ||
    (filters.diferenciais?.length || 0) > 0 ||
    filters.apenasFavoritos ||
    filters.apenasMatchPerfeito ||
    filters.tempoMaxTrabalho;

  return (
    <div className="space-y-3 mb-4">
      {/* 🚀 SINGLE ROW ELEGANT TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
        {/* Left Section: Search Input + Status Select */}
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por bairro, título, obs..."
              value={filters.search}
              onChange={handleSearchChange}
              className="pl-8 pr-7 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-9 text-xs rounded-xl"
            />
            {filters.search && (
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, search: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Dropdown Selector */}
          <select
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value as any)}
            className="h-9 appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs focus:outline-none shrink-0"
          >
            <option value="todos">Todos os Status ({totalOverall})</option>
            <option value="Para Analisar">Para Analisar</option>
            <option value="Agendar Visita">Agendar Visita</option>
            <option value="Visita Agendada">Visita Agendada</option>
            <option value="Pendente Avaliação">Pendente Avaliação</option>
            <option value="Proposta Enviada">Proposta Enviada</option>
            <option value="Descartado">Descartado</option>
          </select>
        </div>

        {/* Center & Right Section: Toggles, Sort, Advanced Filters, View Switcher */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {/* Match do Casal Toggle Button */}
          <button
            type="button"
            onClick={handleToggleMatchPerfeito}
            className={`h-9 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filters.apenasMatchPerfeito
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50/60 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80 hover:bg-rose-100'
            }`}
            title="Filtrar imóveis aprovados por ambos"
          >
            <Sparkles className="h-3.5 w-3.5 text-rose-500" />
            <span>Match 💖</span>
          </button>

          {/* Favoritos Toggle Button */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`h-9 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filters.apenasFavoritos
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
            title="Filtrar favoritos"
          >
            <Heart className={`h-3.5 w-3.5 ${filters.apenasFavoritos ? 'fill-current' : 'text-slate-400'}`} />
            <span>Favoritos</span>
          </button>

          {/* Sort Selector */}
          <div className="relative flex items-center">
            <select
              value={sortKey}
              onChange={(e) => onSortChange(e.target.value as PropertySortKey)}
              className="h-9 appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-7 pr-3 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs focus:outline-none"
            >
              <option value="mediaCasal_desc">Ordenar: Média do Casal</option>
              <option value="notaSaymon_desc">Preferidos do Saymon 🧔</option>
              <option value="notaKelly_desc">Preferidos da Kelly 👩</option>
              <option value="precoTotal_asc">Menor Custo Total</option>
              <option value="precoTotal_desc">Maior Custo Total</option>
              <option value="precoM2_asc">Menor R$/m²</option>
              <option value="tempoSaymon_asc">Mais Perto do Saymon 🧔</option>
              <option value="tempoKelly_asc">Mais Perto da Kelly 👩</option>
              <option value="mediaTempo_asc">Menor Deslocamento 💑</option>
              <option value="area_desc">Maior Área (m²)</option>
              <option value="recente_desc">Mais Recentes</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
          </div>

          {/* Toggle Advanced Filters Drawer Button */}
          <Button
            variant={showAdvanced || hasActiveFilters ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="h-9 rounded-xl px-3 text-xs font-bold relative"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 mr-1 text-slate-500" />
            <span>Filtros</span>
            {hasActiveFilters && <span className="ml-1 flex h-2 w-2 rounded-full bg-indigo-600" />}
          </Button>

          {/* Clear Filters CTA */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="h-9 px-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
              title="Limpar todos os filtros"
            >
              <X className="h-3.5 w-3.5" />
              <span>Limpar</span>
            </button>
          )}

          {/* View Mode Toggle: Grid vs Table */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 p-0.5 ml-1">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Visualização em Tabela"
            >
              <Table className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filter Drawer (Opens on clicking Filtros) */}
      {showAdvanced && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-indigo-600" />
              Filtros Avançados
            </span>
            <button
              type="button"
              onClick={() => setShowAdvanced(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Fechar ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Teto de Custo Total */}
            <div className="space-y-1">
              <label className="font-bold text-slate-600 dark:text-slate-400">
                Teto Custo Total (Aluguel+Cond+IPTU)
              </label>
              <select
                value={filters.precoMax || ''}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    precoMax: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="">Sem limite de preço</option>
                <option value="4000">Até R$ 4.000 / mês</option>
                <option value="4500">Até R$ 4.500 / mês</option>
                <option value="5000">Até R$ 5.000 / mês (Recomendado)</option>
                <option value="5500">Até R$ 5.500 / mês</option>
                <option value="6000">Até R$ 6.000 / mês</option>
              </select>
            </div>

            {/* Mínimo Dormitórios */}
            <div className="space-y-1">
              <label className="font-bold text-slate-600 dark:text-slate-400">
                Mínimo de Dormitórios
              </label>
              <select
                value={filters.dormitoriosMin || ''}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    dormitoriosMin: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="">Qualquer quantidade</option>
                <option value="2">2+ Quartos</option>
                <option value="3">3+ Quartos (Recomendado)</option>
                <option value="4">4+ Quartos</option>
              </select>
            </div>

            {/* Mínimo Vagas */}
            <div className="space-y-1">
              <label className="font-bold text-slate-600 dark:text-slate-400">
                Mínimo de Vagas de Garagem
              </label>
              <select
                value={filters.vagasMin || ''}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    vagasMin: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="">Qualquer quantidade</option>
                <option value="1">1+ Vaga</option>
                <option value="2">2+ Vagas (Recomendado)</option>
              </select>
            </div>

            {/* Máximo Deslocamento */}
            <div className="space-y-1">
              <label className="font-bold text-slate-600 dark:text-slate-400">
                Máximo Média Deslocamento
              </label>
              <select
                value={filters.tempoMaxTrabalho || ''}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    tempoMaxTrabalho: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="">Qualquer tempo</option>
                <option value="20">Até 20 minutos</option>
                <option value="30">Até 30 minutos</option>
                <option value="45">Até 45 minutos</option>
              </select>
            </div>
          </div>

          {/* Diferenciais Pills */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 block">
              Diferenciais do Imóvel:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_DIFFERENTIALS.map((tag) => {
                const isSelected = (filters.diferenciais || []).includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleDifferential(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {tag} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
