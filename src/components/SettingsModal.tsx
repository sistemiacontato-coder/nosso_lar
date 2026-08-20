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
} from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

export const AI_CONFIG_KEY = 'nosso_lar_universal_ai_config_v2';

export type AIProvider = 'gemini' | 'openai' | 'groq' | 'custom';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  customEndpoint?: string;
  enableAI: boolean;
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

export function getStoredAIConfig(): AIConfig {
  if (typeof window === 'undefined') {
    return { provider: 'gemini', apiKey: '', model: 'gemini-1.5-flash', enableAI: true };
  }
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return { provider: 'gemini', apiKey: '', model: 'gemini-1.5-flash', enableAI: true };
}

export function SettingsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-1.5-flash');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [enableAI, setEnableAI] = useState(true);
  const [showKey, setShowKey] = useState(false);

  const [availableModels, setAvailableModels] = useState<{ id: string; name: string }[]>(DEFAULT_MODELS.gemini);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  useEffect(() => {
    if (open) {
      const cfg = getStoredAIConfig();
      setProvider(cfg.provider || 'gemini');
      setApiKey(cfg.apiKey || '');
      setModel(cfg.model || 'gemini-1.5-flash');
      setCustomEndpoint(cfg.customEndpoint || '');
      setEnableAI(cfg.enableAI ?? true);
      setTestResult(null);
      setAvailableModels(DEFAULT_MODELS[cfg.provider || 'gemini'] || DEFAULT_MODELS.gemini);
    }
  }, [open]);

  // Auto-Detect Provider based on API key prefix
  const handleApiKeyChange = (val: string) => {
    const cleanKey = val.trim();
    setApiKey(cleanKey);

    let detected: AIProvider | null = null;
    if (cleanKey.startsWith('AIzaSy')) {
      detected = 'gemini';
    } else if (cleanKey.startsWith('sk-proj-') || cleanKey.startsWith('sk-admin-') || (cleanKey.startsWith('sk-') && !cleanKey.startsWith('gsk_'))) {
      detected = 'openai';
    } else if (cleanKey.startsWith('gsk_')) {
      detected = 'groq';
    }

    if (detected && detected !== provider) {
      setProvider(detected);
      const defaultMods = DEFAULT_MODELS[detected] || [];
      setAvailableModels(defaultMods);
      if (defaultMods.length > 0) {
        setModel(defaultMods[0].id);
      }
    }
  };

  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    const mods = DEFAULT_MODELS[newProvider] || [];
    setAvailableModels(mods);
    if (mods.length > 0) {
      setModel(mods[0].id);
    }
  };

  // Fetch Live Available Models from API Provider
  const handleFetchLiveModels = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Cole a Chave da API antes de buscar os modelos.' });
      return;
    }

    setIsFetchingModels(true);
    setTestResult(null);

    try {
      if (provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`);
        const data = await res.json();
        if (data.models && Array.isArray(data.models)) {
          const list = data.models
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => ({
              id: m.name.replace('models/', ''),
              name: `${m.displayName || m.name} (${m.description ? m.description.slice(0, 40) + '...' : 'Gemini'})`,
            }));
          if (list.length > 0) {
            setAvailableModels(list);
            setModel(list[0].id);
            setTestResult({ success: true, message: `✨ ${list.length} modelos Gemini detectados automaticamente!` });
          }
        } else {
          throw new Error(data.error?.message || 'Falha ao listar modelos Gemini.');
        }
      } else if (provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey.trim()}` },
        });
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          const list = data.data
            .filter((m: any) => m.id.includes('gpt'))
            .map((m: any) => ({ id: m.id, name: `OpenAI ${m.id}` }));
          if (list.length > 0) {
            setAvailableModels(list);
            setModel(list[0].id);
            setTestResult({ success: true, message: `✨ ${list.length} modelos OpenAI detectados automaticamente!` });
          }
        } else {
          throw new Error(data.error?.message || 'Chave OpenAI inválida.');
        }
      } else if (provider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { Authorization: `Bearer ${apiKey.trim()}` },
        });
        const data = await res.json();
        if (data.data && Array.isArray(data.data)) {
          const list = data.data.map((m: any) => ({ id: m.id, name: `Groq ${m.id}` }));
          if (list.length > 0) {
            setAvailableModels(list);
            setModel(list[0].id);
            setTestResult({ success: true, message: `✨ ${list.length} modelos Groq detectados automaticamente!` });
          }
        } else {
          throw new Error(data.error?.message || 'Chave Groq inválida.');
        }
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `Erro ao detectar modelos: ${err.message}` });
    } finally {
      setIsFetchingModels(false);
    }
  };

  // Test Connection Handler
  const handleTestAPI = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Insira a Chave da API para testar.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    const startMs = Date.now();

    try {
      if (provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Responda com 1 palavra: OK' }] }],
          }),
        });
        const data = await res.json();
        const latency = Date.now() - startMs;
        if (res.ok && data.candidates) {
          setTestResult({ success: true, message: `🤖 Conexão com Google Gemini (${model}) OK!`, latencyMs: latency });
        } else {
          throw new Error(data.error?.message || 'Chave do Gemini recusada.');
        }
      } else if (provider === 'openai' || provider === 'groq' || provider === 'custom') {
        const endpoint = provider === 'openai'
          ? 'https://api.openai.com/v1/chat/completions'
          : provider === 'groq'
          ? 'https://api.groq.com/openai/v1/chat/completions'
          : customEndpoint || 'https://api.openai.com/v1/chat/completions';

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: 'Responda com 1 palavra: OK' }],
            max_tokens: 10,
          }),
        });

        const data = await res.json();
        const latency = Date.now() - startMs;
        if (res.ok && data.choices) {
          setTestResult({ success: true, message: `⚡ Conexão com ${provider.toUpperCase()} (${model}) OK!`, latencyMs: latency });
        } else {
          throw new Error(data.error?.message || 'Falha ao autenticar.');
        }
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `Erro de conexão: ${err.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    const cfg: AIConfig = {
      provider,
      apiKey: apiKey.trim(),
      model,
      customEndpoint: customEndpoint.trim(),
      enableAI,
    };
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(cfg));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="md">
      <div className="p-2 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Central de Inteligência Artificial Universal
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Painel do Saymon (Masterdev): configure qualquer IA (Gemini, OpenAI, Groq, DeepSeek)
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Provider Selector Switcher */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Selecione o Provedor de IA
            </Label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {[
                { id: 'gemini', label: 'Google Gemini', icon: Sparkles },
                { id: 'openai', label: 'OpenAI ChatGPT', icon: Cpu },
                { id: 'groq', label: 'Groq Llama', icon: Zap },
                { id: 'custom', label: 'Personalizado', icon: Globe },
              ].map((item) => {
                const IconComp = item.icon;
                const isSel = provider === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleProviderChange(item.id as AIProvider)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[11px] font-bold transition-all ${
                      isSel
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <IconComp className="h-4 w-4 mb-0.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Key Input with Auto Detection */}
          <div className="space-y-1.5">
            <Label htmlFor="apiKey" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Chave da API ({provider.toUpperCase()} API Key)</span>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
                Auto-Detecção Ativa
              </span>
            </Label>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                placeholder={
                  provider === 'gemini'
                    ? 'Cole sua chave do Gemini (AIzaSy...)'
                    : provider === 'openai'
                    ? 'Cole sua chave da OpenAI (sk-...)'
                    : 'Cole a sua chave de API...'
                }
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                className="pl-10 pr-20 h-10 text-xs bg-slate-50 dark:bg-slate-950 rounded-xl font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-2 px-2 py-1 text-[10px] font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                {showKey ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          {/* Custom Endpoint URL if provider === 'custom' */}
          {provider === 'custom' && (
            <div className="space-y-1.5">
              <Label htmlFor="customEndpoint" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Endpoint da API Customizada (OpenAI Compatible)
              </Label>
              <Input
                id="customEndpoint"
                placeholder="https://api.deepseek.com/v1/chat/completions"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                className="h-10 text-xs bg-slate-50 dark:bg-slate-950 rounded-xl"
              />
            </div>
          )}

          {/* Model Selector & Auto-Fetch Button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="model" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Modelo de Inteligência Artificial Reconhecido
              </Label>
              <button
                type="button"
                onClick={handleFetchLiveModels}
                disabled={isFetchingModels || !apiKey.trim()}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
              >
                {isFetchingModels ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Buscar Modelos da Chave
              </button>
            </div>

            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 font-semibold"
            >
              {availableModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.id})
                </option>
              ))}
            </select>
          </div>

          {/* Enable Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Ativar Leitura por IA ao Escanear Imóveis
              </span>
              <span className="text-[11px] text-slate-500">
                Extrai fotos reais, condomínio, IPTU e gera dúvidas automáticas para o corretor.
              </span>
            </div>
            <input
              type="checkbox"
              checked={enableAI}
              onChange={(e) => setEnableAI(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Test Button & Result Box */}
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={handleTestAPI}
              disabled={isTesting || !apiKey.trim()}
              className="w-full h-10 text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300"
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testando Conexão com a IA...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-4 w-4 text-indigo-600" /> Testar Conexão com a IA
                </>
              )}
            </Button>

            {testResult && (
              <div
                className={`mt-2 p-3 rounded-xl text-xs flex items-center justify-between gap-2 font-medium ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  )}
                  <span>{testResult.message}</span>
                </div>
                {testResult.latencyMs && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {testResult.latencyMs} ms
                  </span>
                )}
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
            Salvar Configurações da IA
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
}
