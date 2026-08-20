'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Save, Compass } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { CommuteAnchors } from '@/types/property';

export const COMMUTE_ANCHORS_KEY = 'nosso_lar_commute_anchors_v1';

export const DEFAULT_COMMUTE_ANCHORS: CommuteAnchors = {
  saymonWork: 'Vila Olímpia / Faria Lima — São Paulo',
  kellyWork: 'Pinheiros / Rebouças — São Paulo',
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

interface CommuteAnchorsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (anchors: CommuteAnchors) => void;
}

export function CommuteAnchorsModal({ open, onOpenChange, onSave }: CommuteAnchorsModalProps) {
  const [anchors, setAnchors] = useState<CommuteAnchors>(DEFAULT_COMMUTE_ANCHORS);

  useEffect(() => {
    if (open) {
      setAnchors(getStoredCommuteAnchors());
    }
  }, [open]);

  const handleSave = () => {
    saveStoredCommuteAnchors(anchors);
    if (onSave) onSave(anchors);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                Pontos de Referência de Deslocamento
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Cadastre os endereços/locais de trabalho do Saymon e da Kelly para calcular o tempo até os imóveis.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Saymon Anchor */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="saymonWork" className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <span className="text-base">🧑🏻‍🦱</span> Ponto de Referência do Saymon (Trabalho)
              </Label>
              <span className="text-[10px] font-bold text-indigo-600 uppercase">Saymon</span>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-indigo-500" />
              <Input
                id="saymonWork"
                type="text"
                placeholder="Ex: Av. Faria Lima / Vila Olímpia - SP"
                value={anchors.saymonWork}
                onChange={(e) => setAnchors({ ...anchors, saymonWork: e.target.value })}
                className="pl-9 text-xs"
              />
            </div>
          </div>

          {/* Kelly Anchor */}
          <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="kellyWork" className="text-xs font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                <span className="text-base">👩🏻‍🦱</span> Ponto de Referência da Kelly (Trabalho)
              </Label>
              <span className="text-[10px] font-bold text-rose-600 uppercase">Kelly</span>
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-rose-500" />
              <Input
                id="kellyWork"
                type="text"
                placeholder="Ex: Rua dos Pinheiros / Faria Lima - SP"
                value={anchors.kellyWork}
                onChange={(e) => setAnchors({ ...anchors, kellyWork: e.target.value })}
                className="pl-9 text-xs"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
          >
            <Save className="mr-1.5 h-4 w-4" /> Salvar Pontos de Referência
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
