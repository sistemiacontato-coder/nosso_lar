'use client';

import React, { useState } from 'react';
import { Building2, User, Phone, Link as LinkIcon, Sparkles, Loader2, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { PropertyFormValues } from '@/lib/schemas';
import { getStoredAIConfig } from './SettingsModal';

import { Property } from '@/types/property';

interface RealtorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSuggestion: (values: PropertyFormValues, nomeCorretor: string, telefoneCorretor: string) => void;
  existingProperties?: Property[];
}

export function RealtorModal({ open, onOpenChange, onSubmitSuggestion, existingProperties = [] }: RealtorModalProps) {
  const [nomeCorretor, setNomeCorretor] = useState('');
  const [telefoneCorretor, setTelefoneCorretor] = useState('');
  const [urlAnuncio, setUrlAnuncio] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<PropertyFormValues | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const checkDuplicate = (url: string) => {
    if (!url.trim()) return null;
    const cleanUrl = url.trim().toLowerCase().replace(/\/$/, '');
    return existingProperties.find(
      (p) => p.urlAnuncio && p.urlAnuncio.trim().toLowerCase().replace(/\/$/, '') === cleanUrl
    ) || null;
  };

  const handleExtractAndValidateWithUrl = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;
    
    const dup = checkDuplicate(targetUrl);
    if (dup) {
      setDuplicateWarning(`⚠️ Link Repetido! Este imóvel já foi cadastrado como "${dup.titulo}" (${dup.bairro}).`);
      return;
    }

    setIsExtracting(true);
    setErrorMsg(null);
    setDuplicateWarning(null);
    setExtractedData(null);

    const aiCfg = getStoredAIConfig();

    try {
      const res = await fetch('/api/extract-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl.trim(),
          primary: aiCfg.primary,
          fallback: aiCfg.fallback,
          enableFallback: aiCfg.enableFallback,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Não foi possível ler o link do anúncio.');
      }

      const d = json.data;
      const formVal: PropertyFormValues = {
        titulo: d.titulo || 'Apartamento Sugerido',
        urlAnuncio: urlAnuncio.trim(),
        urlImagem: d.urlImagem || '',
        bairro: d.bairro || 'Vila Yara / Osasco',
        endereco: d.endereco || '',
        valorAluguel: d.valorAluguel || 3800,
        valorCondominio: d.valorCondominio || 800,
        valorIptu: d.valorIptu || 200,
        valorSeguroIncendio: d.valorSeguroIncendio || 0,
        dormitorios: d.dormitorios || 3,
        suites: d.suites || 1,
        banheiros: d.banheiros || 2,
        vagasGaragem: d.vagasGaragem || 2,
        areaUtil: d.areaUtil || 80,
        andar: d.andar || '',
        tempoAteTrabalhoMinutos: 25,
        tempoSaymonMinutos: 25,
        tempoKellyMinutos: 30,
        distanciaMetroKm: 1.5,
        diferenciais: d.diferenciais || [],
        status: 'Para Analisar',

        notaSaymon: 4,
        vereditoSaymon: 'Gostei',
        notaKelly: 4,
        vereditoKelly: 'Gostei',

        observacoes: d.observacoes || '',
        duvidasCorretor: d.duvidasCorretor || '',
      };

      setExtractedData(formVal);
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao ler anúncio.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExtractAndValidate = () => handleExtractAndValidateWithUrl(urlAnuncio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCorretor.trim() || !telefoneCorretor.trim()) {
      setErrorMsg('Informe seu Nome e Telefone/WhatsApp para o casal entrar em contato.');
      return;
    }
    if (!extractedData) {
      setErrorMsg('Cole o link do imóvel e clique em Escanear antes de enviar.');
      return;
    }

    onSubmitSuggestion(extractedData, nomeCorretor, telefoneCorretor);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setExtractedData(null);
      setUrlAnuncio('');
      onOpenChange(false);
    }, 2000);
  };

  // Validation Criteria Checks against Saymon's Ideal Preferences
  const totalCost = extractedData
    ? extractedData.valorAluguel + extractedData.valorCondominio + extractedData.valorIptu + (extractedData.valorSeguroIncendio || 0)
    : 0;

  const isPriceOk = totalCost <= 5000;
  const isDormsOk = extractedData ? extractedData.dormitorios >= 3 : true;
  const isVagasOk = extractedData ? extractedData.vagasGaragem >= 2 : true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="2xl">
      <div className="p-2 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              👔
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                Modo Corretor — Sugerir Imóvel para Saymon & Kelly
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Envie o link de um imóvel. O robô irá extrair a foto e validar se atende aos critérios do casal.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {submittedSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Sugestão Enviada com Sucesso!
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              O imóvel foi enviado diretamente para a aba <strong>💡 Sugestões dos Corretores</strong> do Saymon & Kelly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {/* Realtor Contact Details */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                1. Identificação do Corretor / Imobiliária
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="nomeCorretor" className="text-xs font-semibold">
                    Seu Nome / Imobiliária <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="nomeCorretor"
                      placeholder="Ex: Carlos Silva (Vanderleia Imóveis)"
                      value={nomeCorretor}
                      onChange={(e) => setNomeCorretor(e.target.value)}
                      className="pl-9 h-9 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="telefoneCorretor" className="text-xs font-semibold">
                    Seu Telefone / WhatsApp <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="telefoneCorretor"
                      placeholder="Ex: (11) 99487-8624"
                      value={telefoneCorretor}
                      onChange={(e) => setTelefoneCorretor(e.target.value)}
                      className="pl-9 h-9 text-xs"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Property URL Scanner */}
            <div className="space-y-2">
              <Label htmlFor="urlAnuncio" className="text-xs font-semibold">
                2. Cole o Link do Imóvel (VivaReal, B2M, QuintoAndar, etc.) <span className="text-rose-500">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="urlAnuncio"
                    type="url"
                    placeholder="https://..."
                    value={urlAnuncio}
                    onChange={(e) => {
                      const url = e.target.value;
                      setUrlAnuncio(url);
                      const dup = checkDuplicate(url);
                      if (dup) {
                        setDuplicateWarning(`⚠️ Link Repetido! Este imóvel já foi cadastrado como "${dup.titulo}" (${dup.bairro}).`);
                      } else {
                        setDuplicateWarning(null);
                      }
                    }}
                    onPaste={(e) => {
                      const pastedUrl = e.clipboardData.getData('text');
                      if (pastedUrl && (pastedUrl.startsWith('http://') || pastedUrl.startsWith('https://'))) {
                        setUrlAnuncio(pastedUrl);
                        handleExtractAndValidateWithUrl(pastedUrl);
                      }
                    }}
                    className="pl-9 h-9 text-xs"
                    required
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleExtractAndValidate}
                  disabled={isExtracting || !urlAnuncio.trim()}
                  className="h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Leitura por IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-1.5 h-4 w-4" /> Escanear & Validar
                    </>
                  )}
                </Button>
              </div>

              {duplicateWarning && (
                <p className="text-xs text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/60 p-2 rounded-lg border border-rose-200 dark:border-rose-800">
                  {duplicateWarning}
                </p>
              )}
            </div>

            {/* Criteria Evaluation Card */}
            {extractedData && (
              <div className="rounded-2xl p-4 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-600" /> Imóvel Escaneado: {extractedData.titulo}
                  </h4>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                    R$ {totalCost.toLocaleString('pt-BR')}/mês total
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className={`p-2 rounded-xl border font-semibold text-center ${
                    isPriceOk ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Pacote Total</span>
                    {isPriceOk ? '✅ R$ ' + totalCost : '⚠️ Acima do Teto'}
                  </div>

                  <div className={`p-2 rounded-xl border font-semibold text-center ${
                    isDormsOk ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Dormitórios</span>
                    {extractedData.dormitorios} qtos ({extractedData.suites} st)
                  </div>

                  <div className={`p-2 rounded-xl border font-semibold text-center ${
                    isVagasOk ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Garagem</span>
                    {extractedData.vagasGaragem} vaga{extractedData.vagasGaragem > 1 ? 's' : ''} {isVagasOk ? '✅' : '⚠️'}
                  </div>
                </div>

                {/* Pergunta sobre o Andar do Apartamento */}
                <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-800/60 space-y-1">
                  <Label htmlFor="andarInputModal" className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>🏢 Qual é o andar do apartamento?</span>
                    <span className="text-[10px] text-slate-400 font-normal">opcional</span>
                  </Label>
                  <Input
                    id="andarInputModal"
                    type="text"
                    placeholder="Ex: 8º andar (ou Térreo, Andar Alto...)"
                    value={extractedData.andar || ''}
                    onChange={(e) => {
                      setExtractedData({
                        ...extractedData,
                        andar: e.target.value,
                      });
                    }}
                    className="text-xs h-9 bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 rounded-xl"
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <p className="text-xs text-rose-500 font-medium text-center">{errorMsg}</p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!extractedData}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
              >
                <Send className="mr-1.5 h-4 w-4" /> Enviar Sugestão para o Casal
              </Button>
            </DialogFooter>
          </form>
        )}
      </div>
    </Dialog>
  );
}
