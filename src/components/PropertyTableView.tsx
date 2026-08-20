'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Building,
  CheckSquare,
  Square,
  Star,
  Eye,
  Edit2,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  MoreVertical,
  ExternalLink,
  MapPin,
  Car,
  Heart,
  Archive,
  RotateCcw,
  Phone,
} from 'lucide-react';
import { Property, STATUS_CONFIG, getCoupleMatchBadge } from '@/types/property';
import { formatCurrency, formatCurrencyPerM2, decodeHtmlEntities } from '@/lib/utils';
import { PropertyCommentsModal } from './PropertyCommentsModal';

interface PropertyTableViewProps {
  properties: Property[];
  onSelectDetails: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  selectedForComparison: string[];
  onToggleCompare: (id: string) => void;
  onQuickUpdateProperty: (id: string, updates: Partial<Property>) => void;
  onToggleArchive?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onStatusChange?: (id: string, status: Property['status']) => void;
  onApproveSuggestion?: (id: string) => void;
  onOpenRealtorModal?: () => void;
  onOpenCommuteAnchorsModal?: () => void;
}

export function PropertyTableView({
  properties,
  onSelectDetails,
  onEdit,
  onDelete,
  selectedForComparison,
  onToggleCompare,
  onQuickUpdateProperty,
  onToggleArchive,
}: PropertyTableViewProps) {
  const [activeTab, setActiveTab] = useState<'nossos' | 'sugestao' | 'arquivados'>('nossos');
  const [commentsModalProp, setCommentsModalProp] = useState<Property | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Filter properties by active tab
  const currentList = properties.filter((p) => {
    if (activeTab === 'sugestao') return p.isSugestao && !p.isArquivado;
    if (activeTab === 'arquivados') return p.isArquivado;
    return !p.isSugestao && !p.isArquivado;
  });

  const nossosCount = properties.filter((p) => !p.isSugestao && !p.isArquivado).length;
  const sugestaoCount = properties.filter((p) => p.isSugestao && !p.isArquivado).length;
  const arquivadosCount = properties.filter((p) => p.isArquivado).length;

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Sub-menu Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('nossos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'nossos'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>🏠 Nossos Imóveis</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px]">
              {nossosCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sugestao')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'sugestao'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>💡 Sugestões dos Corretores</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px]">
              {sugestaoCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('arquivados')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'arquivados'
                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>📦 Arquivados</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]">
              {arquivadosCount}
            </span>
          </button>
        </div>

        {selectedForComparison.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
            <span>{selectedForComparison.length} imóveis selecionados para comparação</span>
          </div>
        )}
      </div>

      {/* Table Container with minimum height so dropdown menus never get cut off */}
      <div className="overflow-x-auto min-h-[360px] pb-16">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          {/* Header */}
          <thead className="bg-slate-100/80 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800/90 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-3 w-10 text-center whitespace-nowrap" title="Comparar imóveis">
                Comp.
              </th>
              <th className="py-3 px-3 w-12 text-center whitespace-nowrap" title="Foto do Imóvel">
                Foto
              </th>
              <th className="py-3 px-3 whitespace-nowrap" title="Título do Imóvel e Bairro">
                Imóvel & Bairro
              </th>
              <th className="py-3 px-3 whitespace-nowrap" title="Status no Funil de Decisão">
                Status
              </th>
              <th className="py-3 px-3 whitespace-nowrap" title="Pacote Mensal Total (Aluguel + Condomínio + IPTU)">
                Custo Total
              </th>
              <th className="py-3 px-3 whitespace-nowrap cursor-help" title="Área Útil (m²) e Valor por m²">
                Área
              </th>
              <th className="py-3 px-3 whitespace-nowrap cursor-help" title="Dormitórios, Suítes e Vagas">
                Cômodos
              </th>

              {/* Menino Moreno Emoji (Saymon) */}
              <th
                className="py-3 px-2 w-14 text-center whitespace-nowrap cursor-pointer hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors"
                title="Saymon"
              >
                <span className="text-base" role="img" aria-label="Saymon">🧑🏻‍🦱</span>
              </th>

              {/* Mulher Morena Emoji (Kelly) */}
              <th
                className="py-3 px-2 w-14 text-center whitespace-nowrap cursor-pointer hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-colors"
                title="Kelly"
              >
                <span className="text-base" role="img" aria-label="Kelly">👩🏻‍🦱</span>
              </th>

              {/* Deslocamento Header (Sem ? ou emoji polutuado) */}
              <th
                className="py-3 px-3 whitespace-nowrap cursor-help"
                title="Tempo de Deslocamento do Casal (Saymon, Kelly e Média)"
              >
                Deslocamento
              </th>

              <th className="py-3 px-3 w-28 text-right whitespace-nowrap">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {currentList.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-16 text-center text-slate-400 text-xs">
                  {activeTab === 'nossos'
                    ? 'Nenhum imóvel cadastrado nesta lista.'
                    : activeTab === 'sugestao'
                    ? 'Nenhuma sugestão enviada por corretores no momento.'
                    : 'Nenhum imóvel arquivado.'}
                </td>
              </tr>
            ) : (
              currentList.map((prop, idx) => {
                const isSelected = selectedForComparison.includes(prop.id);
                const statusCfg = STATUS_CONFIG[prop.status] || STATUS_CONFIG['Para Analisar'];
                const isMenuOpen = openActionMenuId === prop.id;
                const isLastRow = idx >= currentList.length - 2 && currentList.length > 2;

                return (
                  <tr
                    key={prop.id}
                    className={`hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors ${
                      isSelected ? 'bg-rose-50/30 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    {/* Checkbox comparison */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleCompare(prop.id)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors inline-flex"
                        title={isSelected ? 'Remover da comparação' : 'Comparar'}
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>

                    {/* Foto Thumb with Unsplash Fallback */}
                    <td className="py-3 px-3 text-center">
                      <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm mx-auto group">
                        <Image
                          src={
                            prop.urlImagem ||
                            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80'
                          }
                          alt={prop.titulo}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      </div>
                    </td>

                    {/* Título & Bairro */}
                    <td className="py-3 px-3">
                      <div className="max-w-[220px]">
                        <button
                          type="button"
                          onClick={() => onSelectDetails(prop)}
                          className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left line-clamp-1 transition-colors"
                          title={decodeHtmlEntities(prop.titulo)}
                        >
                          {decodeHtmlEntities(prop.titulo)}
                        </button>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                          <span className="truncate">{decodeHtmlEntities(prop.bairro)}</span>
                          {prop.andar && <span className="text-slate-400">({prop.andar})</span>}
                          {prop.urlAnuncio && (
                            <a
                              href={prop.urlAnuncio}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-500 hover:text-indigo-700 shrink-0 ml-1"
                              title="Abrir anúncio original"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>

                        {/* Corretor Info Badge Single Horizontal Row */}
                        {(prop.nomeCorretor || prop.telefoneCorretor || prop.isSugestao) && (
                          <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                            <span className="flex items-center gap-1">
                              <span>👔</span>
                              <span>{prop.nomeCorretor || 'Corretor'}</span>
                            </span>
                            {prop.telefoneCorretor && (
                              <>
                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                <a
                                  href={`https://wa.me/55${prop.telefoneCorretor.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                                  title="Enviar WhatsApp"
                                >
                                  <Phone className="h-2.5 w-2.5" />
                                  <span>{prop.telefoneCorretor}</span>
                                </a>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <select
                        value={prop.status}
                        onChange={(e) =>
                          onQuickUpdateProperty(prop.id, {
                            status: e.target.value as Property['status'],
                          })
                        }
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-colors cursor-pointer ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        {Object.keys(STATUS_CONFIG).map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Custo Total */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {formatCurrency(
                          prop.valorAluguel + prop.valorCondominio + prop.valorIptu
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Aluguel {formatCurrency(prop.valorAluguel)}
                      </div>
                    </td>

                    {/* Área Útil e R$/m² */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        {prop.areaUtil} m²
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatCurrencyPerM2(
                          (prop.valorAluguel + prop.valorCondominio + prop.valorIptu) /
                            prop.areaUtil
                        )}
                      </div>
                    </td>

                    {/* Cômodos */}
                    <td className="py-3 px-3 whitespace-nowrap text-[11px]">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        {prop.dormitorios} dorms ({prop.suites} suítes)
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {prop.banheiros} banh. • {prop.vagasGaragem} vagas
                      </div>
                    </td>

                    {/* SAYMON COMPACT BADGE (🧑🏻‍🦱 Nota 1-5 Single Star Indicator) */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <select
                        value={prop.notaSaymon}
                        onChange={(e) =>
                          onQuickUpdateProperty(prop.id, { notaSaymon: Number(e.target.value) })
                        }
                        title="Saymon"
                        className="h-7 w-12 text-xs font-extrabold text-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-pointer appearance-none px-1 shadow-sm hover:border-amber-400 transition-all"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            ⭐ {n}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* KELLY COMPACT BADGE (👩🏻‍🦱 Nota 1-5 Single Star Indicator) */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <select
                        value={prop.notaKelly}
                        onChange={(e) =>
                          onQuickUpdateProperty(prop.id, { notaKelly: Number(e.target.value) })
                        }
                        title="Kelly"
                        className="h-7 w-12 text-xs font-extrabold text-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-pointer appearance-none px-1 shadow-sm hover:border-amber-400 transition-all"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            ⭐ {n}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* DESLOCAMENTO (Saymon 🧑🏻‍🦱, Kelly 👩🏻‍🦱, e Média 💑) */}
                    <td className="py-3 px-3 whitespace-nowrap text-[11px]">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        <span title="Saymon (Trabalho)">🧑🏻‍🦱 {prop.tempoSaymonMinutos ?? prop.tempoAteTrabalhoMinutos}m</span>
                        <span className="text-slate-300">|</span>
                        <span title="Kelly (Trabalho)">👩🏻‍🦱 {prop.tempoKellyMinutos ?? prop.tempoAteTrabalhoMinutos}m</span>
                      </div>
                      <div className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        💑 Média: {Math.round(((prop.tempoSaymonMinutos ?? prop.tempoAteTrabalhoMinutos) + (prop.tempoKellyMinutos ?? prop.tempoAteTrabalhoMinutos)) / 2)} min
                      </div>
                    </td>

                    {/* ACTIONS: 💬 Comentários Pop-up + Menu de Três Pontinhos (⋮) */}
                    <td className="py-3 px-3 text-right whitespace-nowrap relative">
                      <div className="flex items-center justify-end gap-1.5 relative">
                        {/* 💬 Pop-up Modal Button for Comments & Realtor Questions */}
                        <button
                          type="button"
                          onClick={() => setCommentsModalProp(prop)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white transition-colors shadow-sm"
                          title="Opiniões do Casal & Perguntas para o Corretor"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>

                        {/* MENU DE TRÊS PONTINHOS (⋮) - Prevent cut-off by using z-50 and smart placement */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenActionMenuId(isMenuOpen ? null : prop.id)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
                            title="Mais Ações"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {/* Dropdown Menu Items */}
                          {isMenuOpen && (
                            <div
                              className={`absolute right-0 ${
                                isLastRow ? 'bottom-9' : 'top-9'
                              } z-50 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-1.5 text-xs text-left ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  onSelectDetails(prop);
                                }}
                                className="w-full px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium transition-colors"
                              >
                                <Eye className="h-4 w-4 text-indigo-500" />
                                <span>Ver Detalhes</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  onEdit(prop);
                                }}
                                className="w-full px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium transition-colors"
                              >
                                <Edit2 className="h-4 w-4 text-blue-500" />
                                <span>Editar Imóvel</span>
                              </button>

                              {onToggleArchive && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionMenuId(null);
                                    onToggleArchive(prop.id);
                                  }}
                                  className="w-full px-3.5 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 font-medium transition-colors"
                                >
                                  {prop.isArquivado ? (
                                    <>
                                      <RotateCcw className="h-4 w-4 text-emerald-500" />
                                      <span>Desarquivar Imóvel</span>
                                    </>
                                  ) : (
                                    <>
                                      <Archive className="h-4 w-4 text-amber-500" />
                                      <span>Arquivar Imóvel</span>
                                    </>
                                  )}
                                </button>
                              )}

                              <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  onDelete(prop.id);
                                }}
                                className="w-full px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 font-medium transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Excluir Imóvel</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pop-up Comments & Questions Modal */}
      <PropertyCommentsModal
        property={commentsModalProp}
        open={!!commentsModalProp}
        onOpenChange={(open) => {
          if (!open) setCommentsModalProp(null);
        }}
      />
    </div>
  );
}
