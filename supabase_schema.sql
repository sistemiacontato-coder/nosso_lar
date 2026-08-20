-- ====================================================================
-- ESTRUTURA E DADOS DO BANCO DE DADOS SUPABASE — NOSSO LAR (SAYMON & KELLY)
-- Prefixo obrigatório: nosso_lar_...
-- ====================================================================

-- 1. TABELA PRINCIPAL DE IMÓVEIS
CREATE TABLE IF NOT EXISTS public.nosso_lar_imoveis (
    id VARCHAR(100) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    url_anuncio TEXT NOT NULL,
    url_imagem TEXT,
    bairro VARCHAR(150) NOT NULL,
    endereco TEXT,
    valor_aluguel NUMERIC(10, 2) NOT NULL DEFAULT 0,
    valor_condominio NUMERIC(10, 2) NOT NULL DEFAULT 0,
    valor_iptu NUMERIC(10, 2) NOT NULL DEFAULT 0,
    custo_total_mensal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    dormitorios INT NOT NULL DEFAULT 3,
    suites INT NOT NULL DEFAULT 1,
    banheiros INT NOT NULL DEFAULT 2,
    vagas_garagem INT NOT NULL DEFAULT 1,
    area_util INT NOT NULL DEFAULT 80,
    preco_metro_quadrado NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tempo_trabalho_min INT DEFAULT 25,
    distancia_metro_km NUMERIC(5, 2) DEFAULT 1.5,
    diferenciais TEXT[] DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'Em Análise',
    observacoes TEXT,
    is_favorito BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE AVALIAÇÕES INDIVIDUAIS DO CASAL (SAYMON & KELLY)
CREATE TABLE IF NOT EXISTS public.nosso_lar_avaliacoes (
    id VARCHAR(100) PRIMARY KEY,
    imovel_id VARCHAR(100) NOT NULL REFERENCES public.nosso_lar_imoveis(id) ON DELETE CASCADE,
    usuario VARCHAR(50) NOT NULL CHECK (usuario IN ('Saymon', 'Kelly')),
    nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
    veredito VARCHAR(50) NOT NULL,
    opiniao TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_imovel_usuario UNIQUE(imovel_id, usuario)
);

-- 3. SEED DOS 5 APARTAMENTOS REAIS COTADOS
INSERT INTO public.nosso_lar_imoveis (
    id, titulo, url_anuncio, url_imagem, bairro, endereco, 
    valor_aluguel, valor_condominio, valor_iptu, custo_total_mensal, 
    dormitorios, suites, banheiros, vagas_garagem, area_util, preco_metro_quadrado, 
    tempo_trabalho_min, distancia_metro_km, diferenciais, status, observacoes, is_favorito
) VALUES
(
    'prop-osasco-3464',
    'Apto 3 Quartos (84m²) - Continental / Vila Yara',
    'https://www.b2mimoveis.com.br/imovel/apartamento-osasco-3-quartos-84-m/AP3464-B2MC',
    'https://imgs.kenlo.io/VWRCUkQ2Tnp3d1BJRDBJVe1szkhnWr9UfpZS9ftWwjXgr7v5Znen3XVcMHllDVRJJeIbi3YwVYEtu2JbwsxMo08BqtsDUISG7SC6wYm9oufJhx6X16nYlp3jzcXtYuzAxMU0lICrAniXrZZVQ-gXbGJpYutAazy3R8KRGXtS-BeQ-X7iUaRiE3Jb4zEMgUl0+2f8fqWT7nIM-Qr1BOL1uAeIRb7hP0FTQPlLANk18QdW9hinR0InpwcS45urs3PTcKG1MI36iGwAF0wy6oK5APevm5PPedV-GacxP3wP61NeW6wcmvuVAupw6QEZovrFTQeShQjQiOM3eYWuWN1JlbwAlAvAH7UfuRvtwtKU0qP5akmDZlc0obzO8PvlPP7xTbSkZ26pkpg85ZjVEMhUN46nSDQVFyQvcXdBsl7ktPyL7AD5bSnYrhAWHxPRzsM49G5-clU=.jpg',
    'Vila Yara / Continental - Osasco',
    'Avenida Yara - Vila Yara / Próximo ao Continental Shopping',
    4300.00, 820.00, 210.00, 5330.00,
    3, 1, 2, 2, 84, 63.40,
    25, 2.10,
    ARRAY['Varanda Gourmet', 'Armários Planejados', 'Piscina', 'Academia', 'Churrasqueira', 'Salão de Festas', 'Portaria 24h / Blindada', 'Sol da Manhã', 'Aceita Pet'],
    'Favorito',
    'Código AP3464-B2MC. Agendar visita presencial para conferir a vista e o sol da manhã.',
    TRUE
),
(
    'prop-vanderleia-78804346',
    'Apto 3 Quartos com 2 Vagas na Vila Yara (75m²)',
    'http://www.vanderleiaimoveis.com.br/alugar/sp/osasco/vila-yara/apartamento/78804346',
    'https://cdn5.uso.com.br/48599/2026/08/315297296.jpg',
    'Vila Yara - Osasco',
    'Rua Deputado Emílio Carlos, Vila Yara',
    3800.00, 829.00, 220.00, 4849.00,
    3, 1, 2, 2, 75, 64.70,
    24, 2.00,
    ARRAY['Varanda / Sacada', 'Armários Planejados', 'Piscina', 'Academia', 'Salão de Festas', 'Portaria 24h / Blindada', 'Elevador', 'Aceita Pet'],
    'Visita Agendada',
    'Código AP00770 - Vanderleia Imóveis (Tel/Whats: 11 99487-8624). Total mensal R$ 4.849.',
    TRUE
),
(
    'prop-osasco-3527',
    'Apto 3 Quartos (90m²) na Rua Moema - Vila Yara',
    'http://b2mimoveis.com.br/imovel/detalhes/AP3527-B2MC',
    'https://imgs.kenlo.io/VWRCUkQ2Tnp3d1BJRDBJVe1szkhnWr9UfpZS9ftWwjXgr7v5Znen3XVcMHllDVRJJeIbi3YwVYEtu0w8if1+1k83w8MHZ5uShCi-w4O07s+BpVy336uHg+Pf+IbDBeOGkosy2qf8FlTp77dLf9wWI2t4SrlhGB3EVqygJnlqrXyvo3XnEYp4UWla3iE3vkoJymuacciF1nU78SOdEsvKlw6MToqjDWcEHrMNAdsz6EIJ9xa9SUxy8h8d4563vSCAaKyyLIOvkiMYDwYu6oa6SeKv15TFJsonDqooL34J41sRFqAe2beFX6J24QkLuOfUB1+EkBnHl+8kYMGwX9hLnaoclAzHGLZJu02+kICR1-OqOkiCNgY5-Oybqfq4aP7yG-zscXuqhYsCyY7dIvVZKpiiDCMXAjMleGNWuUm6qvXO4g6rcjWJtghHCVTfwI4npnZ9ehhc.jpg',
    'Vila Yara - Osasco',
    'Rua Moema - Vila Yara',
    2800.00, 950.00, 238.00, 3988.00,
    3, 1, 2, 2, 90, 44.30,
    25, 2.20,
    ARRAY['Varanda / Sacada', 'Armários Planejados', 'Piscina', 'Academia', 'Quadra de Tênis / Poliesportiva', 'Portaria 24h / Blindada', 'Vista Livre', 'Andar Alto'],
    'Visita Agendada',
    'Código AP3527-B2MC. Pacote fechado divulgado por R$ 3.988,00/mês.',
    TRUE
),
(
    'prop-vilasaofrancisco-viva',
    'Apto 3 Quartos na Vila São Francisco (80m²)',
    'https://www.vivareal.com.br/imovel/apartamento-3-quartos-vila-sao-francisco-zona-oeste-zona-oeste-sao-paulo-com-garagem-80m2-aluguel-RS3800-id-2904724653/',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    'Vila São Francisco - Zona Oeste SP',
    'Rua Cândido Mota Filho, Vila São Francisco',
    3800.00, 790.00, 180.00, 4770.00,
    3, 1, 2, 1, 80, 59.60,
    22, 1.80,
    ARRAY['Varanda / Sacada', 'Armários Planejados', 'Piscina', 'Salão de Festas', 'Aceita Pet', 'Portaria 24h / Blindada', 'Próximo a Parques / Shoppings', 'Elevador'],
    'Em Análise',
    'VivaReal ID 2904724653. Checar se a vaga de garagem é livre ou presa.',
    FALSE
),
(
    'prop-vilayara-viva-75m',
    'Apto 3 Quartos na Vila Yara (75m²)',
    'https://www.vivareal.com.br/imovel/apartamento-3-quartos-vila-yara-bairros-osasco-com-garagem-75m2-aluguel-RS3800-id-2903669398/',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
    'Vila Yara - Osasco',
    'Rua Deputado Emílio Carlos / Vila Yara',
    3800.00, 750.00, 190.00, 4740.00,
    3, 1, 2, 1, 75, 63.20,
    24, 2.00,
    ARRAY['Varanda / Sacada', 'Armários Planejados', 'Piscina', 'Academia', 'Salão de Festas', 'Portaria 24h / Blindada', 'Elevador', 'Aceita Pet'],
    'Em Análise',
    'VivaReal ID 2903669398. Comparar com o de 84m² da Vila Yara que tem 2 vagas de garagem.',
    FALSE
)
ON CONFLICT (id) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    url_anuncio = EXCLUDED.url_anuncio,
    url_imagem = EXCLUDED.url_imagem,
    bairro = EXCLUDED.bairro,
    valor_aluguel = EXCLUDED.valor_aluguel,
    valor_condominio = EXCLUDED.valor_condominio,
    valor_iptu = EXCLUDED.valor_iptu,
    custo_total_mensal = EXCLUDED.custo_total_mensal;

-- 4. SEED DAS AVALIAÇÕES DE SAYMON & KELLY
INSERT INTO public.nosso_lar_avaliacoes (id, imovel_id, usuario, nota, veredito, opiniao) VALUES
('eval-3464-saymon', 'prop-osasco-3464', 'Saymon', 5, 'Aprovado', 'Planta fantástica de 84m² com 2 vagas de garagem demarcadas. Excelente infraestrutura e condomínio clube completo.'),
('eval-3464-kelly', 'prop-osasco-3464', 'Kelly', 5, 'Aprovada', 'Amei a varanda gourmet e a cozinha bem distribuída! Localização ótima perto do shopping e muito segura.'),

('eval-7880-saymon', 'prop-vanderleia-78804346', 'Saymon', 5, 'Aprovado', 'Diferencial enorme ter 2 vagas de garagem na Vila Yara com 75m² bem aproveitados. Ref: AP00770 na Vanderleia Imóveis.'),
('eval-7880-kelly', 'prop-vanderleia-78804346', 'Kelly', 5, 'Aprovada', 'Adorei a localização na Vila Yara! Condomínio e IPTU dentro do planejado e ótima distribuição.'),

('eval-3527-saymon', 'prop-osasco-3527', 'Saymon', 5, 'Aprovado', 'Excelente metragem de 90m² e pacote total por R$ 3.988/mês na Rua Moema (apenas R$ 44/m²!).'),
('eval-3527-kelly', 'prop-osasco-3527', 'Kelly', 5, 'Aprovada', 'Apartamento super amplo com 90m² e condomínio muito bem estruturado!'),

('eval-2904-saymon', 'prop-vilasaofrancisco-viva', 'Saymon', 4, 'Gostei', 'Ótima logística na Vila São Francisco, perto de comércio e fácil saída para as Marginais. Apenas 1 vaga de garagem.'),
('eval-2904-kelly', 'prop-vilasaofrancisco-viva', 'Kelly', 5, 'Aprovada', 'Bairro super arborizado, rua tranquila e segura. O apartamento é claro e ventilado.'),

('eval-2903-saymon', 'prop-vilayara-viva-75m', 'Saymon', 4, 'Gostei', 'Vila Yara é uma das melhores regiões de Osasco, pertinho do Bradesco Cidade de Deus e Shopping União.'),
('eval-2903-kelly', 'prop-vilayara-viva-75m', 'Kelly', 4, 'Gostei', 'Apartamento com planta aconchegante de 75m² e condomínio organizado. Gostei bastante da cozinha.')
ON CONFLICT (imovel_id, usuario) DO UPDATE SET
    nota = EXCLUDED.nota,
    veredito = EXCLUDED.veredito,
    opiniao = EXCLUDED.opiniao;
