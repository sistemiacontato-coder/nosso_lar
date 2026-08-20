'use client';

import React, { useState } from 'react';
import { useProperties } from '@/hooks/useProperties';
import { Navbar } from '@/components/Navbar';
import { HeaderKPIs } from '@/components/HeaderKPIs';
import { FilterBar } from '@/components/FilterBar';
import { PropertyGrid } from '@/components/PropertyGrid';
import { PropertyTableView } from '@/components/PropertyTableView';
import { PropertyFormModal } from '@/components/PropertyFormModal';
import { PropertyDetailModal } from '@/components/PropertyDetailModal';
import { PropertyComparisonModal } from '@/components/PropertyComparisonModal';
import { LoginModal } from '@/components/LoginModal';
import { Property } from '@/types/property';
import { PropertyFormValues } from '@/lib/schemas';
import { Home } from 'lucide-react';

function DashboardContent() {
  const {
    properties,
    filteredProperties,
    totalCount,
    filteredCount,
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
    updateProperty,
    quickUpdateProperty,
    deleteProperty,
    duplicateProperty,
    updateStatus,
    toggleFavorite,
    resetToSampleData,
    kpis,
  } = useProperties();

  // DEFAULT VIEW MODE: TABLE / LIST (AS REQUESTED)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);

  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

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

  const handleFormSubmit = (values: PropertyFormValues) => {
    if (editingProperty) {
      updateProperty(editingProperty.id, values);
    } else {
      addProperty(values);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este imóvel?')) {
      deleteProperty(id);
      if (detailProperty?.id === id) {
        setIsDetailOpen(false);
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-500/30">
            <Home className="h-6 w-6" />
          </div>
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Carregando Nosso Lar...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation Bar */}
      <Navbar
        onOpenNewProperty={handleOpenNew}
        onOpenComparison={() => setIsComparisonOpen(true)}
        compareCount={selectedForComparison.length}
        totalCount={totalCount}
      />

      {/* Login Dialog */}
      <LoginModal />

      {/* Main SaaS Width Container (Estilo Notion / Gmail / SaaS Moderno: max-w-[1600px]) */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top KPIs Summary */}
        <HeaderKPIs kpis={kpis} onSelectProperty={handleSelectDetails} />

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

        {/* View Mode Switching: Cards Grid vs Table (Default is Table Mode) */}
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
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleFavorite={toggleFavorite}
            onStatusChange={updateStatus}
            onSelectDetails={handleSelectDetails}
            selectedForComparison={selectedForComparison}
            onToggleCompare={toggleComparison}
            onQuickUpdateProperty={quickUpdateProperty}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-[1600px] w-full mx-auto px-4 flex items-center justify-between">
          <span>Nosso Lar © {new Date().getFullYear()} — Dashboard de Decisão do Casal Saymon & Kelly 💑</span>
          <span className="text-slate-400">Desenvolvido sob medida para a melhor escolha de aluguel.</span>
        </div>
      </footer>

      {/* Form Modal (Create / Edit) */}
      <PropertyFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={editingProperty}
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
        onRemoveFromCompare={toggleComparison}
        onClearAll={clearComparison}
        onEdit={handleEdit}
      />
    </div>
  );
}

export default function HomePage() {
  return <DashboardContent />;
}
