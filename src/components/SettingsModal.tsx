'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Zap,
  Globe,
  ArrowLeftRight,
  Layers,
} from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

export const AI_CONFIG_KEY = 'nosso_lar_universal_ai_config_v4';

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

export const DEFAULT_MODELS: Record<AIProvider, { id: string; name: string }[]> = {
  gemini: [
    { id: 'gemini-1.5-flash', name: 'Google Gemini 1.5 Flash (Super Rápido & Recomendado)' },
    { id: 'gemini-1.5-pro', name: 'Google Gemini 1.5 Pro (Raciocínio Profundo)' },
    { id: 'gemini-2.0-flash-exp', name: 'Google Gemini 2.0 Flash (Experimental Ultra-Fast)' },
  ],
  openai: [
    { id: 'gpt-4o-mini', name: 'OpenAI GPT-4o Mini (Rápido e Inteligente)' },
    { id: 'gpt-4o', name: 'OpenAI GPT-4o (Visão e Precisão Máxima)' },
    { id: 'gpt-3.5-turbo', name: 'OpenAI GPT-3.5 Turbo' },
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', name: 'Groq Llama 3.3 70B (Velocidade Extrema)' },
    { id: 'mixtral-8x7b-32768', name: 'Groq Mixtral 8x7B' },
  ],
  custom: [
    { id: 'deepseek-chat', name: 'DeepSeek V3 / Chat' },
    { id: 'custom-model', name: 'Modelo Personalizado' },
  ],
};

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

