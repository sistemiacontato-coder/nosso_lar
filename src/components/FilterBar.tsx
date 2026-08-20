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
  Filter,
  Check,
  Sparkles,
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

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status });
  };

  const handleToggleFavorite = () => {
    onFilterChange({ ...filters, apenasFavoritos: !filters.apenasFavoritos });
  };

  const handleToggleMatchPerfeito = () => {
    onFilterChange({ ...filters, apenasMatchPerfeito: !filters.apenasMatchPerfeito });
  };

  const handleToggleDifferential = (tag: string) => {
    const exists = filters.diferenciais.includes(tag);
    const updated = exists
      ? filters.diferenciais.filter((d) => d !== tag)
      : [...filters.diferenciais, tag];
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
    filters.diferenciais.length > 0 ||
    filters.apenasFavoritos ||
    filters.apenasMatchPerfeito ||
    filters.tempoMaxTrabalho;

  return (
    <div className="space-y-4 mb-6">
      {/* Top Filter Row: Search, Quick Status Pills, View Switcher & Actions */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Buscar por bairro, título, observações, Saymon ou Kelly..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-10 pr-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm h-11 text-sm rounded-xl"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Action Controls: Match do Casal, Favoritos, Sort, Advanced, View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Match do Casal Filter */}
          <Button
            variant={filters.apenasMatchPerfeito ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggleMatchPerfeito}
            className={`h-11 rounded-xl px-3 transition-colors ${
              filters.apenasMatchPerfeito
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20 shadow-md'
                : 'text-slate-700 dark:text-slate-300 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <Sparkles className="h-4 w-4 mr-1.5 text-rose-500" />
            <span className="text-xs sm:text-sm font-semibold">Match do Casal 💖</span>
          </Button>

          {/* Favorites filter toggle */}
          <Button
            variant={filters.apenasFavoritos ? 'destructive' : 'outline'}
            size="sm"
            onClick={handleToggleFavorite}
            className={`h-11 rounded-xl px-3 transition-colors ${
              filters.apenasFavoritos
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <Heart
              className={`h-4 w-4 mr-1.5 ${
                filters.apenasFavoritos ? 'fill-current' : 'text-slate-400'
              }`}
            />
            <span className="text-xs sm:text-sm">Favoritos</span>
          </Button>

          {/* Sort Selector */}
          <div className="relative flex items-center">
            <select
              value={sortKey}
              onChange={(e) => onSortChange(e.target.value as PropertySortKey)}
              className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-8 pr-8 text-xs sm:text-sm font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="mediaCasal_desc">Média do Casal (Maior)</option>
              <option value="notaSaymon_desc">Preferidos do Saymon 🧔</option>
              <option value="notaKelly_desc">Preferidos da Kelly 👩</option>
              <option value="precoTotal_asc">Menor Custo Total</option>
              <option value="precoTotal_desc">Maior Custo Total</option>
              <option value="precoM2_asc">Menor R$/m²</option>
              <option value="tempoSaymon_asc">Mais Perto do Saymon 🧔</option>
              <option value="tempoKelly_asc">Mais Perto da Kelly 👩</option>
              <option value="mediaTempo_asc">Menor Média Deslocamento 💑</option>
              <option value="area_desc">Maior Área (m²)</option>
              <option value="recente_desc">Mais Recentes</option>
            </select>
            <ArrowUpDown className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Toggle Advanced Filters Button */}
          <Button
            variant={showAdvanced || hasActiveFilters ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="h-11 rounded-xl px-3 relative"
          >
            <SlidersHorizontal className="h-4 w-4 mr-1.5 text-slate-500 dark:text-slate-400" />
            <span className="text-xs sm:text-sm">Filtros</span>
            {hasActiveFilters && (
              <span className="ml-1.5 flex h-2 w-2 rounded-full bg-blue-600" />
            )}
          </Button>

          {/* View Mode Toggle: Grid vs Table */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Visualização em Cards"
              aria-label="Visualização em Cards"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="Visualização em Tabela"
              aria-label="Visualização em Tabela"
            >
              <Table className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Status Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <button
          onClick={() => handleStatusChange('todos')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            filters.status === 'todos'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Todos ({totalOverall})
        </button>

        {(['Para Analisar', 'Agendar Visita', 'Visita Agendada', 'Pendente Avaliação', 'Proposta Enviada', 'Descartado'] as PropertyStatus[]).map(
          (status) => {
            const isSelected = filters.status === status;
            return (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap border ${
                  isSelected
                    ? `${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].border} ${STATUS_CONFIG[status].text} font-semibold shadow-sm`
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                {status}
              </button>
            );
          }
        )}

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline ml-2 whitespace-nowrap flex items-center gap-1 font-medium"
          >
            <X className="h-3 w-3" /> Limpar filtros
          </button>
        )}
      </div>

      {/* Advanced Filter Panel */}
      {showAdvanced && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Filtros Avançados
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Exibindo {totalFiltered} de {totalOverall} imóveis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Custo Total Máximo */}
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">
                Custo Total Máximo (R$)
              </label>
              <Input
                type="number"
                placeholder="Ex: 5000"
                value={filters.precoMax || ''}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    precoMax: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="h-9"
              />
            </div>

            {/* Mínimo de Quartos */}
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">
                Mínimo de Quartos
              </label>
              <select
                value={filters.dormitoriosMin || ''}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    dormitoriosMin: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="">Qualquer quantidade</option>
                <option value="1">1+ quarto</option>
                <option value="2">2+ quartos</option>
                <option value="3">3+ quartos</option>
                <option value="4">4+ quartos</option>
              </select>
            </div>

            {/* Mínimo de Vagas */}
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">
                Mínimo de Vagas
              </label>
              <select
                value={filters.vagasMin || ''}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    vagasMin: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="">Qualquer quantidade</option>
                <option value="1">1+ vaga</option>
                <option value="2">2+ vagas</option>
                <option value="3">3+ vagas</option>
              </select>
            </div>

            {/* Tempo Máximo até o Trabalho */}
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5 block">
                Tempo Máximo ao Trabalho
              </label>
              <select
                value={filters.tempoMaxTrabalho || ''}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    tempoMaxTrabalho: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="">Sem limite de tempo</option>
                <option value="15">Até 15 minutos</option>
                <option value="30">Até 30 minutos</option>
                <option value="45">Até 45 minutos</option>
                <option value="60">Até 1 hora</option>
              </select>
            </div>
          </div>

          {/* Differentials Multi-Select Tags */}
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2 block">
              Diferenciais Desejados (exige todos os selecionados):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_DIFFERENTIALS.map((tag) => {
                const isSelected = filters.diferenciais.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleDifferential(tag)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    {tag}
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
