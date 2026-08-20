'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  DollarSign,
  Link as LinkIcon,
  Maximize2,
  Clock,
  Star,
  Check,
  Calculator,
  Heart,
  Sparkles,
  Loader2,
  Wand2,
  Edit3,
  Search,
  MapPin,
} from 'lucide-react';
import { propertyFormSchema, PropertyFormValues } from '@/lib/schemas';
import { Property, AVAILABLE_DIFFERENTIALS, getCoupleMatchBadge } from '@/types/property';
import { formatCurrency, formatCurrencyPerM2, calculateTotals } from '@/lib/utils';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

interface PropertyFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PropertyFormValues) => void;
  initialData?: Property | null;
  existingProperties?: Property[];
}

// Clean blank values for brand new manual property registration
const emptyDefaultValues: PropertyFormValues = {
  titulo: '',
  urlAnuncio: '',
  urlImagem: '',
  bairro: '',
  endereco: '',
  valorAluguel: '' as unknown as number,
  valorCondominio: '' as unknown as number,
  valorIptu: '' as unknown as number,
  dormitorios: '' as unknown as number,
  suites: '' as unknown as number,
  banheiros: '' as unknown as number,
  vagasGaragem: '' as unknown as number,
  areaUtil: '' as unknown as number,
  tempoAteTrabalhoMinutos: '' as unknown as number,
  tempoSaymonMinutos: '' as unknown as number,
  tempoKellyMinutos: '' as unknown as number,
  distanciaMetroKm: '' as unknown as number,
  diferenciais: [],
  status: 'Para Analisar',

  // Saymon
  notaSaymon: 5,
  vereditoSaymon: 'Aprovado',
  opiniaoSaymon: '',

  // Kelly
  notaKelly: 5,
  vereditoKelly: 'Aprovada',
  opiniaoKelly: '',

  observacoes: '',
};

