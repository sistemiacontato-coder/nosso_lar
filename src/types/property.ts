export type PropertyStatus =
  | 'Em Análise'
  | 'Visita Agendada'
  | 'Visitado'
  | 'Favorito'
  | 'Descartado';

export type VereditoSaymon = 'Aprovado' | 'Gostei' | 'Neutro' | 'Não Curti';
export type VereditoKelly = 'Aprovada' | 'Gostei' | 'Neutra' | 'Não Curti';

export interface Property {
  id: string;
  titulo: string;
  urlAnuncio: string;
  urlImagem?: string;
  bairro: string;
  endereco?: string;
  valorAluguel: number;
  valorCondominio: number;
  valorIptu: number;
  custoTotalMensal: number; // aluguel + condomínio + iptu
  dormitorios: number;
  suites: number;
  banheiros: number;
  vagasGaragem: number;
  areaUtil: number; // em m²
  precoMetroQuadrado: number; // custoTotalMensal / areaUtil
  tempoAteTrabalhoMinutos: number;
  distanciaMetroKm: number;
  diferenciais: string[];
  status: PropertyStatus;

  // Avaliações do Casal (Saymon & Kelly)
  notaSaymon: number; // 1 a 5
  opiniaoSaymon?: string;
  vereditoSaymon?: VereditoSaymon;

  notaKelly: number; // 1 a 5
  opiniaoKelly?: string;
  vereditoKelly?: VereditoKelly;

  mediaCasal: number; // (notaSaymon + notaKelly) / 2
  notaPessoal: number; // Média para compatibilidade

  observacoes?: string;
  dataCadastro: string; // ISO string
  isFavorito?: boolean;
}

export type PropertySortKey =
  | 'mediaCasal_desc'
  | 'notaSaymon_desc'
  | 'notaKelly_desc'
  | 'precoTotal_asc'
  | 'precoTotal_desc'
  | 'precoM2_asc'
  | 'tempoTrabalho_asc'
  | 'recente_desc'
  | 'area_desc';

export interface PropertyFilters {
  search: string;
  status: string; // 'todos' | PropertyStatus
  precoMax?: number;
  dormitoriosMin?: number;
  vagasMin?: number;
  diferenciais: string[];
  apenasFavoritos: boolean;
  apenasMatchPerfeito: boolean;
  tempoMaxTrabalho?: number;
}

export const AVAILABLE_DIFFERENTIALS = [
  'Varanda Gourmet',
  'Varanda / Sacada',
  'Armários Planejados',
  'Ar-Condicionado',
  'Aceita Pet',
  'Mobiliado',
  'Semi-Mobiliado',
  'Academia',
  'Piscina',
  'Piscina Aquecida',
  'Churrasqueira',
  'Quadra de Tênis / Poliesportiva',
  'Salão de Festas',
  'Portaria 24h / Blindada',
  'Elevador',
  'Sol da Manhã',
  'Andar Alto',
  'Vista Livre',
  'Próximo a Parques / Shoppings',
  'Coworking no Prédio',
  'Lavanderia Coletiva',
] as const;

export const STATUS_CONFIG: Record<
  PropertyStatus,
  { label: string; color: string; bg: string; border: string; text: string }
> = {
  'Em Análise': {
    label: 'Em Análise',
    color: 'slate',
    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
    border: 'border-slate-500/30',
    text: 'text-slate-700 dark:text-slate-300',
  },
  'Visita Agendada': {
    label: 'Visita Agendada',
    color: 'blue',
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-700 dark:text-blue-300',
  },
  'Visitado': {
    label: 'Visitado (Pendente Avaliação)',
    color: 'amber',
    bg: 'bg-amber-500/15 dark:bg-amber-500/25',
    border: 'border-amber-500/40',
    text: 'text-amber-800 dark:text-amber-300 font-bold',
  },
  'Favorito': {
    label: 'Favorito',
    color: 'emerald',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  'Descartado': {
    label: 'Descartado',
    color: 'rose',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    border: 'border-rose-500/30',
    text: 'text-rose-700 dark:text-rose-300',
  },
};

export function getCoupleMatchBadge(notaSaymon: number, notaKelly: number): {
  label: string;
  color: string;
  bg: string;
  border: string;
} {
  const media = (notaSaymon + notaKelly) / 2;
  const diff = Math.abs(notaSaymon - notaKelly);

  if (notaSaymon >= 4 && notaKelly >= 4 && diff <= 1) {
    return {
      label: 'Match do Casal 💖',
      color: 'text-rose-700 dark:text-rose-300',
      bg: 'bg-rose-500/15 dark:bg-rose-500/25',
      border: 'border-rose-500/30',
    };
  }
  if (media >= 4) {
    return {
      label: 'Alta Sintonia ✨',
      color: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-500/15 dark:bg-emerald-500/25',
      border: 'border-emerald-500/30',
    };
  }
  if (diff >= 2) {
    return {
      label: 'Divergência ⚠️',
      color: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-500/15 dark:bg-amber-500/25',
      border: 'border-amber-500/30',
    };
  }
  return {
    label: 'Em Avaliação ⚖️',
    color: 'text-slate-700 dark:text-slate-300',
    bg: 'bg-slate-500/15 dark:bg-slate-500/25',
    border: 'border-slate-500/30',
  };
}
