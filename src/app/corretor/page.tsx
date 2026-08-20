'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Building2,
  User,
  Phone,
  Link as LinkIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
  Send,
  Home,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PropertyFormValues } from '@/lib/schemas';
import { useProperties } from '@/hooks/useProperties';
import { Footer } from '@/components/Footer';

// Format phone number with hyphen from right to left (ex: 98139-4841 ou 8139-4841)
function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 4) return digits;
  if (digits.length <= 8) {
    return `${digits.slice(0, digits.length - 4)}-${digits.slice(digits.length - 4)}`;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export default function CorretorPortalPage() {
  const { addRealtorSuggestion, properties } = useProperties();

  const [nomeCorretor, setNomeCorretor] = useState('');
  const [dddCorretor, setDddCorretor] = useState('');
  const [numeroCorretor, setNumeroCorretor] = useState('');
  const [urlAnuncio, setUrlAnuncio] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<PropertyFormValues | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const checkDuplicate = (url: string) => {
    if (!url.trim()) return null;
    const cleanUrl = url.trim().toLowerCase().replace(/\/$/, '');
    return (
      properties.find(
        (p) => p.urlAnuncio && p.urlAnuncio.trim().toLowerCase().replace(/\/$/, '') === cleanUrl
      ) || null
    );
  };

  const handleExtractAndValidateWithUrl = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;

    // Friendly URL validation
    const isValidUrl =
      targetUrl.startsWith('http://') ||
      targetUrl.startsWith('https://') ||
      targetUrl.includes('vivareal.com.br') ||
      targetUrl.includes('quintoandar.com.br') ||
      targetUrl.includes('zapimoveis.com.br') ||
      targetUrl.includes('b2m.com.br');

    if (!isValidUrl) {
      setErrorMsg('Verificamos que esse não é um endereço de site válido. Por favor, insira uma URL.');
      return;
    }

    const dup = checkDuplicate(targetUrl);
    if (dup) {
      setDuplicateWarning(
        `⚠️ Link Repetido! Este imóvel já foi cadastrado para o casal como "${dup.titulo}" (${dup.bairro}).`
      );
      return;
    }

    setIsExtracting(true);
    setErrorMsg(null);
    setDuplicateWarning(null);
    setExtractedData(null);

    try {
      const formattedUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;

      const res = await fetch('/api/extract-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl.trim() }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error('Verificamos que esse não é um endereço de site válido. Por favor, insira uma URL.');
      }

      const d = json.data;
      const formVal: PropertyFormValues = {
        titulo: d.titulo || 'Apartamento Sugerido',
        urlAnuncio: formattedUrl.trim(),
        urlImagem: d.urlImagem || '',
        bairro: d.bairro || 'Vila Yara / Osasco',
        endereco: d.endereco || '',
        valorAluguel: d.valorAluguel || 3800,
        valorCondominio: d.valorCondominio || 800,
        valorIptu: d.valorIptu || 200,
        dormitorios: d.dormitorios || 3,
        suites: d.suites || 1,
        banheiros: d.banheiros || 2,
        vagasGaragem: d.vagasGaragem || 2,
        areaUtil: d.areaUtil || 80,
        tempoAteTrabalhoMinutos: 25,
        tempoSaymonMinutos: 25,
        tempoKellyMinutos: 30,
        distanciaMetroKm: 1.5,
        diferenciais: d.diferenciais || [],
        status: 'Para Analisar',

        notaSaymon: 5,
        vereditoSaymon: 'Aprovado',
        notaKelly: 5,
        vereditoKelly: 'Aprovada',

        observacoes: d.observacoes || '',
        duvidasCorretor: d.duvidasCorretor || '',
      };

      setExtractedData(formVal);
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          'Verificamos que esse não é um endereço de site válido. Por favor, insira uma URL.'
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExtract = () => handleExtractAndValidateWithUrl(urlAnuncio);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCorretor.trim()) {
      setErrorMsg('Informe seu Nome / Imobiliária.');
      return;
    }
    if (!dddCorretor.trim() || dddCorretor.length < 2) {
      setErrorMsg('Informe o DDD (2 dígitos).');
      return;
    }
    if (!numeroCorretor.trim() || numeroCorretor.replace(/\D/g, '').length < 8) {
      setErrorMsg('Informe o número de celular válido.');
      return;
    }
    if (!extractedData) {
      setErrorMsg('Cole o link e clique em Escanear Anúncio antes de enviar.');
      return;
    }

    const fullPhone = `(${dddCorretor}) ${numeroCorretor}`;
    addRealtorSuggestion(extractedData, nomeCorretor, fullPhone);
    setSubmittedSuccess(true);
  };

  const totalCost = extractedData
    ? extractedData.valorAluguel + extractedData.valorCondominio + extractedData.valorIptu
    : 0;

  const isPriceOk = totalCost <= 5000;
  const isDormsOk = extractedData ? extractedData.dormitorios >= 3 : true;
  const isVagasOk = extractedData ? extractedData.vagasGaragem >= 2 : true;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20">
              👔
            </div>
            <div>
              <h1 className="font-extrabold text-base text-slate-900 dark:text-white">
                Portal do Corretor — Saymon & Kelly
              </h1>
              <p className="text-[11px] text-slate-500">
                Envio de Imóveis para Aluguel (Osasco & SP Zona Oeste)
              </p>
            </div>
          </div>

          <a
            href="/"
            className="text-xs font-bold text-slate-600 hover:text-indigo-600 dark:text-slate-400 flex items-center gap-1"
          >
            <span>Ver Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
              Envio Público Sem Login 🤖
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Sugerir Imóvel para o Casal
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Preencha seu nome, DDD, celular e cole a URL do anúncio. Nossa Inteligência Artificial lerá o imóvel e o enviará diretamente para Saymon & Kelly.
            </p>
          </div>

          {submittedSuccess ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Imóvel Enviado com Sucesso! 🎉
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Sua sugestão já está disponível na aba <strong>💡 Sugestões dos Corretores</strong> para o casal avaliar.
              </p>
              <Button
                type="button"
                onClick={() => {
                  setSubmittedSuccess(false);
                  setExtractedData(null);
                  setUrlAnuncio('');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                Enviar Outro Imóvel
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 1. Identification - Single Row Layout */}
              <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                  1. Seus Dados de Contato
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  {/* Seu Nome / Imobiliária (col-span-6) */}
                  <div className="sm:col-span-6 space-y-1">
                    <Label htmlFor="nomeCorretor" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Seu Nome / Imobiliária <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="nomeCorretor"
                        placeholder="Ex: Juca"
                        value={nomeCorretor}
                        onChange={(e) => setNomeCorretor(e.target.value)}
                        className="pl-9 text-xs h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  {/* DDD (col-span-2) */}
                  <div className="sm:col-span-2 space-y-1">
                    <Label htmlFor="dddCorretor" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      DDD <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="dddCorretor"
                      placeholder="11"
                      value={dddCorretor}
                      maxLength={2}
                      onChange={(e) => {
                        const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 2);
                        setDddCorretor(onlyNums);
                      }}
                      className="text-xs h-10 text-center font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
                      required
                    />
                  </div>

                  {/* Número Celular / WhatsApp (col-span-4) */}
                  <div className="sm:col-span-4 space-y-1">
                    <Label htmlFor="numeroCorretor" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Celular / WhatsApp <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="numeroCorretor"
                        placeholder="98139-4841"
                        value={numeroCorretor}
                        maxLength={10}
                        onChange={(e) => {
                          const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 9);
                          let formatted = rawDigits;
                          if (rawDigits.length > 4) {
                            formatted = `${rawDigits.slice(0, rawDigits.length - 4)}-${rawDigits.slice(rawDigits.length - 4)}`;
                          }
                          setNumeroCorretor(formatted);
                        }}
                        className="pl-9 text-xs h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Link Scanner */}
              <div className="space-y-2">
                <Label htmlFor="urlAnuncio" className="text-xs font-semibold">
                  2. Link do Imóvel (VivaReal, QuintoAndar, Zap, B2M, etc.) <span className="text-rose-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="urlAnuncio"
                      type="text"
                      placeholder="https://www.vivareal.com.br/imovel/..."
                      value={urlAnuncio}
                      onChange={(e) => {
                        const url = e.target.value;
                        setUrlAnuncio(url);
                        setErrorMsg(null);
                        const dup = checkDuplicate(url);
                        if (dup) {
                          setDuplicateWarning(`⚠️ Link Repetido! Este imóvel já foi cadastrado como "${dup.titulo}" (${dup.bairro}).`);
                        } else {
                          setDuplicateWarning(null);
                        }
                      }}
                      onPaste={(e) => {
                        const pastedUrl = e.clipboardData.getData('text');
                        if (pastedUrl) {
                          setUrlAnuncio(pastedUrl);
                          handleExtractAndValidateWithUrl(pastedUrl);
                        }
                      }}
                      className="pl-9 text-xs"
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleExtract}
                    disabled={isExtracting || !urlAnuncio.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Leitura por IA...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-1.5 h-4 w-4" /> Escanear Anúncio
                      </>
                    )}
                  </Button>
                </div>

                {duplicateWarning && (
                  <p className="text-xs text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/60 p-2.5 rounded-xl border border-rose-200 dark:border-rose-800">
                    {duplicateWarning}
                  </p>
                )}
              </div>

              {/* Extracted Card Evaluation */}
              {extractedData && (
                <div className="rounded-2xl p-4 bg-gradient-to-r from-indigo-50/70 to-purple-50/70 dark:from-indigo-950/40 dark:to-purple-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-600" /> {extractedData.titulo}
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
                  <div className="pt-2.5 border-t border-indigo-200/60 dark:border-indigo-800/60 space-y-1">
                    <Label htmlFor="andarInput" className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span>🏢 Qual é o andar do apartamento?</span>
                      <span className="text-[10px] text-slate-400 font-normal">opcional</span>
                    </Label>
                    <Input
                      id="andarInput"
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
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 font-bold text-center">
                  {errorMsg}
                </div>
              )}

              <Button
                type="submit"
                disabled={!extractedData}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20"
              >
                <Send className="mr-2 h-4 w-4" /> Enviar Imóvel para Saymon & Kelly
              </Button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
