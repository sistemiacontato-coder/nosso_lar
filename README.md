# 🏡 Nosso Lar — Dashboard Comparador e Cotador de Imóveis (Saymon & Kelly)

Uma aplicação web moderna, responsiva e completa construída em **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, componentes inspirados no **shadcn/ui** e ícones **Lucide React**, personalizada para o casal **Saymon 🧔 & Kelly 👩**.

Projetada para cotar links de múltiplos portais (**B2M Imóveis, Vanderleia Imóveis, VivaReal, QuintoAndar, Zap Imóveis, Loft, etc.**), extrair **fotos reais dos imóveis**, comparar custos totais (aluguel + condomínio + IPTU), preço por m², infraestrutura, logística e registrar as notas e vereditos de cada um para tomar a melhor decisão.

---

## ✨ Funcionalidades Principais

1. **🪄 Extração Automática por Link com Foto Real**:
   - Basta colar o link de qualquer portal de imóveis no formulário de cadastro e clicar em **"Extrair Dados"**:
     - 📸 Baixa a **foto real da fachada/interior** do imóvel para o card.
     - 💰 Extrai automaticamente o **Aluguel**, **Condomínio**, **IPTU**, **Área útil (m²)**, **Quartos**, **Vagas** e **Diferenciais**.

2. **💑 Sistema de Avaliação Dupla (Saymon & Kelly)**:
   - **Saymon 🧔**: Nota individual (1 a 5 ⭐), Veredito (*Aprovado*, *Gostei*, *Neutro*, *Não Curti*) e comentários detalhados.
   - **Kelly 👩**: Nota individual (1 a 5 ⭐), Veredito (*Aprovada*, *Gostei*, *Neutra*, *Não Curti*) e comentários detalhados.
   - **Média & Sintonia do Casal**: Badge dinâmico de *Match do Casal 💖*, *Alta Sintonia ✨* ou *Divergência ⚠️*.

3. **🏢 5 Apartamentos Reais Cadastrados na Base**:
   - [AP3464-B2MC - Continental / Vila Yara (84m²)](https://www.b2mimoveis.com.br/imovel/apartamento-osasco-3-quartos-84-m/AP3464-B2MC) — 3 qtos (1 suíte), 2 vagas, varanda gourmet.
   - [AP00770 - Vanderleia Imóveis / Vila Yara (75m²)](http://www.vanderleiaimoveis.com.br/alugar/sp/osasco/vila-yara/apartamento/78804346) — 3 qtos (1 suíte), 2 vagas, foto real da fachada.
   - [AP3527-B2MC - Lorian Boulevard / Vila São Francisco (86m²)](http://b2mimoveis.com.br/imovel/detalhes/AP3527-B2MC) — 3 qtos (1 suíte), 2 vagas, quadra de tênis e lazer clube.
   - [VivaReal - Vila São Francisco (80m²)](https://www.vivareal.com.br/imovel/apartamento-3-quartos-vila-sao-francisco-zona-oeste-zona-oeste-sao-paulo-com-garagem-80m2-aluguel-RS3800-id-2904724653/) — 3 qtos (1 suíte), 1 vaga, armários planejados.
   - [VivaReal - Vila Yara (75m²)](https://www.vivareal.com.br/imovel/apartamento-3-quartos-vila-yara-bairros-osasco-com-garagem-75m2-aluguel-RS3800-id-2903669398/) — 3 qtos, 1 vaga, excelente localização.

4. **⚖️ Comparador Lado a Lado (2 a 4 Imóveis)**:
   - Tabela comparativa detalhada com os pontos de vista e notas de Saymon e Kelly colocados lado a lado, custos discriminados e destaque para os melhores valores.

5. **📊 Header KPIs em Tempo Real**:
   - Total de imóveis cadastrados
   - Média de custo mensal do casal
   - Menor custo mensal encontrado
   - Top Match do Casal (imóvel com maior média entre os dois)

6. **💾 Persistência Local e Backup JSON**:
   - Armazenamento em `localStorage` seguro.
   - Exportação e importação de arquivo `.json` a qualquer momento.

---

## 🚀 Como Rodar Localmente

```bash
# Iniciar o servidor
npm run dev
```
Acesse no seu navegador: **[http://localhost:3000](http://localhost:3000)**
