import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function decodeHtmlEntities(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyPerM2(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return 'R$ 0/m²';
  return `${new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 1,
  }).format(value)}/m²`;
}

export function formatArea(m2: number | undefined | null): string {
  if (!m2 || isNaN(m2)) return '0 m²';
  return `${m2} m²`;
}

export function formatCommute(minutes: number | undefined | null): string {
  if (!minutes && minutes !== 0) return '-';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`;
}

export function formatDistance(km: number | undefined | null): string {
  if (km === undefined || km === null || isNaN(km)) return '-';
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)} km`;
}

export function calculateTotals(
  aluguel: number = 0,
  condominio: number = 0,
  iptu: number = 0,
  area: number = 0
) {
  const custoTotal = Number(aluguel || 0) + Number(condominio || 0) + Number(iptu || 0);
  const precoM2 = area > 0 ? custoTotal / area : 0;
  return { custoTotal, precoM2 };
}
