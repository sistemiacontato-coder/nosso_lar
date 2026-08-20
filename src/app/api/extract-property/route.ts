import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url, apiKey: clientApiKey, model: clientModel } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL do anúncio é obrigatória' },
        { status: 400 }
      );
    }

    // Fetch page HTML with standard browser headers
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Não foi possível acessar a página (${response.status})` },
        { status: 400 }
      );
    }

    const html = await response.text();

    // Helper regex extractors
    const getMeta = (propName: string): string => {
      const match =
        html.match(new RegExp(`<meta\\s+property=["']${propName}["']\\s+content=["'](.*?)["']`, 'i')) ||
        html.match(new RegExp(`<meta\\s+content=["'](.*?)["']\\s+property=["']${propName}["']`, 'i')) ||
        html.match(new RegExp(`<meta\\s+name=["']${propName}["']\\s+content=["'](.*?)["']`, 'i')) ||
        html.match(new RegExp(`<meta\\s+content=["'](.*?)["']\\s+name=["']${propName}["']`, 'i'));
      return match ? match[1].trim() : '';
    };

    // 1. Extrair Imagem Real (OpenGraph ou JSON-LD ou tags img)
    let imageUrl =
      getMeta('og:image') ||
      getMeta('twitter:image') ||
      getMeta('image');

    if (!imageUrl) {
      const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
      if (jsonLdMatch) {
        try {
          const parsed = JSON.parse(jsonLdMatch[1]);
          if (parsed.image) {
            imageUrl = Array.isArray(parsed.image) ? parsed.image[0] : parsed.image;
          }
        } catch (e) {}
      }
    }

    // 2. Extrair Título Limpo
    let title =
      getMeta('og:title') ||
      getMeta('twitter:title') ||
      html.match(/<title>(.*?)<\/title>/i)?.[1] ||
      '';
    title = title
      .replace(/\s*\|\s*.*$/, '')
      .replace(/\s*-\s*Viva Real.*$/i, '')
      .replace(/Apartamento com \d+ dormitórios.*?(?:por R\$\s*[\d\.,]+)?/i, 'Edifício Residencial')
      .replace(/Apartamento para locação em.*?:/i, 'Residencial')
      .replace(/\(\d+m²\)/i, '')
      .replace(/:\s*\d+\s*quartos.*/i, '')
      .trim();

    // 3. Extrair Descrição / Bairro
    const description = getMeta('og:description') || getMeta('description') || '';

    // Detectar Bairro no título/descrição/URL
    let bairro = '';
    const fullText = (title + ' ' + description + ' ' + url).toLowerCase();

    if (fullText.includes('continental')) {
      bairro = 'Vila Yara / Continental - Osasco';
    } else if (fullText.includes('vila yara') || fullText.includes('yara')) {
      bairro = 'Vila Yara - Osasco';
    } else if (fullText.includes('são francisco') || fullText.includes('sao francisco')) {
      bairro = 'Vila São Francisco - Zona Oeste SP';
    } else if (fullText.includes('campesina')) {
      bairro = 'Campesina - Osasco';
    } else if (fullText.includes('autonomistas')) {
      bairro = 'Autonomistas - Osasco';
    } else {
      bairro = 'Osasco / Zona Oeste';
    }

    // 4. Extrair Valores Financeiros (Aluguel, Condomínio, IPTU)
    let aluguel = 0;
    let condominio = 0;
    let iptu = 0;

    const parseMoney = (str: string): number => {
      if (!str) return 0;
      const clean = str.replace(/[^\d,\.]/g, '').replace(/\./g, '').replace(',', '.');
      return parseFloat(clean) || 0;
    };

    const priceMatch = html.match(/R\$\s*([\d\.,]+)(?:\/mês|\/mes|\s*aluguel)/i);
    if (priceMatch) aluguel = parseMoney(priceMatch[1]);

    const condoMatch = html.match(/condom[íi]nio.*?:?\s*R\$\s*([\d\.,]+)/i);
    if (condoMatch) condominio = parseMoney(condoMatch[1]);

    const iptuMatch = html.match(/iptu.*?:?\s*R\$\s*([\d\.,]+)/i);
    if (iptuMatch) iptu = parseMoney(iptuMatch[1]);

    // 5. Extrair Cômodos (Quartos, Suítes, Banheiros, Vagas, m²)
    let quartos = 3;
    let suites = 1;
    let banheiros = 2;
    let vagas = 2;
    let area = 80;

    const quartoMatch = html.match(/(\d+)\s*(?:quartos?|dormit[óo]rios?)/i);
    if (quartoMatch) quartos = parseInt(quartoMatch[1], 10);

    const suiteMatch = html.match(/(\d+)\s*su[íi]tes?/i);
    if (suiteMatch) suites = parseInt(suiteMatch[1], 10);

    const banhoMatch = html.match(/(\d+)\s*banheiros?/i);
    if (banhoMatch) banheiros = parseInt(banhoMatch[1], 10);

    const vagaMatch = html.match(/(\d+)\s*vagas?/i);
    if (vagaMatch) vagas = parseInt(vagaMatch[1], 10);

    const areaMatch = html.match(/(\d+)\s*(?:m²|m2|metros)/i);
    if (areaMatch) area = parseInt(areaMatch[1], 10);

    // 6. Detectar Diferenciais no HTML
    const detectedDiferenciais: string[] = [];
    const lowerHtml = html.toLowerCase();

    if (lowerHtml.includes('varanda gourmet')) detectedDiferenciais.push('Varanda Gourmet');
    else if (lowerHtml.includes('varanda') || lowerHtml.includes('sacada')) detectedDiferenciais.push('Varanda / Sacada');

    if (lowerHtml.includes('armários') || lowerHtml.includes('planejados') || lowerHtml.includes('armarios')) detectedDiferenciais.push('Armários Planejados');
    if (lowerHtml.includes('piscina aquecida')) detectedDiferenciais.push('Piscina Aquecida');
    else if (lowerHtml.includes('piscina')) detectedDiferenciais.push('Piscina');

    if (lowerHtml.includes('academia') || lowerHtml.includes('fitness')) detectedDiferenciais.push('Academia');
    if (lowerHtml.includes('churrasqueira')) detectedDiferenciais.push('Churrasqueira');
    if (lowerHtml.includes('pet') || lowerHtml.includes('animais')) detectedDiferenciais.push('Aceita Pet');
    if (lowerHtml.includes('portaria 24') || lowerHtml.includes('portaria')) detectedDiferenciais.push('Portaria 24h / Blindada');
    if (lowerHtml.includes('ar-condicionado') || lowerHtml.includes('ar condicionado')) detectedDiferenciais.push('Ar-Condicionado');
    if (lowerHtml.includes('quadra')) detectedDiferenciais.push('Quadra de Tênis / Poliesportiva');
    if (lowerHtml.includes('salão de festas') || lowerHtml.includes('salao de festas')) detectedDiferenciais.push('Salão de Festas');

    // Default AI generated questions for realtor
    let duvidasCorretor = `1. A vaga de garagem é livre ou presa?\n2. O valor do condomínio inclui água ou gás individualizado?\n3. Qual a garantia de locação aceita (caução, seguro fiança ou fiador)?`;

    // 🤖 GOOGLE GEMINI AI INTEL EXTRACTION (IF API KEY IS PROVIDED)
    const effectiveApiKey = clientApiKey || process.env.GEMINI_API_KEY;
    const effectiveModel = clientModel || 'gemini-1.5-flash';

    if (effectiveApiKey) {
      try {
        const textSample = (title + '\n' + description + '\n' + html.slice(0, 4000)).slice(0, 3000);
        const prompt = `Analise este texto de anúncio de apartamento para alugar e responda EXCLUSIVAMENTE em formato JSON válido:
{
  "titulo": "Apelido limpo do prédio/condomínio sem repetir m² ou quartos",
  "valorAluguel": 3800,
  "valorCondominio": 800,
  "valorIptu": 200,
  "dormitorios": 3,
  "suites": 1,
  "banheiros": 2,
  "vagasGaragem": 2,
  "areaUtil": 80,
  "duvidasCorretor": "Escreva 3 perguntas cruciais e específicas para o casal perguntar ao corretor sobre este imóvel."
}

Texto do anúncio:
${textSample}`;

        const aiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:generateContent?key=${effectiveApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        const aiJson = await aiRes.json();
        const candidateText = aiJson.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const cleanJsonStr = candidateText.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsedAI = JSON.parse(cleanJsonStr);
          if (parsedAI.titulo) title = parsedAI.titulo;
          if (parsedAI.valorAluguel) aluguel = parsedAI.valorAluguel;
          if (parsedAI.valorCondominio) condominio = parsedAI.valorCondominio;
          if (parsedAI.valorIptu) iptu = parsedAI.valorIptu;
          if (parsedAI.dormitorios) quartos = parsedAI.dormitorios;
          if (parsedAI.suites !== undefined) suites = parsedAI.suites;
          if (parsedAI.banheiros) banheiros = parsedAI.banheiros;
          if (parsedAI.vagasGaragem !== undefined) vagas = parsedAI.vagasGaragem;
          if (parsedAI.areaUtil) area = parsedAI.areaUtil;
          if (parsedAI.duvidasCorretor) duvidasCorretor = parsedAI.duvidasCorretor;
        }
      } catch (aiErr) {
        console.warn('Fallback para extração via regex (Gemini AI erro):', aiErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        titulo: title || 'Apartamento para Locação',
        urlImagem: imageUrl || '',
        bairro: bairro || 'Osasco / Zona Oeste',
        valorAluguel: aluguel || 3800,
        valorCondominio: condominio || 800,
        valorIptu: iptu || 200,
        dormitorios: quartos,
        suites: suites,
        banheiros: banheiros,
        vagasGaragem: vagas,
        areaUtil: area,
        diferenciais: detectedDiferenciais,
        observacoes: description.slice(0, 300),
        duvidasCorretor: duvidasCorretor,
      },
    });
  } catch (error: any) {
    console.error('Erro na extração do imóvel:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar URL' },
      { status: 500 }
    );
  }
}
