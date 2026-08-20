'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Save, Compass, Loader2, Heart, Plus, Trash2, Check } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { CommuteAnchors } from '@/types/property';

export const COMMUTE_ANCHORS_KEY = 'nosso_lar_commute_anchors_v2';

export const DEFAULT_COMMUTE_ANCHORS: CommuteAnchors = {
  saymonAddress1: 'Vila Olímpia / Faria Lima — São Paulo',
  saymonAddress2: '',
  kellyAddress1: 'Pinheiros / Rebouças — São Paulo',
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
        saymonAddress2: parsed.saymonAddress2 || '',
        kellyAddress1: parsed.kellyAddress1 || parsed.kellyWork || DEFAULT_COMMUTE_ANCHORS.kellyAddress1,
        kellyAddress2: parsed.kellyAddress2 || '',
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
  const [saymon1Suggestions, setSaymon1Suggestions] = useState<AddressSuggestion[]>([]);
  const [saymon2Suggestions, setSaymon2Suggestions] = useState<AddressSuggestion[]>([]);
  const [kelly1Suggestions, setKelly1Suggestions] = useState<AddressSuggestion[]>([]);
  const [kelly2Suggestions, setKelly2Suggestions] = useState<AddressSuggestion[]>([]);

  // Loading states
  const [loadingSaymon1, setLoadingSaymon1] = useState(false);
  const [loadingSaymon2, setLoadingSaymon2] = useState(false);
  const [loadingKelly1, setLoadingKelly1] = useState(false);
  const [loadingKelly2, setLoadingKelly2] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAnchors(getStoredCommuteAnchors());
      setSaymon1Suggestions([]);
      setSaymon2Suggestions([]);
      setKelly1Suggestions([]);
      setKelly2Suggestions([]);
    }
  }, [open]);

  // Autocomplete fetch helper
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
    field: keyof CommuteAnchors,
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
      } else {
        fullAddress = `${fullAddress}, ${houseNum}`;
      }
    }

    setAnchors((prev) => ({ ...prev, [field]: fullAddress }));
    setSuggestions([]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    saveStoredCommuteAnchors(anchors);
    if (onSave) {
      await onSave(anchors);
    }
    setIsSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="lg">
      <div className="space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 text-white font-bold shadow-md shadow-rose-500/20 shrink-0">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
                Cadastro de Endereços de Interesse (Perfil Saymon & Kelly)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Cadastre até 2 endereços fixos por perfil (ex: Trabalho, Faculdade, Família). O sistema calculará automaticamente o deslocamento para todos os imóveis!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2 max-h-[70vh] overflow-y-auto pr-1">
          {/* SECTION: SAYMON (HOMEM MORENO) */}
          {(targetUser === 'both' || targetUser === 'saymon') && (
            <div className="p-4 rounded-3xl bg-gradient-to-b from-indigo-50/80 to-purple-50/40 dark:from-indigo-950/40 dark:to-purple-950/20 border border-indigo-200/80 dark:border-indigo-800/80 space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/60 pb-2">
                <span className="text-xs font-black text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                  <span className="text-lg">🧑🏻‍🦱</span> Perfil do Saymon (Até 2 Endereços)
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  Saymon
                </span>
              </div>

              {/* Saymon Endereço 1 */}
              <div className="space-y-1.5 relative">
                <Label htmlFor="saymonAddress1" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  1º Endereço de Interesse (ex: Trabalho Principal / Empresa)
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500" />
                  <Input
                    id="saymonAddress1"
                    placeholder="Digite o endereço 1 (ex: Av. Paulista, 1000, São Paulo)..."
                    value={anchors.saymonAddress1}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnchors((prev) => ({ ...prev, saymonAddress1: val }));
                      fetchAddressSuggestions(val, setSaymon1Suggestions, setLoadingSaymon1);
                    }}
                    className="pl-9 pr-8 text-xs bg-white dark:bg-slate-900"
                  />
                  {loadingSaymon1 && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-indigo-500" />
                  )}
                </div>

                {saymon1Suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 shadow-2xl py-1 text-xs">
                    {saymon1Suggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion('saymonAddress1', item, setSaymon1Suggestions)}
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

              {/* Saymon Endereço 2 */}
              <div className="space-y-1.5 relative">
                <Label htmlFor="saymonAddress2" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  2º Endereço de Interesse (opcional - ex: Faculdade, Ponto de Apoio)
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-indigo-400" />
                  <Input
                    id="saymonAddress2"
                    placeholder="Digite o 2º endereço de interesse do Saymon..."
                    value={anchors.saymonAddress2 || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnchors((prev) => ({ ...prev, saymonAddress2: val }));
                      fetchAddressSuggestions(val, setSaymon2Suggestions, setLoadingSaymon2);
                    }}
                    className="pl-9 pr-8 text-xs bg-white dark:bg-slate-900"
                  />
                  {loadingSaymon2 && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-indigo-500" />
                  )}
                </div>

                {saymon2Suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 shadow-2xl py-1 text-xs">
                    {saymon2Suggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion('saymonAddress2', item, setSaymon2Suggestions)}
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

          {/* SECTION: KELLY (MULHER MORENA) */}
          {(targetUser === 'both' || targetUser === 'kelly') && (
            <div className="p-4 rounded-3xl bg-gradient-to-b from-rose-50/80 to-pink-50/40 dark:from-rose-950/40 dark:to-pink-950/20 border border-rose-200/80 dark:border-rose-800/80 space-y-3">
              <div className="flex items-center justify-between border-b border-rose-100 dark:border-rose-900/60 pb-2">
                <span className="text-xs font-black text-rose-950 dark:text-rose-200 flex items-center gap-2">
                  <span className="text-lg">👩🏻‍🦱</span> Perfil da Kelly (Até 2 Endereços)
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300">
                  Kelly
                </span>
              </div>

              {/* Kelly Endereço 1 */}
              <div className="space-y-1.5 relative">
                <Label htmlFor="kellyAddress1" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  1º Endereço de Interesse (ex: Trabalho Principal / Empresa)
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-rose-500" />
                  <Input
                    id="kellyAddress1"
                    placeholder="Digite o endereço 1 (ex: Faria Lima, 2000, São Paulo)..."
                    value={anchors.kellyAddress1}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnchors((prev) => ({ ...prev, kellyAddress1: val }));
                      fetchAddressSuggestions(val, setKelly1Suggestions, setLoadingKelly1);
                    }}
                    className="pl-9 pr-8 text-xs bg-white dark:bg-slate-900"
                  />
                  {loadingKelly1 && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-rose-500" />
                  )}
                </div>

                {kelly1Suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 shadow-2xl py-1 text-xs">
                    {kelly1Suggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion('kellyAddress1', item, setKelly1Suggestions)}
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

              {/* Kelly Endereço 2 */}
              <div className="space-y-1.5 relative">
                <Label htmlFor="kellyAddress2" className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  2º Endereço de Interesse (opcional - ex: Casa da Família, Faculdade)
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-rose-400" />
                  <Input
                    id="kellyAddress2"
                    placeholder="Digite o 2º endereço de interesse da Kelly..."
                    value={anchors.kellyAddress2 || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAnchors((prev) => ({ ...prev, kellyAddress2: val }));
                      fetchAddressSuggestions(val, setKelly2Suggestions, setLoadingKelly2);
                    }}
                    className="pl-9 pr-8 text-xs bg-white dark:bg-slate-900"
                  />
                  {loadingKelly2 && (
                    <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-rose-500" />
                  )}
                </div>

                {kelly2Suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 shadow-2xl py-1 text-xs">
                    {kelly2Suggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion('kellyAddress2', item, setKelly2Suggestions)}
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

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Recalculando Todos os Imóveis...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" /> Salvar Perfil & Recalcular Tempos
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
