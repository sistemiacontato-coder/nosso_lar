-- ====================================================================
-- CORREÇÃO DA SINCRONIA EM NUVEM — NOSSO LAR
-- A rota /api/sync-properties grava cada imóvel inteiro em `data` (jsonb)
-- com carimbo `atualizado_em`. Essas colunas não existiam na tabela, então
-- todo upsert falhava. Rode este script uma vez no SQL Editor do Supabase.
-- ====================================================================

ALTER TABLE public.nosso_lar_imoveis
    ADD COLUMN IF NOT EXISTS data JSONB,
    ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Colunas legadas: o app agora usa `data`, então não podem bloquear o insert.
ALTER TABLE public.nosso_lar_imoveis ALTER COLUMN titulo DROP NOT NULL;
ALTER TABLE public.nosso_lar_imoveis ALTER COLUMN url_anuncio DROP NOT NULL;
ALTER TABLE public.nosso_lar_imoveis ALTER COLUMN bairro DROP NOT NULL;

-- A rota usa a chave anon: libera leitura/escrita para ela.
ALTER TABLE public.nosso_lar_imoveis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nosso_lar_imoveis_anon_all" ON public.nosso_lar_imoveis;
CREATE POLICY "nosso_lar_imoveis_anon_all" ON public.nosso_lar_imoveis
    FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
