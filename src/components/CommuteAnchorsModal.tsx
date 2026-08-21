'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Save, Loader2, Clock } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { CommuteAnchors } from '@/types/property';

export const COMMUTE_ANCHORS_KEY = 'nosso_lar_commute_anchors_v3';

export const DEFAULT_COMMUTE_ANCHORS: CommuteAnchors = {
  saymonAddress1: "Rua Gabrielle D'Annunzio, 48, Campo Belo, São Paulo, SP",
  saymonAddress2: '',
  saymonTime: '08:00',
  saymonDay: 'weekday',
  kellyAddress1: 'Prédio Prata - Bradesco (Cidade de Deus), Osasco - SP',
  kellyAddress2: '',
  kellyTime: '08:00',
  kellyDay: 'weekday',
};

export function getStoredCommuteAnchors(): CommuteAnchors {
  if (typeof window === 'undefined') return DEFAULT_COMMUTE_ANCHORS;
  try {
    const raw = localStorage.getItem(COMMUTE_ANCHORS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        saymonAddress1: parsed.saymonAddress1 || DEFAULT_COMMUTE_ANCHORS.saymonAddress1,
        saymonAddress2: parsed.saymonAddress2 || '',
        saymonTime: parsed.saymonTime || '08:00',
        saymonDay: parsed.saymonDay || 'weekday',
        kellyAddress1: parsed.kellyAddress1 || DEFAULT_COMMUTE_ANCHORS.kellyAddress1,
        kellyAddress2: parsed.kellyAddress2 || '',
        kellyTime: parsed.kellyTime || '08:00',
        kellyDay: parsed.kellyDay || 'weekday',
      };
    }
  } catch (e) {}
  return DEFAULT_COMMUTE_ANCHORS;
}

export function saveStoredCommuteAnchors(anchors: CommuteAnchors) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(COMMUTE_ANCHORS_KEY, JSON.stringify(anchors));
  }
}

interface AddressSuggestion {
  id: string;
  displayName: string;
  shortTitle: string;
}

interface CommuteAnchorsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (anchors: CommuteAnchors) => void;
  targetUser?: 'saymon' | 'kelly' | 'both';
}

