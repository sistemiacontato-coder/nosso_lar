'use client';

import React from 'react';
import { Property, PropertyStatus } from '@/types/property';
import { PropertyCard } from './PropertyCard';
import { Button } from './ui/button';
import { Building2, Plus, ArrowLeftRight, Sparkles, X } from 'lucide-react';

interface PropertyGridProps {
  properties: Property[];
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onStatusChange: (id: string, status: PropertyStatus) => void;
  onSelectDetails: (property: Property) => void;
  selectedForComparison: string[];
  onToggleCompare: (id: string) => void;
  onOpenNewProperty: () => void;
  onOpenComparison: () => void;
  onClearComparison: () => void;
  onResetData: () => void;
}

export function PropertyGrid({
  properties,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onStatusChange,
  onSelectDetails,
  selectedForComparison,
  onToggleCompare,
  onOpenNewProperty,
  onOpenComparison,
  onClearComparison,
  onResetData,
}: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center my-8 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4">
          <Building2 className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Nenhum imóvel encontrado
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          Tente ajustar os filtros de busca ou cadastre um novo imóvel para começar a comparar.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <Button onClick={onOpenNewProperty} className="shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Cadastrar Imóvel
          </Button>
          <Button variant="outline" onClick={onResetData}>
            <Sparkles className="mr-1.5 h-4 w-4 text-amber-500" />
            Restaurar Exemplos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onToggleFavorite={onToggleFavorite}
            onStatusChange={onStatusChange}
            onSelectDetails={onSelectDetails}
            isSelectedForCompare={selectedForComparison.includes(property.id)}
            onToggleCompare={onToggleCompare}
          />
        ))}
      </div>

      {/* Floating Comparison Bar when items are selected */}
      {selectedForComparison.length > 0 && (
        <div className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-8 z-40 animate-slide-in-right">
          <div className="flex items-center gap-3 rounded-2xl border border-blue-200 dark:border-blue-800 bg-white/95 dark:bg-slate-900/95 px-5 py-3.5 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                {selectedForComparison.length}
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  {selectedForComparison.length === 1
                    ? '1 imóvel selecionado'
                    : `${selectedForComparison.length} imóveis selecionados`}
                </span>
                <span className="text-[11px] text-slate-400">
                  (Selecione até 4 para comparar)
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            <Button
              onClick={onOpenComparison}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20"
            >
              <ArrowLeftRight className="mr-1.5 h-4 w-4" />
              Comparar Agora
            </Button>

            <button
              onClick={onClearComparison}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Limpar seleção"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
