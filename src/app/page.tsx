'use client';

import React, { useState, useEffect } from 'react';
import { useProperties } from '@/hooks/useProperties';
import { Navbar } from '@/components/Navbar';
import { FilterBar } from '@/components/FilterBar';
import { PropertyGrid } from '@/components/PropertyGrid';
import { PropertyTableView } from '@/components/PropertyTableView';
import { PropertyFormModal } from '@/components/PropertyFormModal';
import { PropertyDetailModal } from '@/components/PropertyDetailModal';
import { PropertyComparisonModal } from '@/components/PropertyComparisonModal';
import { LoginModal } from '@/components/LoginModal';
import { SettingsModal } from '@/components/SettingsModal';
import { RealtorModal } from '@/components/RealtorModal';
import { CommuteAnchorsModal, getStoredCommuteAnchors, DEFAULT_COMMUTE_ANCHORS } from '@/components/CommuteAnchorsModal';
import { Footer } from '@/components/Footer';
import { Property, CommuteAnchors, getCoupleMatchBadge } from '@/types/property';
import { PropertyFormValues } from '@/lib/schemas';
import { formatCurrency } from '@/lib/utils';
import { Building, Heart, MapPin, Sparkles, TrendingDown, Clock, Plus, ArrowRight, User } from 'lucide-react';

import { AppSidebar } from '@/components/AppSidebar';

