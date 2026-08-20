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
} from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

export const AI_CONFIG_KEY = 'nosso_lar_universal_ai_config_v6';

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
    { id: 'gemini-1.5-flash', name: 'Google Gemini 1.5 Flash (Super Rápido)' },
    { id: 'gemini-1.5-pro', name: 'Google Gemini 1.5 Pro (Raciocínio Profundo)' },
    { id: 'gemini-2.0-flash-exp', name: 'Google Gemini 2.0 Flash (Experimental)' },
  ],
  openai: [
    { id: 'gpt-4o-mini', name: 'OpenAI GPT-4o Mini' },
    { id: 'gpt-4o', name: 'OpenAI GPT-4o' },
    { id: 'gpt-3.5-turbo', name: 'OpenAI GPT-3.5 Turbo' },
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', name: 'Groq Llama 3.3 70B Versatile (Recomendado)' },
    { id: 'llama-3.1-8b-instant', name: 'Groq Llama 3.1 8B Instant (Ultra Rápido)' },
    { id: 'deepseek-r1-distill-llama-70b', name: 'Groq DeepSeek R1 Distill 70B (Raciocínio)' },
    { id: 'llama-3.2-11b-vision-preview', name: 'Groq Llama 3.2 11B Vision' },
    { id: 'llama-3.2-90b-vision-preview', name: 'Groq Llama 3.2 90B Vision' },
    { id: 'mixtral-8x7b-32768', name: 'Groq Mixtral 8x7B' },
    { id: 'gemma2-9b-it', name: 'Groq Gemma 2 9B' },
    { id: 'qwen-2.5-coder-32b', name: 'Groq Qwen 2.5 Coder 32B' },
  ],
  custom: [
    { id: 'deepseek-chat', name: 'DeepSeek V3' },
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

// Robust Auto Detection Function for API Keys
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

  // Default fallback if unknown key format
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

  const [testingPrimary, setTestingPrimary] = useState(false);
  const [primaryStatus, setPrimaryStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const [testingFallback, setTestingFallback] = useState(false);
  const [fallbackStatus, setFallbackStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (open) {
      setConfig(getStoredAIConfig());
      setPrimaryStatus(null);
      setFallbackStatus(null);
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

  const handleSwapReaders = () => {
    setConfig((prev) => ({
      ...prev,
      primary: prev.fallback,
      fallback: prev.primary,
    }));
    setPrimaryStatus(null);
    setFallbackStatus(null);
  };

  // Auto detect provider by key prefix & sync model
  const handleKeyChange = (val: string) => {
    const key = val.trim();
    const provider = detectProvider(key);
    const availableModels = DEFAULT_MODELS[provider] || DEFAULT_MODELS.gemini;
    
    // Pick first available model for detected provider if previous model belonged to another provider
    const isCurrentModelValid = availableModels.some((m) => m.id === currentSection.model);
    const model = isCurrentModelValid ? currentSection.model : availableModels[0].id;

    updateCurrentSection({
      apiKey: key,
      provider,
      model,
    });
  };

  // Test Connection directly via API provider models endpoint
  const handleTestConnection = async (target: 'primary' | 'fallback') => {
    const targetCfg = target === 'primary' ? config.primary : config.fallback;
    const key = targetCfg.apiKey.trim();

    if (!key) {
      const resErr = { ok: false, msg: 'Informe a Chave API primeiro.' };
      if (target === 'primary') setPrimaryStatus(resErr);
      else setFallbackStatus(resErr);
      return;
    }

    const detected = detectProvider(key);

    if (target === 'primary') setTestingPrimary(true);
    else setTestingFallback(true);

    const start = Date.now();

    try {
      let isOk = false;
      const providerName = detected.toUpperCase();

      if (detected === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        isOk = res.ok;
      } else if (detected === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${key}` },
        });
        isOk = res.ok;
      } else if (detected === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${key}` },
        });
        isOk = res.ok;
      } else {
        isOk = true;
      }

      const latency = Date.now() - start;

      if (isOk) {
        // Sync provider state if needed
        updateCurrentSection({ provider: detected });
        const resOk = { ok: true, msg: `Conectado ao ${providerName} (${latency}ms)` };
        if (target === 'primary') setPrimaryStatus(resOk);
        else setFallbackStatus(resOk);
      } else {
        throw new Error(`Falha de autenticação na API do ${providerName}`);
      }
    } catch (err: any) {
      const resErr = { ok: false, msg: err.message || 'Erro ao conectar com a IA.' };
      if (target === 'primary') setPrimaryStatus(resErr);
      else setFallbackStatus(resErr);
    } finally {
      if (target === 'primary') setTestingPrimary(false);
      else setTestingFallback(false);
    }
  };

  const handleSave = () => {
    saveStoredAIConfig(config);
    onOpenChange(false);
  };

  const getProviderBadge = (provider: AIProvider) => {
    switch (provider) {
      case 'gemini':
        return 'Google Gemini ♊';
      case 'openai':
        return 'OpenAI GPT 🤖';
      case 'groq':
        return 'Groq Llama ⚡';
      case 'custom':
      default:
        return 'Custom AI 🛠️';
    }
  };

  const detectedProvider = detectProvider(currentSection.apiKey);
  const modelsList = DEFAULT_MODELS[detectedProvider] || DEFAULT_MODELS.gemini;

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
                Inteligência Artificial & Redundância
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Se o 1º Leitor falhar, o 2º Leitor entra em ação automaticamente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Redundancy Toggle */}
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

          {/* Reader Selector Tabs */}
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
                <span>2º Leitor (Fallback)</span>
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

          {/* Clean Reader Form with Auto Detected Provider */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {activeTab === 'primary' ? 'Configuração do 1º Leitor' : 'Configuração do 2º Leitor'}
              </span>
              {currentSection.apiKey && (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {getProviderBadge(detectedProvider)}
                </span>
              )}
            </div>

            {/* API Key Input */}
            <div className="space-y-1">
              <Label htmlFor="apiKey" className="text-xs font-semibold">
                Chave da API (API Key)
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="apiKey"
                  type="text"
                  placeholder="Cole sua chave API (Gemini: AIza... / AQ... | Groq: gsk_... | OpenAI: sk-...)"
                  value={currentSection.apiKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  className="pl-9 text-xs font-mono"
                />
              </div>
            </div>

            {/* Model Selector (Syncs automatically with detected provider) */}
            <div className="space-y-1">
              <Label htmlFor="model" className="text-xs font-semibold">
                Modelo da Inteligência Artificial ({getProviderBadge(detectedProvider)})
              </Label>
              <select
                id="model"
                value={currentSection.model}
                onChange={(e) => updateCurrentSection({ model: e.target.value, provider: detectedProvider })}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 font-medium"
              >
                {modelsList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Connection Button & Discrete Status Feedback */}
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
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Testando...
                  </>
                ) : (
                  <>
                    <Zap className="mr-1.5 h-3.5 w-3.5" /> Testar Conexão
                  </>
                )}
              </Button>

              {/* Discreet Status Result */}
              {(activeTab === 'primary' ? primaryStatus : fallbackStatus) && (
                <span
                  className={`text-xs font-medium flex items-center gap-1.5 ${
                    (activeTab === 'primary' ? primaryStatus : fallbackStatus)?.ok
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-rose-500 font-semibold'
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
            Salvar
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
