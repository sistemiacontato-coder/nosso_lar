'use client';

import React from 'react';
import Image from 'next/image';
import {
  ExternalLink,
  Heart,
  Edit2,
  Bed,
  Bath,
  Car,
  Maximize2,
  Clock,
  Navigation,
  Star,
  Building,
  Check,
  Share2,
} from 'lucide-react';
import { Property, PropertyStatus, STATUS_CONFIG, getCoupleMatchBadge } from '@/types/property';
import { formatCurrency, formatCurrencyPerM2, formatCommute, formatDistance } from '@/lib/utils';
import { Dialog, DialogHeader } from './ui/dialog';
import { Button } from './ui/button';

interface PropertyDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onStatusChange: (id: string, status: PropertyStatus) => void;
}

export function PropertyDetailModal({
  open,
  onOpenChange,
  property,
  onEdit,
  onDelete,
  onToggleFavorite,
  onStatusChange,
}: PropertyDetailModalProps) {
  if (!property) return null;

  const statusCfg = STATUS_CONFIG[property.status] || STATUS_CONFIG['Para Analisar'];
  const coupleBadge = getCoupleMatchBadge(property.notaSaymon, property.notaKelly);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.titulo,
        text: `Confira este imóvel em ${property.bairro} por ${formatCurrency(property.custoTotalMensal)}/mês`,
        url: property.urlAnuncio,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(property.urlAnuncio);
      alert('Link do anúncio copiado para a área de transferência!');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="4xl">
      <DialogHeader>
        <div className="flex flex-wrap items-center justify-between gap-2 pr-8">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.text}`}
            >
              {statusCfg.label}
            </span>
            {coupleBadge && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${coupleBadge.bg} ${coupleBadge.border} ${coupleBadge.color}`}
              >
                {coupleBadge.label}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleFavorite(property.id)}
              className="h-8 px-2.5 text-xs"
            >
              <Heart
                className={`h-3.5 w-3.5 mr-1 ${
                  property.isFavorito ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
              {property.isFavorito ? 'Favoritado' : 'Favoritar'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="h-8 px-2.5 text-xs"
            >
              <Share2 className="h-3.5 w-3.5 mr-1 text-slate-500" />
              Compartilhar
            </Button>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-6">
        {/* Photo Header */}
        <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-inner">
          {property.urlImagem ? (
            <Image
              src={property.urlImagem}
              alt={property.titulo}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-400">
              <Building className="h-16 w-16 mb-2 opacity-50" />
              <span className="text-sm font-medium">Sem imagem cadastrada</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="inline-block rounded bg-black/50 backdrop-blur-md px-2.5 py-1 text-xs font-semibold mb-1.5">
              {decodeHtmlEntities(property.bairro)} {property.endereco ? `• ${property.endereco}` : ''}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md">
              {decodeHtmlEntities(property.titulo)}
            </h2>
          </div>
        </div>

        {/* Financial Highlights Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15 p-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
              Custo Total Mensal
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(property.custoTotalMensal)}
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5">
              Tudo incluso / mês
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Aluguel Puro
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(property.valorAluguel)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Valor contratual</span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Condomínio + IPTU
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(property.valorCondominio + property.valorIptu)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Cond: {formatCurrency(property.valorCondominio)} | IPTU: {formatCurrency(property.valorIptu)}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Preço por m²
            </span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrencyPerM2(property.precoMetroQuadrado)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Área útil: {property.areaUtil} m²
            </span>
          </div>
        </div>

        {/* SECTION: SAYMON & KELLY COUPLE OPINIONS */}
        <div className="rounded-2xl border-2 border-rose-200/80 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-rose-200 dark:border-rose-900/40">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Avaliação do Casal: Saymon & Kelly
              </h3>
            </div>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300">
              Média do Casal: {property.mediaCasal} / 5 ⭐
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SAYMON OPINION */}
            <div className="rounded-xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-bold text-xs">
                    🧔 S
                  </span>
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">
                      Saymon
                    </span>
                    {property.vereditoSaymon && (
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                        Veredito: {property.vereditoSaymon}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= property.notaSaymon
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200 dark:text-slate-700'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                    ({property.notaSaymon}/5)
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg leading-relaxed italic">
                {property.opiniaoSaymon || 'Nenhum comentário específico do Saymon cadastrado.'}
              </p>
            </div>

            {/* KELLY OPINION */}
            <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200 font-bold text-xs">
                    👩 K
                  </span>
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-white block">
                      Kelly
                    </span>
                    {property.vereditoKelly && (
                      <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                        Veredito: {property.vereditoKelly}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= property.notaKelly
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200 dark:text-slate-700'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                    ({property.notaKelly}/5)
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg leading-relaxed italic">
                {property.opiniaoKelly || 'Nenhum comentário específico da Kelly cadastrado.'}
              </p>
            </div>
          </div>
        </div>

        {/* Specs & Logistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Maximize2 className="h-4 w-4 text-blue-600" /> Infraestrutura e Espaço
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Bed className="h-4 w-4 text-slate-400" />
                <span>
                  <strong>{property.dormitorios}</strong> Quartos ({property.suites} suíte{property.suites > 1 ? 's' : ''})
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Bath className="h-4 w-4 text-slate-400" />
                <span>
                  <strong>{property.banheiros}</strong> Banheiro{property.banheiros > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Car className="h-4 w-4 text-slate-400" />
                <span>
                  <strong>{property.vagasGaragem}</strong> Vaga{property.vagasGaragem > 1 ? 's' : ''} de Garagem
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Maximize2 className="h-4 w-4 text-slate-400" />
                <span>
                  <strong>{property.areaUtil} m²</strong> Área Privativa
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-indigo-600" /> Logística e Deslocamento do Casal
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="text-base">🧔</span> Trabalho do Saymon:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCommute(property.tempoSaymonMinutos ?? property.tempoAteTrabalhoMinutos)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="text-base">👩</span> Trabalho da Kelly:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCommute(property.tempoKellyMinutos ?? property.tempoAteTrabalhoMinutos)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-100 dark:border-slate-800 font-semibold">
                <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                  <span className="text-base">💑</span> Média do Casal:
                </span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                  {formatCommute(Math.round(((property.tempoSaymonMinutos ?? property.tempoAteTrabalhoMinutos) + (property.tempoKellyMinutos ?? property.tempoAteTrabalhoMinutos)) / 2))}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 pt-1">
                <span className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-emerald-500" /> Estação de metrô/trem:
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatDistance(property.distanciaMetroKm)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Differentials Tags */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Diferenciais e Comodidades ({property.diferenciais.length})
          </h4>
          {property.diferenciais.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Nenhum diferencial cadastrado.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {property.diferenciais.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300"
                >
                  <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Alterar Status:</span>
            <select
              value={property.status}
              onChange={(e) => onStatusChange(property.id, e.target.value as PropertyStatus)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="Em Análise">Em Análise</option>
              <option value="Visita Agendada">Visita Agendada</option>
              <option value="Visitado">Visitado</option>
              <option value="Favorito">Favorito</option>
              <option value="Descartado">Descartado</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit(property);
              }}
            >
              <Edit2 className="h-4 w-4 mr-1.5" />
              Editar / Avaliar
            </Button>

            <a
              href={property.urlAnuncio}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-1.5" />
              Abrir Anúncio Original
            </a>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
