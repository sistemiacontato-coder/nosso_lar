-- ============================================================
-- SUPABASE SETUP: Sugestões em Tempo Real dos Corretores
-- Execute este SQL no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xdcdvrlemrkxlherumdx/sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.nosso_lar_sugestoes (
  id            TEXT PRIMARY KEY,
  titulo        TEXT NOT NULL,
  url_anuncio   TEXT,
  url_imagem    TEXT,
  bairro        TEXT,
  endereco      TEXT,
  valor_aluguel NUMERIC DEFAULT 0,
  valor_condominio NUMERIC DEFAULT 0,
  valor_iptu    NUMERIC DEFAULT 0,
  dormitorios   INT DEFAULT 1,
  suites        INT DEFAULT 0,
  banheiros     INT DEFAULT 1,
  vagas_garagem INT DEFAULT 0,
  area_util     NUMERIC DEFAULT 50,
  tempo_trabalho_min INT DEFAULT 25,
  diferenciais  JSONB DEFAULT '[]',
  observacoes   TEXT,
  duvidas_corretor TEXT,
  nome_corretor TEXT,
  telefone_corretor TEXT,
  aprovado      BOOLEAN DEFAULT FALSE,
  criado_em     TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS) - permitir INSERT de qualquer um (corretor) e SELECT para o painel
ALTER TABLE public.nosso_lar_sugestoes ENABLE ROW LEVEL SECURITY;

-- Política: qualquer pessoa pode inserir (corretor público sem login)
CREATE POLICY "Corretores podem sugerir imóveis" ON public.nosso_lar_sugestoes
  FOR INSERT WITH CHECK (true);

-- Política: apenas leitura autenticada (ou anon para o painel)
CREATE POLICY "Painel pode ler sugestões" ON public.nosso_lar_sugestoes
  FOR SELECT USING (true);

-- Política: painel pode marcar como aprovado
CREATE POLICY "Painel pode aprovar sugestões" ON public.nosso_lar_sugestoes
  FOR UPDATE USING (true);

-- Habilitar Realtime nesta tabela
ALTER PUBLICATION supabase_realtime ADD TABLE public.nosso_lar_sugestoes;
