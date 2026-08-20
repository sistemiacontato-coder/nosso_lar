'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Save, Compass, Loader2, Heart, Check } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { CommuteAnchors } from '@/types/property';

export const COMMUTE_ANCHORS_KEY = 'nosso_lar_commute_anchors_v2';

export const DEFAULT_COMMUTE_ANCHORS: CommuteAnchors = {
  saymonAddress1: 'Miguel Rachid, 205, Osasco - SP',
  saymonAddress2: '',
  kellyAddress1: 'Prédio da antiga estação ferroviária de Águas da Prata, SP',
  kellyAddress2: '',
};

export function getStoredCommuteAnchors(): CommuteAnchors {
  if (typeof window === 'undefined') return DEFAULT_COMMUTE_ANCHORS;
  try {
    const raw = localStorage.getItem(COMMUTE_ANCHORS_KEY) || localStorage.getItem('nosso_lar_commute_anchors_v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        saymonAddress1: parsed.saymonAddress1 || parsed.saymonWork || DEFAULT_COMMUTE_ANCHORS.saymonAddress1,
        saymonAddress2: '',
        kellyAddress1: parsed.kellyAddress1 || parsed.kellyWork || DEFAULT_COMMUTE_ANCHORS.kellyAddress1,
        kellyAddress2: '',
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

  // Suggestions state (1 for Saymon, 1 for Kelly)
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

  // Autocomplete fetch helper (Google Maps / OpenStreetMap Nominatim API)
  const fetchAddressSuggestions = async (
    query: string,
    setSuggestions: (items: AddressSuggestion[]) => void,
    setLoading: (loading: boolean) => void
  ) => {
    if (!query || query.trim().length < 3) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="p-6 max-w-xl w-full mx-auto space-y-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold">
              📍
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
                Endereços de Interesse (Perfil Saymon & Kelly)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Cadastre 1 endereço fixo para o Saymon e 1 para a Kelly. O sistema calculará o deslocamento no mapa para todos os imóveis!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* SAYMON ADDRESS (1 CAMPO) */}
          {(targetUser === 'both' || targetUser === 'saymon') && (
            <div className="p-4 rounded-3xl bg-gradient-to-b from-indigo-50/80 to-purple-50/40 dark:from-indigo-950/40 dark:to-purple-950/20 border border-indigo-200/80 dark:border-indigo-800/80 space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/60 pb-2">
                <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                  <span className="text-lg">🧔</span> Endereço do Saymon
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
                    placeholder="Digite o endereço (ex: Miguel Rachid, 205, Osasco)..."
                    value={anchors.saymonAddress1}
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
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 shadow-2xl py-1 text-xs">
                    {saymonSuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion('saymonAddress1', item, setSaymonSuggestions)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950 flex items-start gap-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0"
                      >
                        <MapPin className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span className="min-w-0 flex-1 text-xs font-semibold text-slate-800 dark:text-slate-100 leading-normal">
                          {item.displayName || item.shortTitle}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KELLY ADDRESS (1 CAMPO) */}
          {(targetUser === 'both' || targetUser === 'kelly') && (
            <div className="p-4 rounded-3xl bg-gradient-to-b from-rose-50/80 to-pink-50/40 dark:from-rose-950/40 dark:to-pink-950/20 border border-rose-200/80 dark:border-rose-800/80 space-y-3">
              <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/60 pb-2">
                <span className="text-xs font-black text-rose-950 dark:text-rose-200 flex items-center gap-2">
                  <span className="text-lg">👩</span> Endereço da Kelly
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
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 shadow-2xl py-1 text-xs">
                    {kellySuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion('kellyAddress1', item, setKellySuggestions)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-950 flex items-start gap-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0"
                      >
                        <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        <span className="min-w-0 flex-1 text-xs font-semibold text-slate-800 dark:text-slate-100 leading-normal">
                          {item.displayName || item.shortTitle}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
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
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
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