export function CommuteAnchorsModal({ open, onOpenChange, onSave, targetUser = 'both' }: CommuteAnchorsModalProps) {
  const [anchors, setAnchors] = useState<CommuteAnchors>(DEFAULT_COMMUTE_ANCHORS);

  // Suggestions state
  const [saymonSuggestions, setSaymonSuggestions] = useState<AddressSuggestion[]>([]);
  const [kellySuggestions, setKellySuggestions] = useState<AddressSuggestion[]>([]);

  // Loading states
  const [loadingSaymon, setLoadingSaymon] = useState(false);
  const [loadingKelly, setLoadingKelly] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAnchors(getStoredCommuteAnchors());
      setSaymonSuggestions([]);
      setKellySuggestions([]);
    }
  }, [open]);

  // Autocomplete fetch helper
  const fetchAddressSuggestions = async (
    query: string,
    setSuggestions: (items: AddressSuggestion[]) => void,
    setLoading: (loading: boolean) => void
  ) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode-address?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.success) {
        setSuggestions(json.suggestions || []);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (
    field: 'saymonAddress1' | 'kellyAddress1',
    item: AddressSuggestion,
    setSuggestions: (items: AddressSuggestion[]) => void
  ) => {
    const raw = anchors[field] || '';
    const numberMatch = raw.match(/(?:[,\s]+|^)(\d+)(?:\s+.*)?$/) || raw.match(/\b\d{1,5}\b/);
    const houseNum = numberMatch ? numberMatch[1] : null;

    let fullAddress = item.displayName || item.shortTitle || raw;
    if (houseNum && !fullAddress.includes(houseNum)) {
      const parts = fullAddress.split(',');
      if (parts.length > 0) {
        parts[0] = `${parts[0].trim()}, ${houseNum}`;
        fullAddress = parts.join(',');
      }
    }

    setAnchors((prev) => ({ ...prev, [field]: fullAddress }));
    setSuggestions([]);
  };

  const handleSave = () => {
    setIsSaving(true);
    saveStoredCommuteAnchors(anchors);
    if (onSave) {
      onSave(anchors);
    }
    setTimeout(() => {
      setIsSaving(false);
      onOpenChange(false);
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="4xl">
      <div className="space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-rose-500 text-white font-bold shrink-0 shadow-md">
              📍
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Endereços de Interesse (Perfil Saymon & Kelly)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Cadastre 1 endereço fixo para o Saymon e 1 para a Kelly. O sistema calculará o deslocamento no mapa para todos os imóveis!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* HORIZONTAL 2-COLUMN GRID (SAYMON LEFT, KELLY RIGHT) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-1">
          {/* SAYMON ADDRESS (LEFT COL) */}
          {(targetUser === 'both' || targetUser === 'saymon') && (
            <div className="p-4 rounded-3xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/80 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/60 pb-2">
                <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                  <span className="text-base">🧔</span> Endereço do Saymon
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  Saymon
                </span>
              </div>

              <div className="space-y-1.5 relative">
                <Label htmlFor="saymonAddress1" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Endereço de Interesse / Trabalho (Saymon)
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500" />
                  <Input
                    id="saymonAddress1"
                    placeholder="Digite o endereço (ex: Prédio Prata / Cidade de Deus)..."
                    value={anchors.saymonAddress1}
                    autoComplete="off"
                    onFocus={(e) => fetchAddressSuggestions(e.target.value, setSaymonSuggestions, setLoadingSaymon)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnchors((prev) => ({ ...prev, saymonAddress1: val }));
                      fetchAddressSuggestions(val, setSaymonSuggestions, setLoadingSaymon);
                    }}
                    className="pl-9 pr-8 text-xs bg-white dark:bg-slate-900"
                  />
                  {loadingSaymon && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-indigo-500" />
                  )}
                </div>

                {/* Autocomplete suggestions box */}
                {saymonSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-44 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 shadow-2xl py-1 text-xs">
                    {saymonSuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion('saymonAddress1', item, setSaymonSuggestions)}
                        className="w-full text-left px-3.5 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950 flex items-start gap-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                      >
                        <MapPin className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span className="min-w-0 flex-1 text-xs font-semibold text-slate-800 dark:text-slate-100 leading-normal">
                          {item.displayName || item.shortTitle}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Horário e Dia de Saída (Saymon) */}
                <div className="pt-1 flex items-center justify-between gap-2">
                  <Label htmlFor="saymonTime" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-indigo-500" />
                    Saída & Dia:
                  </Label>
                  <div className="flex items-center gap-1.5">
                    <select
                      id="saymonDay"
                      value={anchors.saymonDay || 'weekday'}
                      onChange={(e) => setAnchors((prev) => ({ ...prev, saymonDay: e.target.value }))}
                      className="text-xs font-bold px-2 py-1 h-8 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 cursor-pointer shadow-xs"
                    >
                      <option value="weekday">📅 Dia Útil</option>
                      <option value="weekend">🏖️ Fim de Semana</option>
                    </select>
                    <Input
                      id="saymonTime"
                      type="time"
                      value={anchors.saymonTime || '08:00'}
                      onChange={(e) => setAnchors((prev) => ({ ...prev, saymonTime: e.target.value }))}
                      className="w-24 text-xs font-bold text-center px-1 py-1 h-8 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 shadow-xs cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* KELLY ADDRESS (RIGHT COL) */}
          {(targetUser === 'both' || targetUser === 'kelly') && (
            <div className="p-4 rounded-3xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800/80 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/60 pb-2">
                <span className="text-xs font-black text-rose-950 dark:text-rose-200 flex items-center gap-2">
                  <span className="text-base">👩</span> Endereço da Kelly
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300">
                  Kelly
                </span>
              </div>

              <div className="space-y-1.5 relative">
                <Label htmlFor="kellyAddress1" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Endereço de Interesse / Trabalho (Kelly)
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-rose-500" />
                  <Input
                    id="kellyAddress1"
                    placeholder="Digite o endereço (ex: Prédio Prata / Faria Lima)..."
                    value={anchors.kellyAddress1}
                    autoComplete="off"
                    onFocus={(e) => fetchAddressSuggestions(e.target.value, setKellySuggestions, setLoadingKelly)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnchors((prev) => ({ ...prev, kellyAddress1: val }));
                      fetchAddressSuggestions(val, setKellySuggestions, setLoadingKelly);
                    }}
                    className="pl-9 pr-8 text-xs bg-white dark:bg-slate-900"
                  />
                  {loadingKelly && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-rose-500" />
                  )}
                </div>

                {/* Autocomplete suggestions box */}
                {kellySuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-44 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 shadow-2xl py-1 text-xs">
                    {kellySuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion('kellyAddress1', item, setKellySuggestions)}
                        className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950 flex items-start gap-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                      >
                        <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <span className="min-w-0 flex-1 text-xs font-semibold text-slate-800 dark:text-slate-100 leading-normal">
                          {item.displayName || item.shortTitle}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Horário e Dia de Saída (Kelly) */}
                <div className="pt-1 flex items-center justify-between gap-2">
                  <Label htmlFor="kellyTime" className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-rose-500" />
                    Saída & Dia:
                  </Label>
                  <div className="flex items-center gap-1.5">
                    <select
                      id="kellyDay"
                      value={anchors.kellyDay || 'weekday'}
                      onChange={(e) => setAnchors((prev) => ({ ...prev, kellyDay: e.target.value }))}
                      className="text-xs font-bold px-2 py-1 h-8 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 cursor-pointer shadow-xs"
                    >
                      <option value="weekday">📅 Dia Útil</option>
                      <option value="weekend">🏖️ Fim de Semana</option>
                    </select>
                    <Input
                      id="kellyTime"
                      type="time"
                      value={anchors.kellyTime || '08:00'}
                      onChange={(e) => setAnchors((prev) => ({ ...prev, kellyTime: e.target.value }))}
                      className="w-24 text-xs font-bold text-center px-1 py-1 h-8 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 shadow-xs cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-700 hover:to-rose-700 text-white text-xs font-bold shadow-md px-5"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" />
                Salvar Perfil & Recalcular Tempos
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
