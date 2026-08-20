'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  ArrowLeftRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

export const AI_CONFIG_KEY = 'nosso_lar_universal_ai_config_v7';

export type AIProvider = 'gemini' | 'openai' | 'groq' | 'custom';

export interface AISingleConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  customEndpoint?: string;
}

export interface AIConfig {
  enableAI: boolean;
  enableFallback: boolean;
  primary: AISingleConfig;
  fallback: AISingleConfig;
}

export const DEFAULT_CONFIG: AIConfig = {
  enableAI: true,
  enableFallback: true,
  primary: {
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-1.5-flash',
  },
  fallback: {
    provider: 'groq',
    apiKey: '',
    model: 'llama-3.3-70b-versatile',
  },
};

export function detectProvider(key: string): AIProvider {
  const cleanKey = key.trim();
  if (!cleanKey) return 'gemini';

  if (cleanKey.startsWith('gsk_')) return 'groq';
  if (cleanKey.startsWith('sk-')) return 'openai';
  if (
    cleanKey.startsWith('AIzaSy') ||
    cleanKey.startsWith('AIza') ||
    cleanKey.startsWith('AQ.') ||
    cleanKey.startsWith('AQ') ||
    cleanKey.length === 39
  ) {
    return 'gemini';
  }

  return 'gemini';
}

export function getStoredAIConfig(): AIConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enableAI: parsed.enableAI ?? true,
        enableFallback: parsed.enableFallback ?? true,
        primary: parsed.primary || DEFAULT_CONFIG.primary,
        fallback: parsed.fallback || DEFAULT_CONFIG.fallback,
      };
    }
  } catch (e) {}
  return DEFAULT_CONFIG;
}

