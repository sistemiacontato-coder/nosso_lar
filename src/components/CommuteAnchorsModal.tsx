'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Save, Compass, Loader2, Heart } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { CommuteAnchors } from '@/types/property';

export const COMMUTE_ANCHORS_KEY = 'nosso_lar_commute_anchors_v1';

export const DEFAULT_COMMUTE_ANCHORS: CommuteAnchors = {
  saymonWork: 'Avenida Brigadeiro Faria Lima, 3477, Itaim Bibi, São Paulo, SP, 04538-133, Brasil',
  kellyWork: 'Avenida Paulista, 1000, Bela Vista, São Paulo, SP, 01310-100, Brasil',
};

export function getStoredCommuteAnchors(): CommuteAnchors {
  if (typeof window === 'undefined') return DEFAULT_COMMUTE_ANCHORS;
  try {
    const raw = localStorage.getItem(COMMUTE_ANCHORS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        saymonWork: parsed.saymonWork || DEFAULT_COMMUTE_ANCHORS.saymonWork,
        kellyWork: parsed.kellyWork || DEFAULT_COMMUTE_ANCHORS.kellyWork,
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
}

export function CommuteAnchorsModal({ open, onOpenChange, onSave }: CommuteAnchorsModalProps) {
  const [anchors, setAnchors] = useState<CommuteAnchors>(DEFAULT_COMMUTE_ANCHORS);
  const [saymonSuggestions, setSaymonSuggestions] = useState<AddressSuggestion[]>([]);
  const [kellySuggestions, setKellySuggestions] = useState<AddressSuggestion[]>([]);
  const [loadingSaymon, setLoadingSaymon] = useState(false);
  const [loadingKelly, setLoadingKelly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAnchors(getStoredCommuteAnchors());
    }
  }, [open]);

  // Autocomplete fetch for Saymon address
  const handleSaymonInputChange = async (val: string) => {
    setAnchors((prev) => ({ ...prev, saymonWork: val }));
    if (val.trim().length >= 3) {
      setLoadingSaymon(true);
      try {
        const res = await fetch(`/api/geocode-address?q=${encodeURIComponent(val)}`);
        const json = await res.json();
        if (json.success) {
          setSaymonSuggestions(json.suggestions || []);
        }
      } catch (e) {
      } finally {
        setLoadingSaymon(false);
      }
    } else {
      setSaymonSuggestions([]);
    }
  };

  // Autocomplete fetch for Kelly address
  const handleKellyInputChange = async (val: string) => {
    setAnchors((prev) => ({ ...prev, kellyWork: val }));
    if (val.trim().length >= 3) {
      setLoadingKelly(true);
      try {
        const res = await fetch(`/api/geocode-address?q=${encodeURIComponent(val)}`);
        const json = await res.json();
        if (json.success) {
          setKellySuggestions(json.suggestions || []);
        }
      } catch (e) {
      } finally {
        setLoadingKelly(false);
      }
    } else {
      setKellySuggestions([]);
    }
  };

  // Preserve typed house number and full details for Saymon
  const handleSelectSaymonSuggestion = (item: AddressSuggestion) => {
    const raw = anchors.saymonWork || '';
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

    setAnchors((prev) => ({ ...prev, saymonWork: fullAddress }));
    setSaymonSuggestions([]);
  };

  // Preserve typed house number and full details for Kelly
  const handleSelectKellySuggestion = (item: AddressSuggestion) => {
    const raw = anchors.kellyWork || '';
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

    setAnchors((prev) => ({ ...prev, kellyWork: fullAddress }));
    setKellySuggestions([]);
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
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <div className="space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-500/20 shrink-0">
              <Heart className="h-5 w-5 fill-white" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white">
                Perfil do Casal — Cadastro Único de Endereços Fixos
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Ao selecionar o endereço, mantemos o número digitado e todas as informações completas (bairro, cidade, CEP). O sistema usará esses pontos fixos para recalcular automaticamente todos os imóveis!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Saymon Anchor */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2 relative">
            <div className="flex items-center justify-between">
              <Label htmlFor="saymonWork" className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <span className="text-base">🧑🏻‍🦱</span> Endereço Fixo do Saymon (Trabalho / Interesse)
              </Label>
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">Saymon</span>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500" />
              <Input
                id="saymonWork"
                type="text"
                placeholder="Digite o endereço completo com número (ex: Rua Miguel Rashid, 205)..."
                value={anchors.saymonWork}
                onChange={(e) => handleSaymonInputChange(e.target.value)}
                className="pl-9 pr-8 text-xs bg-white dark:bg-slate-900"
              />
              {loadingSaymon && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-indigo-500" />
              )}
            </div>

            {/* Suggestions dropdown for Saymon */}
            {saymonSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 shadow-2xl py-1 text-xs">
                {saymonSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSaymonSuggestion(item)}
                    className="w-full text-left px-3.5 py-2.5 text-slate-800 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950 flex items-start gap-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0 font-medium"
                  >
                    <MapPin className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="min-w-0 flex-1 text-xs leading-normal font-semibold text-slate-800 dark:text-slate-100">
                      {item.displayName || item.shortTitle}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Kelly Anchor */}
          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 space-y-2 relative">
            <div className="flex items-center justify-between">
              <Label htmlFor="kellyWork" className="text-xs font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                <span className="text-base">👩🏻‍🦱</span> Endereço Fixo da Kelly (Trabalho / Interesse)
              </Label>
              <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider">Kelly</span>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-rose-500" />
              <Input
                id="kellyWork"
                type="text"
                placeholder="Digite o endereço completo com número (ex: Av. Paulista, 1000)..."
                value={anchors.kellyWork}
                onChange={(e) => handleKellyInputChange(e.target.value)}
                className="pl-9 pr-8 text-xs bg-white dark:bg-slate-900"
              />
              {loadingKelly && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-rose-500" />
              )}
            </div>

            {/* Suggestions dropdown for Kelly */}
            {kellySuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 shadow-2xl py-1 text-xs">
                {kellySuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectKellySuggestion(item)}
                    className="w-full text-left px-3.5 py-2.5 text-slate-800 dark:text-slate-100 hover:bg-rose-50 dark:hover:bg-rose-950 flex items-start gap-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0 font-medium"
                  >
                    <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="min-w-0 flex-1 text-xs leading-normal font-semibold text-slate-800 dark:text-slate-100">
                      {item.displayName || item.shortTitle}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
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
                <Save className="mr-1.5 h-4 w-4" /> Salvar Perfil & Recalcular
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
