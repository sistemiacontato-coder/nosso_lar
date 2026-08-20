'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ExternalLink,
  Heart,
  Edit2,
  Trash2,
  Copy,
  Bed,
  Bath,
  Car,
  Maximize2,
  Clock,
  Navigation,
  Star,
  MoreVertical,
  Check,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Property, PropertyStatus, STATUS_CONFIG, getCoupleMatchBadge } from '@/types/property';
import { formatCurrency, formatCurrencyPerM2, formatCommute, formatDistance } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onStatusChange: (id: string, status: PropertyStatus) => void;
  onSelectDetails: (property: Property) => void;
  isSelectedForCompare: boolean;
  onToggleCompare: (id: string) => void;
}

export function PropertyCard({
  property,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onStatusChange,
  onSelectDetails,
  isSelectedForCompare,
  onToggleCompare,
}: PropertyCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const statusInfo = STATUS_CONFIG[property.status] || STATUS_CONFIG['Em Análise'];
  const coupleBadge = getCoupleMatchBadge(property.notaSaymon, property.notaKelly);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!property.isFavorito) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#ec4899', '#f43f5e', '#ef4444'],
        });
      } catch (err) {}
    }
    onToggleFavorite(property.id);
  };

  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCompare(property.id);
  };

  return (
    <div
      onClick={() => onSelectDetails(property)}
      className={`group relative flex flex-col justify-between rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer overflow-hidden ${
        isSelectedForCompare
          ? 'border-blue-500 ring-2 ring-blue-500/30'
          : 'border-slate-200/80 dark:border-slate-800/80 hover:border-blue-400/50 dark:hover:border-blue-600/50'
      }`}
    >
      {/* Top Media / Image Area */}
      <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {property.urlImagem && !imageError ? (
          <Image
            src={property.urlImagem}
            alt={property.titulo}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-400">
            <Building className="h-10 w-10 mb-1 opacity-50" />
            <span className="text-xs font-medium">Sem foto cadastrada</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/30 pointer-events-none" />

        {/* Top Floating Badges & Action Buttons */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-md shadow-sm border ${statusInfo.bg} ${statusInfo.border} ${statusInfo.text}`}
            >
              {statusInfo.label}
            </span>
            {coupleBadge && (
              <span
                className={`hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-md shadow-sm border ${coupleBadge.bg} ${coupleBadge.border} ${coupleBadge.color}`}
              >
                {coupleBadge.label}
              </span>
            )}
          </div>

          {/* Quick Right Buttons */}
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {/* Compare Checkbox Pill */}
            <button
              onClick={handleCompareClick}
              title={isSelectedForCompare ? 'Remover da comparação' : 'Adicionar à comparação'}
              className={`flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium backdrop-blur-md transition-all shadow-sm ${
                isSelectedForCompare
                  ? 'bg-blue-600 text-white shadow-blue-500/30'
                  : 'bg-black/40 text-white/90 hover:bg-black/60'
              }`}
            >
              {isSelectedForCompare ? <Check className="h-3 w-3" /> : null}
              <span>{isSelectedForCompare ? 'Comparando' : 'Comparar'}</span>
            </button>

            {/* Favorite Button */}
            <button
              onClick={handleFavoriteClick}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-all shadow-sm"
              title={property.isFavorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              aria-label="Favoritar imóvel"
            >
              <Heart
                className={`h-4 w-4 transition-transform active:scale-125 ${
                  property.isFavorito ? 'fill-rose-500 text-rose-500' : 'text-white'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Bottom Floating Title / Bairro on Image */}
        <div className="absolute bottom-2.5 left-3 right-3 text-white pointer-events-none">
          <span className="inline-block rounded bg-black/50 backdrop-blur-sm px-2 py-0.5 text-[11px] font-medium text-slate-200">
            {property.bairro}
          </span>
          <h3 className="text-sm font-semibold truncate text-white mt-1 drop-shadow-sm">
            {property.titulo}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price Header */}
          <div className="flex items-baseline justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Custo Total Mensal
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {formatCurrency(property.custoTotalMensal)}
                </span>
                <span className="text-xs text-slate-400">/mês</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {formatCurrencyPerM2(property.precoMetroQuadrado)}
              </span>
              <span className="text-[10px] text-slate-400 block">
                Aluguel {formatCurrency(property.valorAluguel)}
              </span>
            </div>
          </div>

          {/* Key Specs Pills */}
          <div className="grid grid-cols-4 gap-1.5 py-1 text-center mb-3">
            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                <Bed className="h-3.5 w-3.5 text-blue-500" />
                <span>{property.dormitorios}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {property.suites > 0 ? `${property.suites} suíte` : 'quartos'}
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                <Bath className="h-3.5 w-3.5 text-blue-500" />
                <span>{property.banheiros}</span>
              </div>
              <span className="text-[10px] text-slate-400">banheiros</span>
            </div>

            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                <Car className="h-3.5 w-3.5 text-blue-500" />
                <span>{property.vagasGaragem}</span>
              </div>
              <span className="text-[10px] text-slate-400">vagas</span>
            </div>

            <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                <Maximize2 className="h-3.5 w-3.5 text-blue-500" />
                <span>{property.areaUtil}</span>
              </div>
              <span className="text-[10px] text-slate-400">m² úteis</span>
            </div>
          </div>

          {/* Commute & Logistics */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 py-1.5 px-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 mb-3">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              <span>{formatCommute(property.tempoAteTrabalhoMinutos)} até o trab.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Navigation className="h-3.5 w-3.5 text-emerald-500" />
              <span>{formatDistance(property.distanciaMetroKm)} metrô/trem</span>
            </div>
          </div>

          {/* SAYMON & KELLY MINI REVIEW PILLS */}
          <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-3">
            {/* Saymon */}
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1">
                <span className="font-bold text-blue-700 dark:text-blue-300">🧔 Saymon:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {property.notaSaymon}⭐
                </span>
              </div>
              {property.vereditoSaymon && (
                <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-1.5 py-0.2 rounded">
                  {property.vereditoSaymon}
                </span>
              )}
            </div>

            {/* Kelly */}
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1">
                <span className="font-bold text-rose-700 dark:text-rose-300">👩 Kelly:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {property.notaKelly}⭐
                </span>
              </div>
              {property.vereditoKelly && (
                <span className="text-[9px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-1.5 py-0.2 rounded">
                  {property.vereditoKelly}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer: Media Casal & Action Buttons */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 mt-1">
          {/* Couple Average Rating */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
              Média {property.mediaCasal}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <a
              href={property.urlAnuncio}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
              title="Abrir anúncio original"
            >
              <ExternalLink className="h-4 w-4" />
            </a>

            <button
              onClick={() => onEdit(property)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
              title="Editar dados e opiniões"
            >
              <Edit2 className="h-4 w-4" />
            </button>

            {/* Quick Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
                title="Mais opções"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 bottom-full mb-1 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-30 animate-fade-in text-xs">
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase text-slate-400">
                      Alterar Status
                    </div>
                    {(
                      [
                        'Em Análise',
                        'Visita Agendada',
                        'Visitado',
                        'Favorito',
                        'Descartado',
                      ] as PropertyStatus[]
                    ).map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          onStatusChange(property.id, status);
                          setShowMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between ${
                          property.status === status
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>{status}</span>
                        {property.status === status && <Check className="h-3 w-3" />}
                      </button>
                    ))}

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    <button
                      onClick={() => {
                        onDuplicate(property.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                    >
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      <span>Duplicar Imóvel</span>
                    </button>

                    <button
                      onClick={() => {
                        onDelete(property.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center gap-1.5"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