export function getStoredAIConfig(): AIConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enableAI: parsed.enableAI ?? true,
        enableFallback: parsed.enableFallback ?? true,
        primary: parsed.primary || {
          provider: parsed.provider || 'gemini',
          apiKey: parsed.apiKey || '',
          model: parsed.model || 'gemini-1.5-flash',
        },
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

  const [testingPrimary, setTestingPrimary] = useState(false);
  const [primaryStatus, setPrimaryStatus] = useState<{ ok: boolean; msg: string; latency?: number } | null>(null);

  const [testingFallback, setTestingFallback] = useState(false);
  const [fallbackStatus, setFallbackStatus] = useState<{ ok: boolean; msg: string; latency?: number } | null>(null);

  useEffect(() => {
    if (open) {
      setConfig(getStoredAIConfig());
    }
  }, [open]);

  const currentSection = activeTab === 'primary' ? config.primary : config.fallback;

  const updateCurrentSection = (updates: Partial<AISingleConfig>) => {
    setConfig((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        ...updates,
      },
    }));
  };

  // Swap Primary and Fallback Readers
  const handleSwapReaders = () => {
    setConfig((prev) => ({
      ...prev,
      primary: prev.fallback,
      fallback: prev.primary,
    }));
    setPrimaryStatus(null);
    setFallbackStatus(null);
  };

  // Auto detect provider by key prefix
  const handleKeyChange = (val: string) => {
    const key = val.trim();
    let provider: AIProvider = currentSection.provider;

    if (key.startsWith('AIzaSy')) provider = 'gemini';
    else if (key.startsWith('sk-')) provider = 'openai';
    else if (key.startsWith('gsk_')) provider = 'groq';

    const defaultModel = DEFAULT_MODELS[provider]?.[0]?.id || currentSection.model;

    updateCurrentSection({
      apiKey: key,
      provider,
      model: defaultModel,
    });
  };

  const handleTestConnection = async (target: 'primary' | 'fallback') => {
    const targetCfg = target === 'primary' ? config.primary : config.fallback;
    if (target === 'primary') setTestingPrimary(true);
    else setTestingFallback(true);

    const start = Date.now();

    try {
      const res = await fetch('/api/extract-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: 'https://www.vivareal.com.br/imovel/apartamento-3-quartos-vila-yara-osasco-80m2-id-2904724653/',
          apiKey: targetCfg.apiKey,
          model: targetCfg.model,
          provider: targetCfg.provider,
          customEndpoint: targetCfg.customEndpoint,
        }),
      });

      const json = await res.json();
      const latency = Date.now() - start;

      if (res.ok && json.success) {
        const result = { ok: true, msg: `Conexão bem sucedida (${latency}ms)!`, latency };
        if (target === 'primary') setPrimaryStatus(result);
        else setFallbackStatus(result);
      } else {
        throw new Error(json.error || 'Erro na resposta da IA');
      }
    } catch (err: any) {
      const result = { ok: false, msg: err.message || 'Falha ao conectar.' };
      if (target === 'primary') setPrimaryStatus(result);
      else setFallbackStatus(result);
    } finally {
      if (target === 'primary') setTestingPrimary(false);
      else setTestingFallback(false);
    }
  };

  const handleSave = () => {
    saveStoredAIConfig(config);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="2xl">
      <div className="p-2 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Motor de IA Multi-Provedor com Redundância (Fallback)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Se o 1º Leitor falhar, o 2º Leitor entra em ação automaticamente sem interromper a busca.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Enable Redundancy Checkbox */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Redundância Automática (Fallback de IA)
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableFallback}
                onChange={(e) => setConfig({ ...config, enableFallback: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Reader Tab Switcher & Swap Button */}
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
                <span>🥇 1º Leitor (Principal)</span>
                {config.primary.apiKey && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
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
                <span>🥈 2º Leitor (Fallback)</span>
                {config.fallback.apiKey && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
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

          {/* Current Reader Configuration Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Configurando {activeTab === 'primary' ? '1º Leitor (Principal)' : '2º Leitor (Fallback)'}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 uppercase">
                {currentSection.provider}
              </span>
            </div>

            {/* API Key (Visible by default) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="apiKey" className="text-xs font-semibold">
                  Chave da API (API Key) <span className="text-rose-500">*</span>
                </Label>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                  👁️ Chave Visível
                </span>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="apiKey"
                  type="text"
                  placeholder="Ex: AIzaSy... (Gemini) ou sk-... (OpenAI) ou gsk_... (Groq)"
                  value={currentSection.apiKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  className="pl-9 pr-4 text-xs font-mono bg-slate-50/50 dark:bg-slate-950/50"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                O provedor é reconhecido automaticamente a partir do prefixo da chave.
              </p>
            </div>

            {/* Provider Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['gemini', 'openai', 'groq', 'custom'] as AIProvider[]).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() =>
                    updateCurrentSection({
                      provider: prov,
                      model: DEFAULT_MODELS[prov]?.[0]?.id || currentSection.model,
                    })
                  }
                  className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                    currentSection.provider === prov
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {prov}
                </button>
              ))}
            </div>

            {/* Model Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="model" className="text-xs font-semibold">
                Modelo da Inteligência Artificial
              </Label>
              <select
                id="model"
                value={currentSection.model}
                onChange={(e) => updateCurrentSection({ model: e.target.value })}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 font-medium"
              >
                {DEFAULT_MODELS[currentSection.provider]?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Connection Button & Latency Status */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleTestConnection(activeTab)}
                disabled={activeTab === 'primary' ? testingPrimary : testingFallback}
                className="h-8 text-xs font-bold border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50"
              >
                {(activeTab === 'primary' ? testingPrimary : testingFallback) ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Testando Conexão...
                  </>
                ) : (
                  <>
                    <Zap className="mr-1.5 h-3.5 w-3.5" /> Testar Conexão com este Leitor
                  </>
                )}
              </Button>

              {(activeTab === 'primary' ? primaryStatus : fallbackStatus) && (
                <span
                  className={`text-xs font-bold flex items-center gap-1 ${
                    (activeTab === 'primary' ? primaryStatus : fallbackStatus)?.ok
                      ? 'text-emerald-600'
                      : 'text-rose-500'
                  }`}
                >
                  {(activeTab === 'primary' ? primaryStatus : fallbackStatus)?.ok ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {(activeTab === 'primary' ? primaryStatus : fallbackStatus)?.msg}
                </span>
              )}
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
            Salvar Configurações de Fallback
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
