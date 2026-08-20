import { z } from 'zod';

export const propertyFormSchema = z.object({
  titulo: z
    .string()
    .min(3, 'O título deve ter pelo menos 3 caracteres')
    .max(120, 'O título deve ter no máximo 120 caracteres'),
  urlAnuncio: z
    .string()
    .url('Insira uma URL válida (ex: https://...)')
    .min(5, 'A URL do anúncio é obrigatória'),
  urlImagem: z
    .string()
    .url('Insira uma URL válida para a imagem')
    .optional()
    .or(z.literal('')),
  bairro: z.string().min(2, 'O bairro é obrigatório'),
  endereco: z.string().optional().or(z.literal('')),
  valorAluguel: z.coerce
    .number({ invalid_type_error: 'Informe um valor numérico' })
    .min(1, 'O aluguel deve ser maior que zero'),
  valorCondominio: z.coerce
    .number({ invalid_type_error: 'Informe um valor numérico' })
    .min(0, 'O condomínio não pode ser negativo')
    .default(0),
  valorIptu: z.coerce
    .number({ invalid_type_error: 'Informe um valor numérico' })
    .min(0, 'O IPTU não pode ser negativo')
    .default(0),
  dormitorios: z.coerce
    .number({ invalid_type_error: 'Informe a quantidade' })
    .min(0, 'Mínimo 0')
    .max(20, 'Máximo 20'),
  suites: z.coerce
    .number({ invalid_type_error: 'Informe a quantidade' })
    .min(0, 'Mínimo 0')
    .max(20, 'Máximo 20')
    .default(0),
  banheiros: z.coerce
    .number({ invalid_type_error: 'Informe a quantidade' })
    .min(1, 'Pelo menos 1 banheiro')
    .max(20, 'Máximo 20'),
  vagasGaragem: z.coerce
    .number({ invalid_type_error: 'Informe a quantidade' })
    .min(0, 'Mínimo 0')
    .max(20, 'Máximo 20')
    .default(0),
  areaUtil: z.coerce
    .number({ invalid_type_error: 'Informe a área em m²' })
    .min(10, 'A área útil mínima é de 10 m²'),
  tempoAteTrabalhoMinutos: z.coerce
    .number({ invalid_type_error: 'Informe o tempo em minutos' })
    .min(0, 'Tempo não pode ser negativo')
    .default(30),
  distanciaMetroKm: z.coerce
    .number({ invalid_type_error: 'Informe a distância em km' })
    .min(0, 'Distância não pode ser negativa')
    .default(0.5),
  diferenciais: z.array(z.string()).default([]),
  status: z.enum([
    'Para Analisar',
    'Agendar Visita',
    'Visita Agendada',
    'Pendente Avaliação',
    'Proposta Enviada',
    'Descartado',
  ]).default('Para Analisar'),

  // Avaliação do Saymon
  notaSaymon: z.coerce.number().min(1).max(5).default(4),
  opiniaoSaymon: z.string().optional().or(z.literal('')),
  vereditoSaymon: z.enum(['Aprovado', 'Gostei', 'Neutro', 'Não Curti']).default('Gostei'),

  // Avaliação da Kelly
  notaKelly: z.coerce.number().min(1).max(5).default(4),
  opiniaoKelly: z.string().optional().or(z.literal('')),
  vereditoKelly: z.enum(['Aprovada', 'Gostei', 'Neutra', 'Não Curti']).default('Gostei'),

  observacoes: z.string().optional().or(z.literal('')),
  duvidasCorretor: z.string().optional().or(z.literal('')),
});

export type PropertyFormValues = z.infer<typeof propertyFormSchema>;
