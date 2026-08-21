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
  MapPin,
} from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

export const AI_CONFIG_KEY = 'nosso_lar_universal_ai_config_v9';

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
  onClearRatings?: () => void;
}

export function SettingsModal({ open, onOpenChange, onClearRatings }: SettingsModalProps) {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [googleMapsKey, setGoogleMapsKey] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'primary' | 'fallback'>('primary');

  // Dynamic Validation States
  const [validatingPrimary, setValidatingPrimary] = useState(false);
  const [primaryValidated, setPrimaryValidated] = useState(false);
  const [primaryProviderName, setPrimaryProviderName] = useState<string>('');
  const [primaryModels, setPrimaryModels] = useState<{ id: string; name: string }[]>([]);
  const [primaryStatus, setPrimaryStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const [validatingFallback, setValidatingFallback] = useState(false);
  const [fallbackValidated, setFallbackValidated] = useState(false);
  const [fallbackProviderName, setFallbackProviderName] = useState<string>('');
  const [fallbackModels, setFallbackModels] = useState<{ id: string; name: string }[]>([]);
  const [fallbackStatus, setFallbackStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const [validatingGoogle, setValidatingGoogle] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleTestGoogleMapsKey = async () => {
    if (!googleMapsKey.trim()) {
      setGoogleStatus({ ok: false, msg: 'Informe a chave do Google Maps antes de testar.' });
      return;
    }
    setValidatingGoogle(true);
    setGoogleStatus(null);
    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: googleMapsKey.trim(), type: 'google_maps' }),
      });
      const data = await res.json();
      if (data.success) {
        setGoogleStatus({ ok: true, msg: 'Chave do Google Maps validada e autorizada com sucesso! 🟢' });
      } else {
        setGoogleStatus({ ok: false, msg: data.error || 'Chave recusada pelo Google Maps.' });
      }
    } catch (e: any) {
      setGoogleStatus({ ok: false, msg: 'Erro ao conectar ao servidor do Google Maps.' });
    } finally {
      setValidatingGoogle(false);
    }
  };

  useEffect(() => {
    if (open) {
      setResetMessage(null);
      setGoogleMapsKey(localStorage.getItem('nosso_lar_google_maps_key') || '');
      const stored = getStoredAIConfig();
      setConfig(stored);

      if (stored.primary.apiKey) {
        fetchModelsForKey(stored.primary.apiKey, 'primary', stored.primary.model);
      } else {
        setPrimaryValidated(false);
      }

      if (stored.fallback.apiKey) {
        fetchModelsForKey(stored.fallback.apiKey, 'fallback', stored.fallback.model);
      } else {
        setFallbackValidated(false);
      }
    }
  }, [open]);

  const currentSection = activeTab === 'primary' ? config.primary : config.fallback;
  const isValidated = activeTab === 'primary' ? primaryValidated : fallbackValidated;
  const providerDisplayName = activeTab === 'primary' ? primaryProviderName : fallbackProviderName;
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

    const tempVal = primaryValidated;
    setPrimaryValidated(fallbackValidated);
    setFallbackValidated(tempVal);

    const tempProvName = primaryProviderName;
    setPrimaryProviderName(fallbackProviderName);
    setFallbackProviderName(tempProvName);

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

  const fetchModelsForKey = async (key: string, target: 'primary' | 'fallback', initialModelSelect?: string) => {
    if (!key.trim()) return;

    if (target === 'primary') setValidatingPrimary(true);
    else setValidatingFallback(true);

    try {
      const res = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key.trim() }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Chave API inválida ou sem acesso.');
      }

      const models: { id: string; name: string }[] = json.models || [];
      const latency: number = json.latency || 200;
      const detectedProvider: AIProvider = json.provider || detectProvider(key);
      const providerName: string = json.providerName || detectedProvider.toUpperCase();

      const statusObj = { ok: true, msg: `Conexão Validada (${latency}ms)` };

      if (target === 'primary') {
        setPrimaryValidated(true);
        setPrimaryProviderName(providerName);
        setPrimaryModels(models);
        setPrimaryStatus(statusObj);
      } else {
        setFallbackValidated(true);
        setFallbackProviderName(providerName);
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
                Configurações
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Se o 1º Leitor falhar, o 2º Leitor entra em ação automaticamente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Zerar Avaliações & Status */}
          {onClearRatings && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs">
                <div>
                  <div className="font-bold text-rose-800 dark:text-rose-300">Zerar Notas & Status</div>
                  <div className="text-[11px] text-rose-600 dark:text-rose-400">
                    Limpa todas as notas do Saymon e da Kelly e altera o status para "Para Analisar".
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    onClearRatings();
                    setResetMessage('Notas e vereditos zerados com sucesso!');
                  }}
                  className="shrink-0 text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-950 border-rose-300 font-bold"
                >
                  Zerar Notas
                </Button>
              </div>
              {resetMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{resetMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* Google Maps API Key Card */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-blue-950 dark:text-blue-200">
                  Chave API Oficial do Google Maps (Opcional)
                </span>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                Google Maps
              </span>
            </div>
            <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-snug">
              Insira sua chave para utilizar a <strong>Distance Matrix & Geocoding API oficial do Google</strong> com trânsito em tempo real!
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Cole sua API Key do Google Maps (ex: AIzaSy...)..."
                  value={googleMapsKey}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    setGoogleMapsKey(val);
                    setGoogleStatus(null);
                    localStorage.setItem('nosso_lar_google_maps_key', val);
                  }}
                  className="text-xs bg-white dark:bg-slate-900 flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleTestGoogleMapsKey}
                  disabled={validatingGoogle || !googleMapsKey.trim()}
                  className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1 rounded-xl shadow-xs"
                >
                  {validatingGoogle ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    'Testar API'
                  )}
                </Button>
              </div>

              {googleStatus && (
                <div
                  className={`flex items-start gap-2 text-[11px] font-bold p-2.5 rounded-xl border leading-relaxed ${
                    googleStatus.ok
                      ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800'
                      : 'text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {googleStatus.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{googleStatus.msg}</span>
                </div>
              )}
            </div>
          </div>

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

          {/* Clean Reader Form */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            {/* Field 1: API Key Label + Aligned Provider Name Badge */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="apiKey" className="text-xs font-semibold">
                  Chave da API
                </Label>
                {isValidated && providerDisplayName && (
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 tracking-wider uppercase">
                    {providerDisplayName}
                  </span>
                )}
              </div>
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

            {/* Field 2: Validate Button & Status */}
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

            {/* Field 3: Model Selector */}
            {isValidated && currentModels.length > 0 && (
              <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
                <Label htmlFor="model" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Selecione o Modelo para este Leitor
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
