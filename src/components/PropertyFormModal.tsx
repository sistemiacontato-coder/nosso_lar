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
} from 'lucide-react';
import { propertyFormSchema, PropertyFormValues } from '@/lib/schemas';
import { Property, AVAILABLE_DIFFERENTIALS, getCoupleMatchBadge, VereditoSaymon, VereditoKelly } from '@/types/property';
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

  const defaultValues: PropertyFormValues = {
    titulo: '',
    urlAnuncio: '',
    urlImagem: '',
    bairro: '',
    endereco: '',
    valorAluguel: 3600,
    valorCondominio: 800,
    valorIptu: 200,
    dormitorios: 3,
    suites: 1,
    banheiros: 2,
    vagasGaragem: 2,
    areaUtil: 80,
    tempoAteTrabalhoMinutos: 25,
    tempoSaymonMinutos: 25,
    tempoKellyMinutos: 30,
    distanciaMetroKm: 1.5,
    diferenciais: ['Varanda Gourmet', 'Portaria 24h / Blindada', 'Piscina', 'Academia'],
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

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      setExtractUrl('');
      setExtractError(null);
      setExtractSuccess(null);
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
          tempoAteTrabalhoMinutos: initialData.tempoAteTrabalhoMinutos,
          distanciaMetroKm: initialData.distanciaMetroKm,
          diferenciais: initialData.diferenciais || [],
          status: initialData.status,

          // Saymon
          notaSaymon: initialData.notaSaymon || 4,
          vereditoSaymon: initialData.vereditoSaymon || 'Gostei',
          opiniaoSaymon: initialData.opiniaoSaymon || '',

          // Kelly
          notaKelly: initialData.notaKelly || 4,
          vereditoKelly: initialData.vereditoKelly || 'Gostei',
          opiniaoKelly: initialData.opiniaoKelly || '',

          observacoes: initialData.observacoes || '',
        });
      } else {
        reset(defaultValues);
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

  // Watch for live total calculation
  const watchedAluguel = watch('valorAluguel') || 0;
  const watchedCondominio = watch('valorCondominio') || 0;
  const watchedIptu = watch('valorIptu') || 0;
  const watchedArea = watch('areaUtil') || 1;
  const watchedDiferenciais = watch('diferenciais') || [];
  const watchedNotaSaymon = watch('notaSaymon') || 4;
  const watchedVereditoSaymon = watch('vereditoSaymon') || 'Gostei';
  const watchedNotaKelly = watch('notaKelly') || 4;
  const watchedVereditoKelly = watch('vereditoKelly') || 'Gostei';

  const { custoTotal, precoM2 } = calculateTotals(
    Number(watchedAluguel),
    Number(watchedCondominio),
    Number(watchedIptu),
    Number(watchedArea)
  );

  const coupleMedia = Number(((watchedNotaSaymon + watchedNotaKelly) / 2).toFixed(1));
  const coupleMatchBadge = getCoupleMatchBadge(watchedNotaSaymon, watchedNotaKelly);

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
    onSubmit(data);
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
            : 'Escolha se deseja escanear automaticamente o link do anúncio ou cadastrar manualmente.'}
        </DialogDescription>
      </DialogHeader>

      {/* MODE SWITCHER (ESCANEAR LINK VS DIGITAR MANUALMENTE) */}
      {!isEditing && (
        <div className="mb-4 grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setEntryMode('scan')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              entryMode === 'scan'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Wand2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Escanear por Link (Recomendado)
          </button>

          <button
            type="button"
            onClick={() => setEntryMode('manual')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              entryMode === 'manual'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Edit3 className="h-4 w-4" />
            Cadastrar Manualmente
          </button>
        </div>
      )}

      {/* COMPACT ESCANEAR BOX WHEN IN SCAN MODE */}
      {!isEditing && entryMode === 'scan' && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-0.5 shadow-md">
          <div className="rounded-[14px] bg-white dark:bg-slate-900 p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Extração Automática de Foto Real e Dados
              </span>
              <span className="text-[10px] font-semibold text-slate-400">VivaReal, B2M, Vanderleia, QuintoAndar, Zap</span>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Cole a URL do imóvel (ex: https://www.vivareal.com.br/imovel/...)"
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
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Sintonia do Casal</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-sm flex items-center gap-1 justify-center">
                <Heart className="h-3 w-3 fill-rose-500" /> {coupleMedia} ⭐
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* SECTION 1: INFORMAÇÕES BÁSICAS & LINKS */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <LinkIcon className="h-3.5 w-3.5" /> 1. Informações Básicas e Anúncio
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
                Link do Anúncio (B2M, VivaReal, QuintoAndar, etc.) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="urlAnuncio"
                type="url"
                placeholder="https://www.vivareal.com.br/imovel/..."
                {...register('urlAnuncio')}
              />
              {errors.urlAnuncio && (
                <p className="text-xs text-rose-500">{errors.urlAnuncio.message}</p>
              )}
            </div>

            {/* URL da Foto de Capa */}
            <div className="space-y-1.5">
              <Label htmlFor="urlImagem">Link da Foto Real da Fachada / Sala (opcional)</Label>
              <Input
                id="urlImagem"
                type="url"
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
                placeholder="Ex: Vila Yara / Continental - Osasco, Vila São Francisco"
                {...register('bairro')}
              />
              {errors.bairro && (
                <p className="text-xs text-rose-500">{errors.bairro.message}</p>
              )}
            </div>

            {/* Endereço / Rua */}
            <div className="space-y-1.5">
              <Label htmlFor="endereco">Endereço / Referência (opcional)</Label>
              <Input
                id="endereco"
                placeholder="Ex: Av. Franz Voegeli / Próximo ao Continental Shopping"
                {...register('endereco')}
              />
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
              <Label htmlFor="dormitorios">
                Dormitórios <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="dormitorios"
                type="number"
                min="0"
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
                {...register('suites')}
              />
            </div>

            {/* Banheiros */}
            <div className="space-y-1.5">
              <Label htmlFor="banheiros">
                Banheiros <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="banheiros"
                type="number"
                min="1"
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
                {...register('vagasGaragem')}
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: LOGÍSTICA & DESLOCAMENTO */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> 4. Logística e Deslocamento
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tempoSaymonMinutos">
                Trabalho do Saymon 🧔 (minutos)
              </Label>
              <Input
                id="tempoSaymonMinutos"
                type="number"
                placeholder="Ex: 20"
                {...register('tempoSaymonMinutos')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tempoKellyMinutos">
                Trabalho da Kelly 👩 (minutos)
              </Label>
              <Input
                id="tempoKellyMinutos"
                type="number"
                placeholder="Ex: 30"
                {...register('tempoKellyMinutos')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="distanciaMetroKm">
                Distância até Metrô / Trem 🚉 (km)
              </Label>
              <Input
                id="distanciaMetroKm"
                type="number"
                step="0.1"
                placeholder="Ex: 1.5"
                {...register('distanciaMetroKm')}
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: DIFERENCIAIS & COMODIDADES */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            5. Diferenciais e Comodidades (selecione as presentes)
          </Label>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            {AVAILABLE_DIFFERENTIALS.map((tag) => {
              const isSelected = watchedDiferenciais.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 6: PONTOS DE VISTA DO CASAL: SAYMON & KELLY */}
        <div className="space-y-4 pt-4 border-t-2 border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10 p-4 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-rose-200/60 dark:border-rose-900/40">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                6. Avaliação do Casal: Saymon & Kelly
              </h4>
            </div>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${coupleMatchBadge.bg} ${coupleMatchBadge.border} ${coupleMatchBadge.color}`}>
              {coupleMatchBadge.label} ({coupleMedia} / 5)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SAYMON REVIEW CARD */}
            <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 font-bold text-xs">
                    🧔 S
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">
                      Saymon
                    </span>
                    <span className="text-[10px] text-slate-400">Ponto de Vista</span>
                  </div>
                </div>

                {/* Rating Saymon */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setValue('notaSaymon', star, { shouldValidate: true })}
                      className="p-0.5"
                    >
                      <Star
                        className={`h-5 w-5 transition-transform active:scale-125 ${
                          star <= watchedNotaSaymon
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Veredito Saymon */}
              <div>
                <Label className="text-xs mb-1 block">Veredito do Saymon:</Label>
                <div className="grid grid-cols-4 gap-1">
                  {(['Aprovado', 'Gostei', 'Neutro', 'Não Curti'] as VereditoSaymon[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setValue('vereditoSaymon', v, { shouldValidate: true })}
                      className={`py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                        watchedVereditoSaymon === v
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opinião Saymon */}
              <div>
                <Label htmlFor="opiniaoSaymon" className="text-xs mb-1 block">
                  Comentários / Prós & Contras do Saymon:
                </Label>
                <Textarea
                  id="opiniaoSaymon"
                  rows={2}
                  placeholder="Ex: O que o Saymon achou da vaga, metragem, localização, custos..."
                  {...register('opiniaoSaymon')}
                />
              </div>
            </div>

            {/* KELLY REVIEW CARD */}
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900 text-rose-200 font-bold text-xs">
                    👩 K
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">
                      Kelly
                    </span>
                    <span className="text-[10px] text-slate-400">Ponto de Vista</span>
                  </div>
                </div>

                {/* Rating Kelly */}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setValue('notaKelly', star, { shouldValidate: true })}
                      className="p-0.5"
                    >
                      <Star
                        className={`h-5 w-5 transition-transform active:scale-125 ${
                          star <= watchedNotaKelly
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Veredito Kelly */}
              <div>
                <Label className="text-xs mb-1 block">Veredito da Kelly:</Label>
                <div className="grid grid-cols-4 gap-1">
                  {(['Aprovada', 'Gostei', 'Neutra', 'Não Curti'] as VereditoKelly[]).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setValue('vereditoKelly', v, { shouldValidate: true })}
                      className={`py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                        watchedVereditoKelly === v
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opinião Kelly */}
              <div>
                <Label htmlFor="opiniaoKelly" className="text-xs mb-1 block">
                  Comentários / Prós & Contras da Kelly:
                </Label>
                <Textarea
                  id="opiniaoKelly"
                  rows={2}
                  placeholder="Ex: O que a Kelly achou da cozinha, varanda, segurança, iluminação..."
                  {...register('opiniaoKelly')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 7: DÚVIDAS PARA O CORRETOR */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              7. Dúvidas & Perguntas para Fazer ao Corretor
            </h4>
          </div>
          <Textarea
            id="duvidasCorretor"
            rows={3}
            placeholder="Ex: 1. A vaga de garagem é livre ou presa? 2. Qual a garantia aceita? 3. O condomínio inclui água/gás?"
            {...register('duvidasCorretor')}
          />
          <p className="text-[11px] text-slate-400">
            Dica: Anote suas dúvidas aqui. Na ficha do imóvel haverá um botão para <strong>copiar direto para o WhatsApp do corretor</strong>!
          </p>
        </div>

        {/* SECTION 8: STATUS GERAL */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="status">Status no Funil de Decisão</Label>
              <select
                id="status"
                {...register('status')}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 font-medium"
              >
                <option value="Para Analisar">Para Analisar</option>
                <option value="Agendar Visita">Agendar Visita</option>
                <option value="Visita Agendada">Visita Agendada</option>
                <option value="Pendente Avaliação">Pendente Avaliação</option>
                <option value="Proposta Enviada">Proposta Enviada</option>
                <option value="Descartado">Descartado</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="observacoes">Observações Gerais / Código do Anúncio</Label>
              <Input
                id="observacoes"
                placeholder="Ex: Código AP3464-B2MC, ligar para corretor..."
                {...register('observacoes')}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Buttons */}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isEditing ? 'Salvar Alterações' : 'Cadastrar Imóvel'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
