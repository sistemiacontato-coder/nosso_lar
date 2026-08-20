'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ExternalLink,
  Edit2,
  Trash2,
  Heart,
  CheckSquare,
  Square,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Building,
  Check,
  Sparkles,
} from 'lucide-react';
import { Property, PropertyStatus, STATUS_CONFIG, getCoupleMatchBadge, VereditoSaymon, VereditoKelly } from '@/types/property';
import { formatCurrency, formatCurrencyPerM2, formatCommute } from '@/lib/utils';
import { Button } from './ui/button';

interface PropertyTableViewProps {
  properties: Property[];
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onStatusChange: (id: string, status: PropertyStatus) => void;
  onSelectDetails: (property: Property) => void;
  selectedForComparison: string[];
  onToggleCompare: (id: string) => void;
  onQuickUpdateProperty?: (id: string, updates: Partial<Property>) => void;
}

export function PropertyTableView({
  properties,
  onEdit,
  onDelete,
  onToggleFavorite,
  onStatusChange,
  onSelectDetails,
  selectedForComparison,
  onToggleCompare,
  onQuickUpdateProperty,
}: PropertyTableViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (properties.length === 0) {
    return null;
  }

  const handleUpdate = (id: string, updates: Partial<Property>) => {
    if (onQuickUpdateProperty) {
      onQuickUpdateProperty(id, updates);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden mb-12 animate-fade-in">
      <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-slate-900 dark:text-white">
            Modo Lista Rápida Interativa
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            (Altere notas, vereditos e custos diretamente na tabela sem abrir o modal)
          </span>
        </div>
        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Heart className="h-3 w-3 fill-rose-500" /> Saymon & Kelly
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/80 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-3 w-10 text-center">Comp.</th>
              <th className="py-3 px-3 w-12 text-center">Foto</th>
              <th className="py-3 px-3">Imóvel & Bairro</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Custo Total</th>
              <th className="py-3 px-3">Área & R$/m²</th>
              <th className="py-3 px-3">Dorms/Vagas</th>
              <th className="py-3 px-3">Saymon 🧔 (1-5 ⭐)</th>
              <th className="py-3 px-3">Kelly 👩 (1-5 ⭐)</th>
              <th className="py-3 px-3">Média Casal 💑</th>
              <th className="py-3 px-3 text-right">Ações Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {properties.map((prop) => {
              const isSelected = selectedForComparison.includes(prop.id);
              const isExpanded = expandedId === prop.id;
              const statusCfg = STATUS_CONFIG[prop.status] || STATUS_CONFIG['Em Análise'];
              const coupleBadge = getCoupleMatchBadge(prop.notaSaymon, prop.notaKelly);

              return (
                <React.Fragment key={prop.id}>
                  <tr
                    className={`hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors ${
                      isSelected ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    {/* Checkbox comparison */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleCompare(prop.id)}
                        className="text-slate-400 hover:text-blue-600 transition-colors inline-flex"
                        title={isSelected ? 'Remover da comparação' : 'Comparar'}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>

                    {/* Thumbnail */}
                    <td className="py-3 px-3 text-center">
                      <div className="relative h-10 w-12 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 mx-auto shadow-sm">
                        {prop.urlImagem ? (
                          <Image
                            src={prop.urlImagem}
                            alt={prop.titulo}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <Building className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title & Neighborhood */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <div
                        onClick={() => onSelectDetails(prop)}
                        className="font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                        title={prop.titulo}
                      >
                        {prop.titulo}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {prop.bairro}
                      </div>
                    </td>

                    {/* Quick Status Dropdown */}
                    <td className="py-3 px-3">
                      <select
                        value={prop.status}
                        onChange={(e) => onStatusChange(prop.id, e.target.value as PropertyStatus)}
                        className={`text-[11px] font-semibold rounded-lg px-2 py-1 border transition-all cursor-pointer ${statusCfg.bg} ${statusCfg.border} ${statusCfg.text}`}
                      >
                        <option value="Em Análise">Em Análise</option>
                        <option value="Visita Agendada">Visita Agendada</option>
                        <option value="Visitado">Visitado</option>
                        <option value="Favorito">Favorito</option>
                        <option value="Descartado">Descartado</option>
                      </select>
                    </td>

                    {/* Total Cost */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm block">
                        {formatCurrency(prop.custoTotalMensal)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Aluguel: {formatCurrency(prop.valorAluguel)}
                      </span>
                    </td>

                    {/* Area & R$/m² */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-900 dark:text-slate-200">
                        {prop.areaUtil} m²
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {formatCurrencyPerM2(prop.precoMetroQuadrado)}
                      </div>
                    </td>

                    {/* Specs */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div>{prop.dormitorios} qtos ({prop.suites} suíte{prop.suites > 1 ? 's' : ''})</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{prop.vagasGaragem} vaga{prop.vagasGaragem > 1 ? 's' : ''}</div>
                    </td>

                    {/* SAYMON INLINE RATING (1-5 STARS CLICKABLE) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              const nKelly = prop.notaKelly || 4;
                              const mediaCasal = Number(((star + nKelly) / 2).toFixed(1));
                              handleUpdate(prop.id, {
                                notaSaymon: star,
                                mediaCasal,
                                notaPessoal: mediaCasal,
                              });
                            }}
                            className="p-0.5 text-slate-300 hover:text-amber-400 transition-transform active:scale-125"
                            title={`Dar nota ${star} pelo Saymon`}
                          >
                            <Star
                              className={`h-3.5 w-3.5 ${
                                star <= prop.notaSaymon
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200 dark:text-slate-700'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <select
                        value={prop.vereditoSaymon || 'Gostei'}
                        onChange={(e) =>
                          handleUpdate(prop.id, {
                            vereditoSaymon: e.target.value as VereditoSaymon,
                          })
                        }
                        className="mt-1 text-[10px] rounded px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                      >
                        <option value="Aprovado">Aprovado</option>
                        <option value="Gostei">Gostei</option>
                        <option value="Neutro">Neutro</option>
                        <option value="Não Curti">Não Curti</option>
                      </select>
                    </td>

                    {/* KELLY INLINE RATING (1-5 STARS CLICKABLE) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              const nSaymon = prop.notaSaymon || 4;
                              const mediaCasal = Number(((nSaymon + star) / 2).toFixed(1));
                              handleUpdate(prop.id, {
                                notaKelly: star,
                                mediaCasal,
                                notaPessoal: mediaCasal,
                              });
                            }}
                            className="p-0.5 text-slate-300 hover:text-amber-400 transition-transform active:scale-125"
                            title={`Dar nota ${star} pela Kelly`}
                          >
                            <Star
                              className={`h-3.5 w-3.5 ${
                                star <= prop.notaKelly
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-200 dark:text-slate-700'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <select
                        value={prop.vereditoKelly || 'Gostei'}
                        onChange={(e) =>
                          handleUpdate(prop.id, {
                            vereditoKelly: e.target.value as VereditoKelly,
                          })
                        }
                        className="mt-1 text-[10px] rounded px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                      >
                        <option value="Aprovada">Aprovada</option>
                        <option value="Gostei">Gostei</option>
                        <option value="Neutra">Neutra</option>
                        <option value="Não Curti">Não Curti</option>
                      </select>
                    </td>

                    {/* Casal Media */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                        <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                        <span className="text-sm">{prop.mediaCasal} ⭐</span>
                      </div>
                      {coupleBadge && (
                        <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${coupleBadge.bg} ${coupleBadge.border} ${coupleBadge.color} inline-block mt-0.5`}>
                          {coupleBadge.label}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* Toggle expand drawer */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : prop.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={isExpanded ? 'Recolher notas' : 'Ver/editar comentários'}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>

                        <button
                          onClick={() => onToggleFavorite(prop.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Favoritar"
                        >
                          <Heart
                            className={`h-3.5 w-3.5 ${
                              prop.isFavorito ? 'fill-rose-500 text-rose-500' : ''
                            }`}
                          />
                        </button>

                        <a
                          href={prop.urlAnuncio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          title="Abrir anúncio original"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>

                        <button
                          onClick={() => onEdit(prop)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Editar todos os dados"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => onDelete(prop.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Excluir imóvel"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Quick Edit Row for Opinions & Notes */}
                  {isExpanded && (
                    <tr className="bg-slate-50/90 dark:bg-slate-900/90 animate-fade-in border-b border-slate-200 dark:border-slate-800">
                      <td colSpan={11} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Saymon Quick Notes */}
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-blue-200 dark:border-blue-900/60 shadow-sm space-y-1.5">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
                              🧔 Opinião do Saymon:
                            </span>
                            <textarea
                              rows={2}
                              value={prop.opiniaoSaymon || ''}
                              onChange={(e) =>
                                handleUpdate(prop.id, { opiniaoSaymon: e.target.value })
                              }
                              placeholder="O que o Saymon achou deste imóvel?"
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                            />
                          </div>

                          {/* Kelly Quick Notes */}
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-rose-200 dark:border-rose-900/60 shadow-sm space-y-1.5">
                            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                              👩 Opinião da Kelly:
                            </span>
                            <textarea
                              rows={2}
                              value={prop.opiniaoKelly || ''}
                              onChange={(e) =>
                                handleUpdate(prop.id, { opiniaoKelly: e.target.value })
                              }
                              placeholder="O que a Kelly achou deste imóvel?"
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
