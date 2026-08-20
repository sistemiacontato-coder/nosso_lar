export type PropertyStatus =
  | 'Para Analisar'
  | 'Agendar Visita'
  | 'Visita Agendada'
  | 'Pendente Avaliação'
  | 'Proposta Enviada'
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
  duvidasCorretor?: string; // Dúvidas/Perguntas para fazer ao corretor
  isSugestao?: boolean; // Se verdadeiro, está na aba "Sugestões dos Corretores"
  nomeCorretor?: string;
  telefoneCorretor?: string;
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
  'Para Analisar': {
    label: 'Para Analisar',
    color: 'slate',
    bg: 'bg-slate-500/10 dark:bg-slate-500/20',
    border: 'border-slate-500/30',
    text: 'text-slate-700 dark:text-slate-300 font-medium text-xs',
  },
  'Agendar Visita': {
    label: 'Agendar Visita',
    color: 'sky',
    bg: 'bg-sky-500/10 dark:bg-sky-500/20',
    border: 'border-sky-500/30',
    text: 'text-sky-700 dark:text-sky-300 font-medium text-xs',
  },
  'Visita Agendada': {
    label: 'Visita Agendada',
    color: 'indigo',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    border: 'border-indigo-500/30',
    text: 'text-indigo-700 dark:text-indigo-300 font-medium text-xs',
  },
  'Pendente Avaliação': {
    label: 'Pendente Avaliação',
    color: 'blue',
    bg: 'bg-blue-500/15 dark:bg-blue-500/25',
    border: 'border-blue-500/40',
    text: 'text-blue-800 dark:text-blue-300 font-semibold text-xs',
  },
  'Proposta Enviada': {
    label: 'Proposta Enviada',
    color: 'emerald',
    bg: 'bg-emerald-500/15 dark:bg-emerald-500/25',
    border: 'border-emerald-500/40',
    text: 'text-emerald-800 dark:text-emerald-300 font-semibold text-xs',
  },
  'Descartado': {
    label: 'Descartado',
    color: 'rose',
    bg: 'bg-rose-500/10 dark:bg-rose-500/20',
    border: 'border-rose-500/30',
    text: 'text-rose-700 dark:text-rose-300 font-medium text-xs',
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
      label: 'Sintonia Perfeita 💖',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      border: 'border-rose-200 dark:border-rose-800',
    };
  }

  if (media >= 4) {
    return {
      label: 'Muito Bem Avaliado ⭐',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      border: 'border-amber-200 dark:border-amber-800',
    };
  }

  if (diff >= 2) {
    return {
      label: 'Divergência ⚡',
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      border: 'border-purple-200 dark:border-purple-800',
    };
  }

  return {
    label: 'Avaliado',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    border: 'border-blue-200 dark:border-blue-800',
  };
}
