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
import { SettingsModal } from '@/components/SettingsModal';
import { RealtorModal } from '@/components/RealtorModal';
import { CommuteAnchorsModal } from '@/components/CommuteAnchorsModal';
import { Footer } from '@/components/Footer';
import { Property } from '@/types/property';
import { PropertyFormValues } from '@/lib/schemas';

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
    resetToSampleData,
    kpis,
  } = useProperties();

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* Universal Top Header Navigation */}
      <Navbar
        onOpenNewProperty={handleOpenNew}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRealtorModal={() => setIsRealtorOpen(true)}
        sugestoesCount={sugestoesCount}
      />

      {/* Settings Modal */}
      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

      {/* Realtor Modal */}
      <RealtorModal
        open={isRealtorOpen}
        onOpenChange={setIsRealtorOpen}
        onSubmitSuggestion={addRealtorSuggestion}
        existingProperties={properties}
      />

      {/* Commute Anchors Modal */}
      <CommuteAnchorsModal
        open={isCommuteModalOpen}
        onOpenChange={setIsCommuteModalOpen}
      />

      {/* Main SaaS Width Container */}
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
            properties={properties}
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
      </main>

      {/* Footer */}
      <Footer />

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