export function PropertyFormModal({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  existingProperties = [],
}: PropertyFormModalProps) {
  const isEditing = !!initialData;
  const [entryMode, setEntryMode] = useState<'scan' | 'manual'>('scan');
  const [extractUrl, setExtractUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extractSuccess, setExtractSuccess] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: emptyDefaultValues,
  });

  useEffect(() => {
    if (open) {
      setExtractUrl('');
      setExtractError(null);
      setExtractSuccess(null);
      setDuplicateWarning(null);
      setAddressSuggestions([]);
      setEntryMode(isEditing ? 'manual' : 'scan');

      if (initialData) {
        reset({
          titulo: initialData.titulo,
          urlAnuncio: initialData.urlAnuncio,
          urlImagem: initialData.urlImagem || '',
          bairro: initialData.bairro,
          endereco: initialData.endereco || '',
          valorAluguel: initialData.valorAluguel,
          valorCondominio: initialData.valorCondominio,
          valorIptu: initialData.valorIptu,
          dormitorios: initialData.dormitorios,
          suites: initialData.suites,
          banheiros: initialData.banheiros,
          vagasGaragem: initialData.vagasGaragem,
          areaUtil: initialData.areaUtil,
          tempoAteTrabalhoMinutos: initialData.tempoAteTrabalhoMinutos || 25,
          tempoSaymonMinutos: initialData.tempoSaymonMinutos || 20,
          tempoKellyMinutos: initialData.tempoKellyMinutos || 30,
          distanciaMetroKm: initialData.distanciaMetroKm || 1.5,
          diferenciais: initialData.diferenciais || [],
          status: initialData.status,

          // Saymon
          notaSaymon: initialData.notaSaymon || 5,
          vereditoSaymon: initialData.vereditoSaymon || 'Aprovado',
          opiniaoSaymon: initialData.opiniaoSaymon || '',

          // Kelly
          notaKelly: initialData.notaKelly || 5,
          vereditoKelly: initialData.vereditoKelly || 'Aprovada',
          opiniaoKelly: initialData.opiniaoKelly || '',

          observacoes: initialData.observacoes || '',
        });
      } else {
        // Completely blank for new property registration
        reset(emptyDefaultValues);
      }
    }
  }, [open, initialData, reset, isEditing]);

  // Duplicate check helper
  const checkDuplicateUrl = (url: string) => {
    if (!url.trim()) return null;
    const cleanUrl = url.trim().toLowerCase().replace(/\/$/, '');
    const found = existingProperties.find(
      (p) => p.urlAnuncio && p.urlAnuncio.trim().toLowerCase().replace(/\/$/, '') === cleanUrl
    );
    return found || null;
  };

  // Magic Auto Extract Handler
  const handleAutoExtractWithUrl = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;

    // Validate duplicate first
    const dup = checkDuplicateUrl(targetUrl);
    if (dup) {
      setDuplicateWarning(`⚠️ Link Repetido! Este imóvel já está cadastrado como "${dup.titulo}" (${dup.bairro}).`);
      return;
    }

    setIsExtracting(true);
    setExtractError(null);
    setExtractSuccess(null);
    setDuplicateWarning(null);

    try {
      const res = await fetch('/api/extract-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl.trim() }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Falha ao extrair dados do anúncio.');
      }

      const data = json.data;
      setValue('urlAnuncio', targetUrl.trim(), { shouldValidate: true });
      if (data.titulo) setValue('titulo', data.titulo, { shouldValidate: true });
      if (data.urlImagem) setValue('urlImagem', data.urlImagem, { shouldValidate: true });
      if (data.bairro) setValue('bairro', data.bairro, { shouldValidate: true });
      if (data.valorAluguel) setValue('valorAluguel', data.valorAluguel, { shouldValidate: true });
      if (data.valorCondominio) setValue('valorCondominio', data.valorCondominio, { shouldValidate: true });
      if (data.valorIptu) setValue('valorIptu', data.valorIptu, { shouldValidate: true });
      if (data.dormitorios) setValue('dormitorios', data.dormitorios, { shouldValidate: true });
      if (data.suites) setValue('suites', data.suites, { shouldValidate: true });
      if (data.banheiros) setValue('banheiros', data.banheiros, { shouldValidate: true });
      if (data.vagasGaragem) setValue('vagasGaragem', data.vagasGaragem, { shouldValidate: true });
      if (data.areaUtil) setValue('areaUtil', data.areaUtil, { shouldValidate: true });
      if (data.diferenciais && data.diferenciais.length > 0) {
        setValue('diferenciais', data.diferenciais, { shouldValidate: true });
      }
      if (data.observacoes) setValue('observacoes', data.observacoes);

      setExtractSuccess('🎉 Título e dados extraídos automaticamente! O formulário foi preenchido.');
    } catch (err: any) {
      setExtractError(err.message || 'Não foi possível extrair automaticamente. Preencha manualmente.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAutoExtract = () => handleAutoExtractWithUrl(extractUrl);

  // Address lookup helper (OpenStreetMap Nominatim API for address suggestions & commute calculation)
  const handleAddressSearch = async (query: string) => {
    if (!query || query.length < 3) return;
    setIsSearchingAddress(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ', São Paulo Brasil'
        )}&limit=4`
      );
      const data = await res.json();
      setAddressSuggestions(data || []);
    } catch {
      setAddressSuggestions([]);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  // Recalculate commute based on address / location selection
  const handleSelectAddressSuggestion = (item: any) => {
    const display = item.display_name.split(',')[0] || item.display_name;
    setValue('endereco', display, { shouldValidate: true });
    setAddressSuggestions([]);

    // Recalculate commute times dynamically based on distance estimation
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    // Approximate reference points (Saymon Work & Kelly Work)
    // Saymon Paulista approx: -23.56, -46.65
    // Kelly Faria Lima approx: -23.58, -46.68
    if (lat && lon) {
      const saymonDist = Math.hypot(lat - (-23.561), lon - (-46.655)) * 111; // km
      const kellyDist = Math.hypot(lat - (-23.582), lon - (-46.681)) * 111; // km

      const saymonMin = Math.max(10, Math.round(saymonDist * 3.2));
      const kellyMin = Math.max(10, Math.round(kellyDist * 3.5));
      const avgMin = Math.round((saymonMin + kellyMin) / 2);

      setValue('tempoSaymonMinutos', saymonMin);
      setValue('tempoKellyMinutos', kellyMin);
      setValue('tempoAteTrabalhoMinutos', avgMin);
    }
  };

  // Watch for live total calculation
  const watchedAluguel = Number(watch('valorAluguel')) || 0;
  const watchedCondominio = Number(watch('valorCondominio')) || 0;
  const watchedIptu = Number(watch('valorIptu')) || 0;
  const watchedArea = Number(watch('areaUtil')) || 1;
  const watchedDiferenciais = watch('diferenciais') || [];
  const watchedNotaSaymon = Number(watch('notaSaymon')) || 5;
  const watchedNotaKelly = Number(watch('notaKelly')) || 5;
  const watchedEndereco = watch('endereco') || '';

  const { custoTotal, precoM2 } = calculateTotals(
    watchedAluguel,
    watchedCondominio,
    watchedIptu,
    watchedArea
  );

  const coupleMedia = Number(((watchedNotaSaymon + watchedNotaKelly) / 2).toFixed(1));

  const handleToggleTag = (tag: string) => {
    const current = watchedDiferenciais;
    if (current.includes(tag)) {
      setValue(
        'diferenciais',
        current.filter((t) => t !== tag),
        { shouldValidate: true }
      );
    } else {
      setValue('diferenciais', [...current, tag], { shouldValidate: true });
    }
  };

  const handleFormSubmit = (data: PropertyFormValues) => {
    // If commute fields are blank, provide default estimates
    const finalData = {
      ...data,
      tempoSaymonMinutos: Number(data.tempoSaymonMinutos) || 25,
      tempoKellyMinutos: Number(data.tempoKellyMinutos) || 30,
      tempoAteTrabalhoMinutos: Number(data.tempoAteTrabalhoMinutos) || 25,
      valorAluguel: Number(data.valorAluguel) || 0,
      valorCondominio: Number(data.valorCondominio) || 0,
      valorIptu: Number(data.valorIptu) || 0,
      areaUtil: Number(data.areaUtil) || 1,
      dormitorios: Number(data.dormitorios) || 0,
      suites: Number(data.suites) || 0,
      banheiros: Number(data.banheiros) || 1,
      vagasGaragem: Number(data.vagasGaragem) || 0,
    };

    onSubmit(finalData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="4xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          {isEditing ? 'Editar Imóvel do Casal' : 'Cadastrar Imóvel para o Nosso Lar'}
        </DialogTitle>
        <DialogDescription>
          {isEditing
            ? 'Atualize os valores, foto real e pontos de vista de Saymon & Kelly.'
            : 'Escolha o método de cadastro desejado para adicionar um novo imóvel.'}
        </DialogDescription>
      </DialogHeader>

      {/* MODE SWITCHER (APENAS 2 OPÇÕES ESTRITAS) */}
      {!isEditing && (
        <div className="mb-4 grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setEntryMode('scan')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all ${
              entryMode === 'scan'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Wand2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Extração Automática por Link
          </button>

          <button
            type="button"
            onClick={() => {
              setEntryMode('manual');
              reset(emptyDefaultValues); // Ensure completely blank form when switching to manual
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all ${
              entryMode === 'manual'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Edit3 className="h-4 w-4 text-rose-500" />
            Cadastrar Manualmente
          </button>
        </div>
      )}

      {/* BANNER DE EXTRAÇÃO AUTOMÁTICA (APARECE APENAS NO MODO SCAN) */}
      {!isEditing && entryMode === 'scan' && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-0.5 shadow-md">
          <div className="rounded-[14px] bg-white dark:bg-slate-900 p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Cole a URL do Anúncio
              </span>
              <span className="text-[10px] font-semibold text-slate-400">VivaReal, QuintoAndar, Zap, B2M</span>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Ex: https://www.vivareal.com.br/imovel/..."
                value={extractUrl}
                onChange={(e) => {
                  const url = e.target.value;
                  setExtractUrl(url);
                  const dup = checkDuplicateUrl(url);
                  if (dup) {
                    setDuplicateWarning(`⚠️ Link Repetido! Este imóvel já foi cadastrado como "${dup.titulo}" (${dup.bairro}).`);
                  } else {
                    setDuplicateWarning(null);
                  }
                }}
                onPaste={(e) => {
                  const pastedUrl = e.clipboardData.getData('text');
                  if (pastedUrl && (pastedUrl.startsWith('http://') || pastedUrl.startsWith('https://'))) {
                    setExtractUrl(pastedUrl);
                    handleAutoExtractWithUrl(pastedUrl);
                  }
                }}
                className="h-10 text-xs bg-slate-50 dark:bg-slate-950"
              />
              <Button
                type="button"
                onClick={handleAutoExtract}
                disabled={isExtracting || !extractUrl.trim()}
                className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                    Extraindo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    Extrair Dados
                  </>
                )}
              </Button>
            </div>

            {duplicateWarning && (
              <p className="mt-2 text-xs text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/60 p-2 rounded-lg border border-rose-200 dark:border-rose-800">
                {duplicateWarning}
              </p>
            )}

            {extractError && (
              <p className="text-xs text-rose-500 font-medium mt-2">{extractError}</p>
            )}
            {extractSuccess && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-2 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> {extractSuccess}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Dynamic Live Cost Calculator Header Strip */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-900/10 via-emerald-900/10 to-teal-900/10 dark:from-blue-950/40 dark:via-emerald-950/40 dark:to-teal-950/40 border border-emerald-500/20 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cálculo Dinâmico ao Vivo
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(custoTotal)}
                </span>
                <span className="text-xs text-slate-500">/mês total</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="rounded-xl bg-white dark:bg-slate-900 px-3 py-1.5 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Preço por m²</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {formatCurrencyPerM2(precoM2)}
              </span>
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-900 px-3 py-1.5 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Média do Casal</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-sm flex items-center gap-1 justify-center">
                <Heart className="h-3 w-3 fill-rose-500" /> {coupleMedia} ⭐
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* SECTION 1: INFORMAÇÕES BÁSICAS & ENDEREÇO */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <LinkIcon className="h-3.5 w-3.5" /> 1. Informações Básicas e Endereço
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Título */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="titulo">
                Título do Anúncio / Apelido <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="titulo"
                placeholder="Ex: Apto 3 dorms (84m²) - Vila Yara / Continental"
                {...register('titulo')}
              />
              {errors.titulo && (
                <p className="text-xs text-rose-500">{errors.titulo.message}</p>
              )}
            </div>

            {/* URL do Anúncio */}
            <div className="space-y-1.5">
              <Label htmlFor="urlAnuncio">
                Link do Anúncio (VivaReal, QuintoAndar, Zap, etc.) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="urlAnuncio"
                type="text"
                placeholder="https://www.vivareal.com.br/imovel/..."
                {...register('urlAnuncio')}
              />
              {errors.urlAnuncio && (
                <p className="text-xs text-rose-500">{errors.urlAnuncio.message}</p>
              )}
            </div>

            {/* URL da Foto de Capa */}
            <div className="space-y-1.5">
              <Label htmlFor="urlImagem">Link da Foto Real (opcional)</Label>
              <Input
                id="urlImagem"
                type="text"
                placeholder="https://... URL direta da foto real"
                {...register('urlImagem')}
              />
            </div>

            {/* Bairro */}
            <div className="space-y-1.5">
              <Label htmlFor="bairro">
                Bairro / Região <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="bairro"
                placeholder="Ex: Vila Yara / Continental - Osasco"
                {...register('bairro')}
              />
              {errors.bairro && (
                <p className="text-xs text-rose-500">{errors.bairro.message}</p>
              )}
            </div>

            {/* Endereço com Busca Automática Google / Nominatim */}
            <div className="space-y-1.5 relative">
              <Label htmlFor="endereco" className="flex items-center justify-between">
                <span>Endereço Completo (Autopreencher)</span>
                <span className="text-[10px] text-indigo-500 font-semibold">📍 Recalcula Deslocamento</span>
              </Label>
              <div className="relative">
                <Input
                  id="endereco"
                  placeholder="Digite a rua ou condomínio (ex: Av. Franz Voegeli)..."
                  {...register('endereco')}
                  onChange={(e) => {
                    setValue('endereco', e.target.value);
                    handleAddressSearch(e.target.value);
                  }}
                />
                {isSearchingAddress && (
                  <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-slate-400" />
                )}
              </div>

              {/* Suggestions Dropdown */}
              {addressSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl py-1 text-xs">
                  {addressSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectAddressSuggestion(item)}
                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{item.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: COMPOSIÇÃO DE VALORES (FINANCEIRO) */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5" /> 2. Composição Financeira Mensal (R$)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Valor Aluguel */}
            <div className="space-y-1.5">
              <Label htmlFor="valorAluguel">
                Aluguel (R$) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="valorAluguel"
                type="number"
                step="10"
                placeholder="Ex: 3600"
                {...register('valorAluguel')}
              />
              {errors.valorAluguel && (
                <p className="text-xs text-rose-500">{errors.valorAluguel.message}</p>
              )}
            </div>

            {/* Condomínio */}
            <div className="space-y-1.5">
              <Label htmlFor="valorCondominio">Condomínio (R$)</Label>
              <Input
                id="valorCondominio"
                type="number"
                step="10"
                placeholder="Ex: 820"
                {...register('valorCondominio')}
              />
            </div>

            {/* IPTU Mensal */}
            <div className="space-y-1.5">
              <Label htmlFor="valorIptu">IPTU Mensal (R$)</Label>
              <Input
                id="valorIptu"
                type="number"
                step="10"
                placeholder="Ex: 210"
                {...register('valorIptu')}
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: INFRAESTRUTURA & ESPAÇO */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Maximize2 className="h-3.5 w-3.5" /> 3. Espaço, Quartos e Infraestrutura
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Área Útil */}
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="areaUtil">
                Área Útil (m²) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="areaUtil"
                type="number"
                step="1"
                placeholder="Ex: 84"
                {...register('areaUtil')}
              />
              {errors.areaUtil && (
                <p className="text-xs text-rose-500">{errors.areaUtil.message}</p>
              )}
            </div>

            {/* Quartos */}
            <div className="space-y-1.5">
              <Label htmlFor="dormitorios">Dormitórios</Label>
              <Input
                id="dormitorios"
                type="number"
                min="0"
                placeholder="Ex: 3"
                {...register('dormitorios')}
              />
            </div>

            {/* Suítes */}
            <div className="space-y-1.5">
              <Label htmlFor="suites">Suítes</Label>
              <Input
                id="suites"
                type="number"
                min="0"
                placeholder="Ex: 1"
                {...register('suites')}
              />
            </div>

            {/* Banheiros */}
            <div className="space-y-1.5">
              <Label htmlFor="banheiros">Banheiros</Label>
              <Input
                id="banheiros"
                type="number"
                min="1"
                placeholder="Ex: 2"
                {...register('banheiros')}
              />
            </div>

            {/* Vagas */}
            <div className="space-y-1.5">
              <Label htmlFor="vagasGaragem">Vagas Garagem</Label>
              <Input
                id="vagasGaragem"
                type="number"
                min="0"
                placeholder="Ex: 2"
                {...register('vagasGaragem')}
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: TEMPO DE DESLOCAMENTO INDIVIDUAL DO CASAL */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> 4. Deslocamento do Casal (Minutos até o Trabalho)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tempoSaymonMinutos">
                Trabalho do Saymon 🧑🏻‍🦱 (em minutos)
              </Label>
              <Input
                id="tempoSaymonMinutos"
                type="number"
                min="0"
                placeholder="Ex: 20"
                {...register('tempoSaymonMinutos')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tempoKellyMinutos">
                Trabalho da Kelly 👩🏻‍🦱 (em minutos)
              </Label>
              <Input
                id="tempoKellyMinutos"
                type="number"
                min="0"
                placeholder="Ex: 30"
                {...register('tempoKellyMinutos')}
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: DIFERENCIAIS */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            5. Diferenciais e Lazer do Condomínio
          </Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_DIFFERENTIALS.map((tag) => {
              const active = watchedDiferenciais.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {active && <Check className="h-3.5 w-3.5" />}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 6: AVALIAÇÃO DO CASAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* SAYMON */}
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <span>🧑🏻‍| Saymon</span>
            </h5>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="notaSaymon">Nota (1 a 5 stars)</Label>
                <select
                  id="notaSaymon"
                  {...register('notaSaymon')}
                  className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      ⭐ {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="vereditoSaymon">Veredito</Label>
                <select
                  id="vereditoSaymon"
                  {...register('vereditoSaymon')}
                  className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="Aprovado">😍 Aprovado</option>
                  <option value="Gostei">👍 Gostei</option>
                  <option value="Neutro">😐 Neutro</option>
                  <option value="Não Curti">👎 Não Curti</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="opiniaoSaymon">Opinião / Observações do Saymon</Label>
              <Textarea
                id="opiniaoSaymon"
                rows={2}
                placeholder="Ex: Ótima sacada e vaga livre. Gostei da planta..."
                {...register('opiniaoSaymon')}
                className="text-xs"
              />
            </div>
          </div>

          {/* KELLY */}
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
            <h5 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <span>👩🏻‍🦱 Kelly</span>
            </h5>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="notaKelly">Nota (1 a 5 stars)</Label>
                <select
                  id="notaKelly"
                  {...register('notaKelly')}
                  className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      ⭐ {n}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="vereditoKelly">Veredito</Label>
                <select
                  id="vereditoKelly"
                  {...register('vereditoKelly')}
                  className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="Aprovada">😍 Aprovada</option>
                  <option value="Gostei">👍 Gostei</option>
                  <option value="Neutra">😐 Neutra</option>
                  <option value="Não Curti">👎 Não Curti</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="opiniaoKelly">Opinião / Observações da Kelly</Label>
              <Textarea
                id="opiniaoKelly"
                rows={2}
                placeholder="Ex: Cozinha excelente, sol da manhã no quarto..."
                {...register('opiniaoKelly')}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {/* SECTION 7: OBSERVAÇÕES GERAIS */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Label htmlFor="observacoes">Anotações Gerais do Casal</Label>
          <Textarea
            id="observacoes"
            rows={2}
            placeholder="Anotações gerais sobre proprietário, vistoria ou detalhes..."
            {...register('observacoes')}
            className="text-xs"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Salvando...
              </>
            ) : isEditing ? (
              'Salvar Alterações'
            ) : (
              'Cadastrar Imóvel'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