function DashboardContent() {
  const {
    properties,
    nossosImoveis,
    sugestoesCorretores,
    filteredProperties,
    totalCount,
    filteredCount,
    sugestoesCount,
    isLoaded,
    filters,
    setFilters,
    sortKey,
    setSortKey,
    selectedForComparison,
    comparisonProperties,
    toggleComparison,
    clearComparison,
    addProperty,
    addRealtorSuggestion,
    approveSuggestion,
    updateProperty,
    quickUpdateProperty,
    deleteProperty,
    duplicateProperty,
    updateStatus,
    toggleFavorite,
    toggleArchiveProperty,
    recalculateCommuteTimes,
    resetToSampleData,
    clearAllRatingsAndStatus,
    kpis,
  } = useProperties();

  // Navigation Tab: 'painel' (Dashboard) vs 'imoveis' (Properties List)
  const [mainTab, setMainTab] = useState<'painel' | 'imoveis'>('painel');

  // DEFAULT VIEW MODE: TABLE / LIST
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);

  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRealtorOpen, setIsRealtorOpen] = useState(false);
  const [isCommuteModalOpen, setIsCommuteModalOpen] = useState(false);

  const [anchors, setAnchors] = useState<CommuteAnchors>(DEFAULT_COMMUTE_ANCHORS);

  useEffect(() => {
    setAnchors(getStoredCommuteAnchors());
  }, [isCommuteModalOpen]);

  const handleSaveCommuteAnchors = (newAnchors: CommuteAnchors) => {
    setAnchors(newAnchors);
    recalculateCommuteTimes(newAnchors);
  };

  // Handlers
  const handleOpenNew = () => {
    setEditingProperty(null);
    setIsFormOpen(true);
  };

  const handleEdit = (prop: Property) => {
    setEditingProperty(prop);
    setIsFormOpen(true);
  };

  const handleSelectDetails = (prop: Property) => {
    setDetailProperty(prop);
    setIsDetailOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      deleteProperty(id);
      if (detailProperty?.id === id) {
        setIsDetailOpen(false);
        setDetailProperty(null);
      }
    }
  };

  const handleFormSubmit = (data: PropertyFormValues) => {
    if (editingProperty) {
      updateProperty(editingProperty.id, data);
    } else {
      addProperty(data);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* Collapsible Left Sidebar Menu with (< >) Toggle */}
      <AppSidebar
        activeTab={mainTab}
        onTabChange={setMainTab}
        onOpenNewProperty={handleOpenNew}
        onOpenCommuteAnchorsModal={() => setIsCommuteModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        totalCount={totalCount}
        sugestoesCount={sugestoesCount}
      />

      {/* Main Right Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navigation Bar */}
        <Navbar
          activeTab={mainTab}
          onTabChange={setMainTab}
          onOpenNewProperty={handleOpenNew}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCommuteAnchorsModal={() => setIsCommuteModalOpen(true)}
          sugestoesCount={sugestoesCount}
          totalCount={totalCount}
          compareCount={selectedForComparison.length}
        />

        {/* MAIN VIEW SWITCH: PAINEL (Dashboard) vs IMÓVEIS (List) */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {mainTab === 'painel' ? (
          /* ======================================================== */
          /* ABA 1: PAINEL / DASHBOARD                                */
          /* ======================================================== */
          <div className="space-y-6 animate-fade-in">

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Imóveis */}
              <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Total de Imóveis</span>
                  <Building className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{kpis.total}</span>
                  <span className="text-xs text-slate-400">cadastrados</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {sugestoesCount} sugestões de corretores pendentes
                </p>
              </div>

              {/* Card 2: Média Custo Mensal */}
              <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-extrabold uppercase tracking-wider">Média Custo Mensal</span>
                  <TrendingDown className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    R$ {kpis.mediaCusto.toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Aluguel + Condomínio + IPTU
                </p>
              </div>

              {/* Card 3: Top Match do Casal */}
              {kpis.topCasalMatch ? (
                <div
                  onClick={() => handleSelectDetails(kpis.topCasalMatch!)}
                  className="rounded-2xl p-5 bg-gradient-to-br from-rose-50/90 to-pink-50/90 dark:from-rose-950/40 dark:to-pink-950/40 border border-rose-200 dark:border-rose-900/60 shadow-md space-y-2 cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center justify-between text-rose-700 dark:text-rose-300">
                    <span className="text-xs font-extrabold uppercase tracking-wider">Top Match do Casal</span>
                    <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {kpis.topCasalMatch.titulo}
                    </h4>
                    <p className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                      Nota Média: {kpis.topCasalMatch.mediaCasal} / 5 ⭐
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-2">Top Match</span>
                  <p className="text-xs text-slate-500">Cadastre notas para ver o favorito do casal.</p>
                </div>
              )}

              {/* Card 4: Menor Custo Mensal */}
              {kpis.menorCustoTotal ? (
                <div
                  onClick={() => handleSelectDetails(kpis.menorCustoTotal!)}
                  className="rounded-2xl p-5 bg-gradient-to-br from-emerald-50/90 to-teal-50/90 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-900/60 shadow-md space-y-2 cursor-pointer hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
                    <span className="text-xs font-extrabold uppercase tracking-wider">Menor Aluguel Mensal</span>
                    <Sparkles className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                      {kpis.menorCustoTotal.titulo}
                    </h4>
                    <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(kpis.menorCustoTotal.custoTotalMensal)}/mês
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-2">Menor Custo</span>
                  <p className="text-xs text-slate-500">Nenhum imóvel disponível.</p>
                </div>
              )}
            </div>

            {/* Endereços Fixos de Interesse Card */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold">
                    📍
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Endereços Fixos de Interesse (Perfil Saymon & Kelly)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Utilizados como base padrão para cálculo automático de distância e trânsito em horário de pico.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCommuteModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold hover:bg-indigo-100 transition-colors"
                >
                  ⚙️ Gerenciar Endereços Fixos
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Saymon Address */}
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                    <User className="h-4 w-4 text-amber-600" />
                    <span>Perfil Saymon</span>
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <p className="truncate">
                      <strong>Endereço:</strong> {anchors.saymonAddress1 || 'Não cadastrado'}
                    </p>
                    {anchors.saymonAddress1 && (
                      <p className="text-[11px] text-amber-900/70 dark:text-amber-300/70 flex items-center gap-1 mt-0.5 font-medium">
                        <Clock className="h-3 w-3 text-amber-600" /> Saída: <strong>{anchors.saymonTime || '08:00'}</strong>
                      </p>
                    )}
                  </div>
                </div>

                {/* Kelly Address */}
                <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
                    <User className="h-4 w-4 text-rose-600" />
                    <span>Perfil Kelly</span>
                  </div>
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <p className="truncate">
                      <strong>Endereço:</strong> {anchors.kellyAddress1 || 'Não cadastrado'}
                    </p>
                    {anchors.kellyAddress1 && (
                      <p className="text-[11px] text-rose-900/70 dark:text-rose-300/70 flex items-center gap-1 mt-0.5 font-medium">
                        <Clock className="h-3 w-3 text-rose-600" /> Saída: <strong>{anchors.kellyTime || '08:00'}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* ABA 2: IMÓVEIS (Tabela & Filtros)                        */
          /* ======================================================== */
          <div className="space-y-4 animate-fade-in">
            {/* Filters, Search and Sorting Bar */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              sortKey={sortKey}
              onSortChange={setSortKey}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              totalFiltered={filteredCount}
              totalOverall={totalCount}
            />

            {/* View Mode Switching: Cards Grid vs Table */}
            {viewMode === 'grid' ? (
              <PropertyGrid
                properties={filteredProperties}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={duplicateProperty}
                onToggleFavorite={toggleFavorite}
                onStatusChange={updateStatus}
                onSelectDetails={handleSelectDetails}
                selectedForComparison={selectedForComparison}
                onToggleCompare={toggleComparison}
                onOpenNewProperty={handleOpenNew}
                onOpenComparison={() => setIsComparisonOpen(true)}
                onClearComparison={clearComparison}
                onResetData={resetToSampleData}
              />
            ) : (
              <PropertyTableView
                properties={filteredProperties}
                allProperties={properties}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={toggleFavorite}
                onStatusChange={updateStatus}
                onSelectDetails={handleSelectDetails}
                selectedForComparison={selectedForComparison}
                onToggleCompare={toggleComparison}
                onQuickUpdateProperty={quickUpdateProperty}
                onApproveSuggestion={approveSuggestion}
                onOpenRealtorModal={() => setIsRealtorOpen(true)}
                onOpenCommuteAnchorsModal={() => setIsCommuteModalOpen(true)}
                onToggleArchive={toggleArchiveProperty}
              />
            )}
          </div>
        )}
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Full Screen / Modal Login Screen */}
      <LoginModal />

      {/* Settings Modal */}
      <SettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onClearRatings={clearAllRatingsAndStatus}
      />

      {/* Realtor Modal */}
      <RealtorModal
        open={isRealtorOpen}
        onOpenChange={setIsRealtorOpen}
        onSubmitSuggestion={addRealtorSuggestion}
        existingProperties={properties}
      />

      {/* Commute Anchors Modal (Perfil do Casal) */}
      <CommuteAnchorsModal
        open={isCommuteModalOpen}
        onOpenChange={setIsCommuteModalOpen}
        onSave={handleSaveCommuteAnchors}
      />

      {/* Form Modal (Create / Edit) */}
      <PropertyFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={editingProperty}
        existingProperties={properties}
      />

      {/* Detail Modal */}
      <PropertyDetailModal
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        property={detailProperty}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleFavorite={toggleFavorite}
        onStatusChange={updateStatus}
      />

      {/* Comparison Modal */}
      <PropertyComparisonModal
        open={isComparisonOpen}
        onOpenChange={setIsComparisonOpen}
        properties={comparisonProperties}
        onEdit={handleEdit}
        onRemoveFromCompare={toggleComparison}
        onClearAll={clearComparison}
      />
    </div>
  );
}

export default function HomePage() {
  return <DashboardContent />;
}
