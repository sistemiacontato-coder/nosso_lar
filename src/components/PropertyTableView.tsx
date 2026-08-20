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
  Archive,
  Compass,
  Sparkles,
} from 'lucide-react';
import { Property, PropertyStatus, STATUS_CONFIG } from '@/types/property';
import { Button } from './ui/button';
import { PropertyCommentsModal } from './PropertyCommentsModal';

interface PropertyTableViewProps {
  properties: Property[];
  selectedForComparison: string[];
  onToggleCompare: (id: string) => void;
  onSelectDetails: (property: Property) => void;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onQuickUpdateProperty: (id: string, updates: Partial<Property>) => void;
  onStatusChange: (id: string, status: PropertyStatus) => void;
  onToggleFavorite?: (id: string) => void;
  onApproveSuggestion?: (id: string) => void;
  onOpenRealtorModal?: () => void;
  onOpenCommuteAnchorsModal?: () => void;
  onToggleArchive?: (id: string) => void;
}

export function PropertyTableView({
  properties,
  selectedForComparison,
  onToggleCompare,
  onSelectDetails,
  onEdit,
  onDelete,
  onQuickUpdateProperty,
  onStatusChange,
  onApproveSuggestion,
  onOpenRealtorModal,
  onOpenCommuteAnchorsModal,
  onToggleArchive,
}: PropertyTableViewProps) {
  const [activeTab, setActiveTab] = useState<'nossos' | 'sugestao' | 'arquivados'>('nossos');
  const [commentsModalProp, setCommentsModalProp] = useState<Property | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Sub-menu filtering
  const nossosImoveis = properties.filter((p) => !p.isSugestao && !p.isArquivado);
  const sugestoesCorretores = properties.filter((p) => p.isSugestao && !p.isArquivado);
  const arquivados = properties.filter((p) => p.isArquivado);

  const currentList =
    activeTab === 'nossos'
      ? nossosImoveis
      : activeTab === 'sugestao'
      ? sugestoesCorretores
      : arquivados;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);

  const formatCurrencyPerM2 = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 1,
    }).format(val) + '/m²';

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
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold">
              {nossosImoveis.length}
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
            {sugestoesCorretores.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                {sugestoesCorretores.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('arquivados')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'arquivados'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>📦 Arquivados</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-extrabold">
              {arquivados.length}
            </span>
          </button>
        </div>

        {/* Action Controls: Pontos de Deslocamento e Modo Corretor */}
        <div className="flex items-center gap-2">
          {onOpenCommuteAnchorsModal && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenCommuteAnchorsModal}
              className="h-8.5 text-xs font-bold border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50"
            >
              <Compass className="mr-1.5 h-3.5 w-3.5 text-indigo-600" /> 📍 Pontos de Deslocamento
            </Button>
          )}

          {onOpenRealtorModal && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenRealtorModal}
              className="h-8.5 text-xs font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              👔 Modo Corretor (Enviar Imóvel)
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          {/* Header */}
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/80 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-3 w-10 text-center whitespace-nowrap" title="Comparar imóveis lado a lado">
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
              <th className="py-3 px-3 whitespace-nowrap cursor-help" title="Área Útil (m²) e Valor por m² (R$/m²)">
                Área ℹ️
              </th>
              <th className="py-3 px-3 whitespace-nowrap cursor-help" title="Dormitórios, Suítes e Vagas de Garagem">
                Cômodos ℹ️
              </th>

              {/* Ultra-Compact Emoji Headers (Homme & Femme Moreno) */}
              <th className="py-3 px-[10px] w-14 text-center whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" title="Saymon (Homem de Cabelo Escuro) - Clique para alterar nota">
                🧑🏻‍🦱
              </th>
              <th className="py-3 px-[10px] w-14 text-center whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" title="Kelly (Mulher de Cabelo Escuro) - Clique para alterar nota">
                👩🏻‍🦱
              </th>

              <th className="py-3 px-3 whitespace-nowrap cursor-help" title="Tempo de Deslocamento de Saymon (🧑🏻‍🦱), Kelly (👩🏻‍🦱) e Média do Casal (💑)">
                Deslocamento 🚗
              </th>
              <th className="py-3 px-3 w-28 text-right whitespace-nowrap">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {currentList.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400 text-xs">
                  {activeTab === 'nossos'
                    ? 'Nenhum imóvel cadastrado nesta lista.'
                    : activeTab === 'sugestao'
                    ? 'Nenhuma sugestão enviada por corretores no momento. Clique em "Modo Corretor" para enviar!'
                    : 'Nenhum imóvel arquivado.'}
                </td>
              </tr>
            ) : (
              currentList.map((prop) => {
                const isSelected = selectedForComparison.includes(prop.id);
                const statusCfg = STATUS_CONFIG[prop.status] || STATUS_CONFIG['Para Analisar'];
                const isMenuOpen = openActionMenuId === prop.id;

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
                    <td className="py-3 px-3 max-w-[180px]">
                      <div
                        onClick={() => onSelectDetails(prop)}
                        className="font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 text-xs"
                        title={prop.titulo}
                      >
                        {prop.titulo}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                        <span>{prop.bairro}</span>
                        {prop.isSugestao && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                            Corretor
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Quick Status Dropdown */}
                    <td className="py-3 px-3">
                      <select
                        value={prop.status in STATUS_CONFIG ? prop.status : 'Para Analisar'}
                        onChange={(e) => onStatusChange(prop.id, e.target.value as PropertyStatus)}
                        className={`text-[11px] font-medium rounded-lg px-2 py-1 border transition-all cursor-pointer ${statusCfg.bg} ${statusCfg.border} ${statusCfg.text}`}
                      >
                        <option value="Para Analisar">Para Analisar</option>
                        <option value="Agendar Visita">Agendar Visita</option>
                        <option value="Visita Agendada">Visita Agendada</option>
                        <option value="Pendente Avaliação">Pendente Avaliação</option>
                        <option value="Proposta Enviada">Proposta Enviada</option>
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
                      <div>{prop.dormitorios} qtos ({prop.suites} st)</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{prop.vagasGaragem} vaga{prop.vagasGaragem > 1 ? 's' : ''}</div>
                    </td>

                    {/* SAYMON COMPACT BADGE (🧑🏻‍🦱 Nota 1-5 Dropdown/Button) */}
                    <td className="py-3 px-[10px] text-center whitespace-nowrap">
                      <select
                        value={prop.notaSaymon}
                        onChange={(e) =>
                          onQuickUpdateProperty(prop.id, { notaSaymon: Number(e.target.value) })
                        }
                        title={`Saymon — Nota ${prop.notaSaymon}/5 (Clique para alterar)`}
                        className="h-7 w-12 text-xs font-bold text-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-pointer appearance-none px-1"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            ⭐ {n}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* KELLY COMPACT BADGE (👩🏻‍🦱 Nota 1-5 Dropdown/Button) */}
                    <td className="py-3 px-[10px] text-center whitespace-nowrap">
                      <select
                        value={prop.notaKelly}
                        onChange={(e) =>
                          onQuickUpdateProperty(prop.id, { notaKelly: Number(e.target.value) })
                        }
                        title={`Kelly — Nota ${prop.notaKelly}/5 (Clique para alterar)`}
                        className="h-7 w-12 text-xs font-bold text-center rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 cursor-pointer appearance-none px-1"
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
                      <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <span title="Saymon (Trabalho)">🧑🏻‍🦱 {prop.tempoSaymonMinutos ?? prop.tempoAteTrabalhoMinutos}m</span>
                        <span className="text-slate-300">|</span>
                        <span title="Kelly (Trabalho)">👩🏻‍🦱 {prop.tempoKellyMinutos ?? prop.tempoAteTrabalhoMinutos}m</span>
                      </div>
                      <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        💑 Média: {Math.round(((prop.tempoSaymonMinutos ?? prop.tempoAteTrabalhoMinutos) + (prop.tempoKellyMinutos ?? prop.tempoAteTrabalhoMinutos)) / 2)} min
                      </div>
                    </td>

                    {/* ACTIONS: 💬 Comentários Pop-up + Menu (⋮) */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5 relative">
                        {/* 💬 Pop-up Modal Button for Comments & Realtor Questions */}
                        <button
                          type="button"
                          onClick={() => setCommentsModalProp(prop)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white transition-colors"
                          title="Ver Opiniões do Casal & Perguntas para o Corretor"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>

                        {/* MENU DE TRÊS PONTINHOS (⋮) */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenActionMenuId(isMenuOpen ? null : prop.id)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Mais Opções de Ação"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {/* Dropdown Menu Items */}
                          {isMenuOpen && (
                            <div className="absolute right-0 top-9 z-50 w-44 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 text-xs text-left animate-in fade-in-50 zoom-in-95">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  onSelectDetails(prop);
                                }}
                                className="w-full px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 font-medium"
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
                                className="w-full px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 font-medium"
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
                                  className="w-full px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 font-medium"
                                >
                                  <Archive className="h-4 w-4 text-amber-500" />
                                  <span>{prop.isArquivado ? 'Desarquivar' : 'Arquivar Imóvel'}</span>
                                </button>
                              )}

                              <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionMenuId(null);
                                  onDelete(prop.id);
                                }}
                                className="w-full px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
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