export function saveStoredAIConfig(config: AIConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  }
}

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'primary' | 'fallback'>('primary');

  // Validation & Live Dynamic Models Fetching States
  const [validatingPrimary, setValidatingPrimary] = useState(false);
  const [primaryValidated, setPrimaryValidated] = useState(false);
  const [primaryModels, setPrimaryModels] = useState<{ id: string; name: string }[]>([]);
  const [primaryStatus, setPrimaryStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const [validatingFallback, setValidatingFallback] = useState(false);
  const [fallbackValidated, setFallbackValidated] = useState(false);
  const [fallbackModels, setFallbackModels] = useState<{ id: string; name: string }[]>([]);
  const [fallbackStatus, setFallbackStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (open) {
      const stored = getStoredAIConfig();
      setConfig(stored);

      // Auto-validate existing keys on open
      if (stored.primary.apiKey) {
        setPrimaryValidated(true);
        fetchModelsForKey(stored.primary.apiKey, 'primary', stored.primary.model);
      } else {
        setPrimaryValidated(false);
      }

      if (stored.fallback.apiKey) {
        setFallbackValidated(true);
        fetchModelsForKey(stored.fallback.apiKey, 'fallback', stored.fallback.model);
      } else {
        setFallbackValidated(false);
      }
    }
  }, [open]);

  const currentSection = activeTab === 'primary' ? config.primary : config.fallback;
  const isValidated = activeTab === 'primary' ? primaryValidated : fallbackValidated;
  const currentModels = activeTab === 'primary' ? primaryModels : fallbackModels;
  const isValidating = activeTab === 'primary' ? validatingPrimary : validatingFallback;
  const currentStatus = activeTab === 'primary' ? primaryStatus : fallbackStatus;

  const updateCurrentSection = (updates: Partial<AISingleConfig>) => {
    setConfig((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        ...updates,
      },
    }));
  };

  const handleSwapReaders = () => {
    setConfig((prev) => ({
      ...prev,
      primary: prev.fallback,
      fallback: prev.primary,
    }));
    // Swap validated states
    const tempVal = primaryValidated;
    setPrimaryValidated(fallbackValidated);
    setFallbackValidated(tempVal);

    const tempModels = primaryModels;
    setPrimaryModels(fallbackModels);
    setFallbackModels(tempModels);

    setPrimaryStatus(null);
    setFallbackStatus(null);
  };

  const handleKeyInputChange = (val: string) => {
    const key = val.trim();
    const provider = detectProvider(key);

    if (activeTab === 'primary') setPrimaryValidated(false);
    else setFallbackValidated(false);

    updateCurrentSection({
      apiKey: key,
      provider,
    });
  };

  // Live Model Fetcher and Key Connection Validator
  const fetchModelsForKey = async (key: string, target: 'primary' | 'fallback', initialModelSelect?: string) => {
    if (!key.trim()) return;

    if (target === 'primary') setValidatingPrimary(true);
    else setValidatingFallback(true);

    const detectedProvider = detectProvider(key);
    const start = Date.now();

    try {
      let models: { id: string; name: string }[] = [];

      if (detectedProvider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (!res.ok) throw new Error('Chave inválida ou erro na API do Google.');
        const data = await res.json();
        if (data.models && Array.isArray(data.models)) {
          models = data.models
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => {
              const cleanId = m.name.replace('models/', '');
              return { id: cleanId, name: cleanId };
            });
        }
      } else if (detectedProvider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (!res.ok) throw new Error('Chave inválida ou erro na API OpenAI.');
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          models = data.data
            .filter((m: any) => m.id.includes('gpt'))
            .map((m: any) => ({ id: m.id, name: m.id }));
        }
      } else if (detectedProvider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (!res.ok) throw new Error('Chave inválida ou erro na API Groq.');
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          models = data.data.map((m: any) => ({ id: m.id, name: m.id }));
        }
      }

      if (models.length === 0) {
        models = [
          { id: 'gemini-1.5-flash', name: 'gemini-1.5-flash' },
          { id: 'llama-3.3-70b-versatile', name: 'llama-3.3-70b-versatile' },
          { id: 'gpt-4o-mini', name: 'gpt-4o-mini' },
        ];
      }

      const latency = Date.now() - start;
      const statusObj = { ok: true, msg: `Conexão Validada (${latency}ms)` };

      if (target === 'primary') {
        setPrimaryValidated(true);
        setPrimaryModels(models);
        setPrimaryStatus(statusObj);
      } else {
        setFallbackValidated(true);
        setFallbackModels(models);
        setFallbackStatus(statusObj);
      }

      // Auto pick model if not set or not in list
      const chosenModel = initialModelSelect || (models[0] ? models[0].id : '');
      setConfig((prev) => ({
        ...prev,
        [target]: {
          ...prev[target],
          provider: detectedProvider,
          model: chosenModel,
        },
      }));
    } catch (err: any) {
      const statusObj = { ok: false, msg: err.message || 'Falha ao validar chave.' };
      if (target === 'primary') {
        setPrimaryValidated(false);
        setPrimaryStatus(statusObj);
      } else {
        setFallbackValidated(false);
        setFallbackStatus(statusObj);
      }
    } finally {
      if (target === 'primary') setValidatingPrimary(false);
      else setValidatingFallback(false);
    }
  };

  const handleValidateClick = () => {
    fetchModelsForKey(currentSection.apiKey, activeTab);
  };

  const handleSave = () => {
    saveStoredAIConfig(config);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="lg">
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                Configuração de Inteligência Artificial
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Se o 1º Leitor falhar, o 2º Leitor entra em ação automaticamente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Redundancy Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Redundância Automática (Fallback)
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableFallback}
                onChange={(e) => setConfig({ ...config, enableFallback: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Reader Tab Switcher */}
          <div className="flex items-center justify-between gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <div className="flex gap-1 flex-1">
              <button
                type="button"
                onClick={() => setActiveTab('primary')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'primary'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>1º Leitor (Principal)</span>
                {primaryValidated && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('fallback')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'fallback'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>2º Leitor (Fallback)</span>
                {fallbackValidated && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSwapReaders}
              title="Alternar Leitor Principal e Secundário"
              className="h-8 px-2 text-xs font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 shrink-0"
            >
              <ArrowLeftRight className="h-3.5 w-3.5 mr-1" /> Alternar 1º ↔ 2º
            </Button>
          </div>

          {/* Clean & Discreet Reader Form */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            {/* Field 1: API Key */}
            <div className="space-y-1.5">
              <Label htmlFor="apiKey" className="text-xs font-semibold">
                Chave da API
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="apiKey"
                  type="text"
                  placeholder="Insira a sua Chave da API..."
                  value={currentSection.apiKey}
                  onChange={(e) => handleKeyInputChange(e.target.value)}
                  className="pl-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Field 2: Button to Test/Validate & Fetch Dynamic Models */}
            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                onClick={handleValidateClick}
                disabled={isValidating || !currentSection.apiKey.trim()}
                className="h-8 px-3 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Validando...
                  </>
                ) : (
                  <>
                    <Zap className="mr-1.5 h-3.5 w-3.5" /> Validar & Buscar Modelos
                  </>
                )}
              </Button>

              {/* Discreet Status Feedback */}
              {currentStatus && (
                <span
                  className={`text-xs flex items-center gap-1.5 ${
                    currentStatus.ok
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-rose-500 font-semibold'
                  }`}
                >
                  {currentStatus.ok ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {currentStatus.msg}
                </span>
              )}
            </div>

            {/* Field 3: Dynamic Model Selector (Appears ONLY after Validation!) */}
            {isValidated && currentModels.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                <Label htmlFor="model" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Modelos Disponíveis da Chave
                </Label>
                <select
                  id="model"
                  value={currentSection.model}
                  onChange={(e) => updateCurrentSection({ model: e.target.value })}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 font-medium"
                >
                  {currentModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
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
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
          >
            Salvar
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
