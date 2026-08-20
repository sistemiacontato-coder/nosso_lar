'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Star,
  Building,
  CheckSquare,
  Square,
  Eye,
  Edit2,
  Trash2,
  Heart,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Wand2,
  Send,
  Sparkles,
  Check,
  X,
  Phone,
} from 'lucide-react';
import { Property, PropertyStatus, STATUS_CONFIG, getCoupleMatchBadge } from '@/types/property';
import { formatCurrency, formatCurrencyPerM2 } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface PropertyTableViewProps {
  properties: Property[];
  sugestoesProperties?: Property[];
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onStatusChange: (id: string, status: PropertyStatus) => void;
  onSelectDetails: (property: Property) => void;
  selectedForComparison: string[];
  onToggleCompare: (id: string) => void;
  onQuickUpdateProperty: (id: string, updates: Partial<Property>) => void;
  onApproveSuggestion?: (id: string) => void;
  onOpenRealtorModal?: () => void;
}

export function PropertyTableView({
  properties,
  sugestoesProperties = [],
  onEdit,
  onDelete,
  onToggleFavorite,
  onStatusChange,
  onSelectDetails,
  selectedForComparison,
  onToggleCompare,
  onQuickUpdateProperty,
  onApproveSuggestion,
  onOpenRealtorModal,
}: PropertyTableViewProps) {
  const [activeTab, setActiveTab] = useState<'nossos' | 'sugestoes'>('nossos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const currentList = activeTab === 'nossos' ? properties : sugestoesProperties;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden mb-12 animate-fade-in">
      {/* Sub-Menu Navigation Tabs (Sub-menus: Nossos Imóveis vs Sugestões dos Corretores) */}
      <div className="p-3 bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('nossos')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'nossos'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Heart className="h-3.5 w-3.5 fill-current" />
            <span>Nossos Imóveis ({properties.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sugestoes')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === 'sugestoes'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sugestões dos Corretores</span>
            {sugestoesProperties.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-900 font-extrabold text-[10px]">
                {sugestoesProperties.length}
              </span>
            )}
          </button>
        </div>

        {/* Action: Abrir Modo Corretor */}
        {onOpenRealtorModal && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenRealtorModal}
            className="h-8 text-xs font-bold border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50"
          >
            👔 Modo Corretor (Enviar Imóvel)
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          {/* Ultra-Compact Single Line Headers with Hover Tooltips */}
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
              <th className="py-3 px-3 whitespace-nowrap" title="Nota do Saymon (1 a 5 Estrelas)">
                Saymon 🧔
              </th>
              <th className="py-3 px-3 whitespace-nowrap" title="Nota da Kelly (1 a 5 Estrelas)">
                Kelly 👩
              </th>
              <th className="py-3 px-3 whitespace-nowrap cursor-help" title="Tempo de Deslocamento de Saymon (🧔), Kelly (👩) e Média do Casal (💑)">
                Deslocamento 🚗
              </th>
              <th className="py-3 px-3 text-right whitespace-nowrap">
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
                    : 'Nenhuma sugestão enviada por corretores no momento. Clique em "Modo Corretor" para enviar!'}
                </td>
              </tr>
            ) : (
              currentList.map((prop) => {
                const isSelected = selectedForComparison.includes(prop.id);
                const isExpanded = expandedId === prop.id;
                const statusCfg = STATUS_CONFIG[prop.status] || STATUS_CONFIG['Para Analisar'];
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
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                          <span>{prop.bairro}</span>
                          {prop.isSugestao && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                              Corretor
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Quick Status Dropdown (Clean, Short, No Emojis/Parentheses) */}
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
                        <div>{prop.dormitorios} qtos ({prop.suites} suíte{prop.suites > 1 ? 's' : ''})</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{prop.vagasGaragem} vaga{prop.vagasGaragem > 1 ? 's' : ''}</div>
                      </td>

                      {/* SAYMON RATING STARS */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => onQuickUpdateProperty(prop.id, { notaSaymon: star })}
                              className="p-0.5 hover:scale-125 transition-transform"
                              title={`Saymon dá nota ${star}/5`}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  star <= prop.notaSaymon
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200 dark:text-slate-700'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* KELLY RATING STARS */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => onQuickUpdateProperty(prop.id, { notaKelly: star })}
                              className="p-0.5 hover:scale-125 transition-transform"
                              title={`Kelly dá nota ${star}/5`}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  star <= prop.notaKelly
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200 dark:text-slate-700'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* DESLOCAMENTO (Saymon 🧔, Kelly 👩, e Média 💑) */}
                      <td className="py-3 px-3 whitespace-nowrap text-[11px]">
                        <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <span title="Saymon (Trabalho)">🧔 {prop.tempoSaymonMinutos ?? prop.tempoAteTrabalhoMinutos}m</span>
                          <span className="text-slate-300">|</span>
                          <span title="Kelly (Trabalho)">👩 {prop.tempoKellyMinutos ?? prop.tempoAteTrabalhoMinutos}m</span>
                        </div>
                        <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                          💑 Média: {Math.round(((prop.tempoSaymonMinutos ?? prop.tempoAteTrabalhoMinutos) + (prop.tempoKellyMinutos ?? prop.tempoAteTrabalhoMinutos)) / 2)} min
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Approve Suggestion Button if in Suggestions Tab */}
                          {prop.isSugestao && onApproveSuggestion && (
                            <Button
                              size="sm"
                              onClick={() => onApproveSuggestion(prop.id)}
                              className="h-7 px-2 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                              title="Aprovar e adicionar aos nossos imóveis"
                            >
                              <Check className="h-3 w-3 mr-1" /> Aprovar
                            </Button>
                          )}

                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : prop.id)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Expandir notas e dúvidas do corretor"
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => onSelectDetails(prop)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onEdit(prop)}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(prop.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDABLE DRAWER ROW (NOTAS + DÚVIDAS DO CORRETOR) */}
                    {isExpanded && (
                      <tr className="bg-slate-50/80 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
                        <td colSpan={11} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Saymon note */}
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/40 text-xs">
                              <span className="font-bold text-blue-700 dark:text-blue-300 block mb-1">
                                🧔 Opinião do Saymon ({prop.vereditoSaymon || 'Sem veredito'}):
                              </span>
                              <p className="text-slate-600 dark:text-slate-300 italic">
                                {prop.opiniaoSaymon || 'Nenhum comentário cadastrado.'}
                              </p>
                            </div>

                            {/* Kelly note */}
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/40 text-xs">
                              <span className="font-bold text-rose-700 dark:text-rose-300 block mb-1">
                                👩 Opinião da Kelly ({prop.vereditoKelly || 'Sem veredito'}):
                              </span>
                              <p className="text-slate-600 dark:text-slate-300 italic">
                                {prop.opiniaoKelly || 'Nenhum comentário cadastrado.'}
                              </p>
                            </div>

                            {/* Dúvidas para o Corretor */}
                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                                  ❓ Dúvidas para o Corretor:
                                </span>
                                {prop.duvidasCorretor && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(`Olá! Dúvidas sobre ${prop.titulo}:\n\n${prop.duvidasCorretor}`);
                                      alert('Dúvidas copiadas para o WhatsApp!');
                                    }}
                                    className="text-[10px] font-bold text-indigo-600 hover:underline"
                                  >
                                    Copiar WhatsApp 📲
                                  </button>
                                )}
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line font-medium">
                                {prop.duvidasCorretor || '1. A vaga de garagem é livre ou presa?\n2. O condomínio inclui água/gás?'}
                              </p>
                              {prop.telefoneCorretor && (
                                <a
                                  href={`https://wa.me/55${prop.telefoneCorretor.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-emerald-600 hover:underline"
                                >
                                  <Phone className="h-3 w-3" /> Falar com {prop.nomeCorretor || 'Corretor'} no WhatsApp ({prop.telefoneCorretor})
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
