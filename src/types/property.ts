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
  valorSeguroIncendio?: number;
  custoTotalMensal: number; // aluguel + condomínio + iptu + seguro incêndio
  dormitorios: number;
  suites: number;
  banheiros: number;
  vagasGaragem: number;
  areaUtil: number; // em m²
  andar?: string; // ex: 5º andar, Térreo, Andar Alto
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

  // Tempos de Deslocamento do Casal
  tempoSaymonMinutos?: number;
  tempoKellyMinutos?: number;

  observacoes?: string;
  duvidasCorretor?: string; // Dúvidas/Perguntas para fazer ao corretor
  isSugestao?: boolean; // Se verdadeiro, está na aba "Sugestões dos Corretores"
  nomeCorretor?: string;
  telefoneCorretor?: string;
  dataCadastro: string; // ISO string
  isFavorito?: boolean;
  isArquivado?: boolean;
}

export interface CommuteAnchors {
  saymonAddress1: string;
  saymonAddress2?: string;
  saymonTime?: string; // ex: '08:00'
  saymonDay?: string; // 'weekday' (Segunda a Sexta) | 'weekend' (Fim de Semana)
  kellyAddress1: string;
  kellyAddress2?: string;
  kellyTime?: string; // ex: '08:00'
  kellyDay?: string; // 'weekday' (Segunda a Sexta) | 'weekend' (Fim de Semana)

  // Backward compatibility aliases
  saymonWork?: string;
  kellyWork?: string;
}

export type PropertySortKey =
  | 'mediaCasal_desc'
  | 'notaSaymon_desc'
  | 'notaKelly_desc'
  | 'precoTotal_asc'
  | 'precoTotal_desc'
  | 'precoM2_asc'
  | 'tempoTrabalho_asc'
  | 'tempoSaymon_asc'
  | 'tempoKelly_asc'
  | 'mediaTempo_asc'
  | 'recente_desc'
  | 'area_desc';

export interface PropertyFilters {
  search: string;
  status: PropertyStatus | 'todos';
  minBedrooms?: number;
  maxPrice?: number;
  onlyFavorites?: boolean;
  onlyMatchCasal?: boolean;
  apenasFavoritos?: boolean;
  apenasMatchPerfeito?: boolean;
  diferenciais?: string[];
  precoMax?: number;
  dormitoriosMin?: number;
  vagasMin?: number;
  tempoMaxTrabalho?: number;
}

export interface KPIStats {
  total: number;
  mediaCusto: number;
  menorCustoTotal: Property | null;
  maisPertoTrabalho: Property | null;
  topCasalMatch: Property | null;
  favoritoSaymon: Property | null;
  favoritaKelly: Property | null;
}

export const AVAILABLE_DIFFERENTIALS = [
  'Varanda Gourmet',
  'Portaria 24h / Blindada',
  'Piscina',
  'Academia',
  'Salão de Festas',
  'Churrasqueira',
  'Pet Friendly',
  'Playground',
  'Ar Condicionado',
  'Armários Planejados',
  'Próximo ao Metrô / Trem',
  'Vaga Livre / Demarcada',
  'Sol da Manhã',
  'Andar Alto',
] as const;

export const STATUS_CONFIG: Record<
  PropertyStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  'Para Analisar': {
    label: 'Para Analisar',
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  'Agendar Visita': {
    label: 'Agendar Visita',
    bg: 'bg-amber-50 dark:bg-amber-950/60',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
  },
  'Visita Agendada': {
    label: 'Visita Agendada',
    bg: 'bg-purple-50 dark:bg-purple-950/60',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
  },
  'Pendente Avaliação': {
    label: 'Pendente Avaliação',
    bg: 'bg-indigo-50 dark:bg-indigo-950/60',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  'Proposta Enviada': {
    label: 'Proposta Enviada',
    bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  Descartado: {
    label: 'Descartado',
    bg: 'bg-rose-50 dark:bg-rose-950/60',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
  },
};

export function getCoupleMatchBadge(notaSaymon: number, notaKelly: number) {
  const media = (notaSaymon + notaKelly) / 2;
  if (media >= 4.5) {
    return { label: 'Sintonia Perfeita 💖', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/80', border: 'border-rose-200 dark:border-rose-800' };
  }
  if (media >= 3.5) {
    return { label: 'Boa Escolha 👍', color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/80', border: 'border-indigo-200 dark:border-indigo-800' };
  }
  return { label: 'Opiniões Divergentes ⚡', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/80', border: 'border-amber-200 dark:border-amber-800' };
}
