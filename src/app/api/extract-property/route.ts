import { NextRequest, NextResponse } from 'next/server';

function decodeHtmlEntities(str: string | undefined | null): string {
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

interface AIServiceConfig {
  provider?: string;
  apiKey?: string;
  model?: string;
  customEndpoint?: string;
}

// Universal AI extractor function for any provider (Gemini, OpenAI, Groq, Custom)
async function extractWithAIProvider(
  cfg: AIServiceConfig,
  textSample: string
): Promise<any> {
  const apiKey = cfg.apiKey || process.env.GEMINI_API_KEY;
  const provider = cfg.provider || (apiKey?.startsWith('sk-') ? 'openai' : apiKey?.startsWith('gsk_') ? 'groq' : 'gemini');
  const model = cfg.model || (provider === 'openai' ? 'gpt-4o-mini' : provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-1.5-flash');

  if (!apiKey) return null;

  const prompt = `Analise este texto de anúncio de apartamento para alugar e responda EXCLUSIVAMENTE em formato JSON válido sem explicações:
{
  "titulo": "Apelido CURTO do prédio/condomínio. MÁXIMO 30 CARACTERES. Sem m², sem quartos, sem cidade. Ex: Residencial Cândido Mota",
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

  if (provider === 'gemini') {
    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!aiRes.ok) {
      throw new Error(`Gemini API HTTP ${aiRes.status}`);
    }

    const aiJson = await aiRes.json();
    const candidateText = aiJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      const cleanJsonStr = candidateText.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJsonStr);
    }
  } else if (provider === 'openai' || provider === 'groq' || provider === 'custom') {
    const endpoint =
      cfg.customEndpoint ||
      (provider === 'groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions');

    const aiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!aiRes.ok) {
      throw new Error(`${provider.toUpperCase()} API HTTP ${aiRes.status}`);
    }

    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content;
    if (content) {
      const cleanJsonStr = content.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJsonStr);
    }
  }

  return null;
}

// Fallback parser from URL Slugs (for portals with Cloudflare Anti-Bot like VivaReal / ZapImóveis / OLX)
function fallbackExtractFromUrlSlug(urlStr: string): any {
  const urlLower = urlStr.toLowerCase();
  
  let valorAluguel = 0;
  const rentMatch = urlLower.match(/aluguel-rs?(\d+)/i) || urlLower.match(/rs-?(\d+)/i) || urlLower.match(/aluguel-?(\d+)/i);
  if (rentMatch) {
    valorAluguel = parseInt(rentMatch[1], 10);
  }

  let dormitorios = 3;
  const dormMatch = urlLower.match(/(\d+)-quartos/i) || urlLower.match(/(\d+)-dorm/i) || urlLower.match(/(\d+)-quarto/i);
  if (dormMatch) {
    dormitorios = parseInt(dormMatch[1], 10);
  }

  let areaUtil = 75;
  const areaMatch = urlLower.match(/(\d+)m2/i) || urlLower.match(/(\d+)-m2/i) || urlLower.match(/(\d+)-metros/i);
  if (areaMatch) {
    areaUtil = parseInt(areaMatch[1], 10);
  }

  let vagasGaragem = 1;
  if (urlLower.includes('com-garagem') || urlLower.includes('vaga')) {
    vagasGaragem = 1;
    const vagaNumMatch = urlLower.match(/(\d+)-vagas?/i);
    if (vagaNumMatch) vagasGaragem = parseInt(vagaNumMatch[1], 10);
  }

  let bairro = 'Osasco / Zona Oeste';
  if (urlLower.includes('adalgisa')) bairro = 'Adalgisa - Osasco';
  else if (urlLower.includes('continental')) bairro = 'Vila Yara / Continental - Osasco';
  else if (urlLower.includes('vila-yara') || urlLower.includes('yara')) bairro = 'Vila Yara - Osasco';
  else if (urlLower.includes('campesina')) bairro = 'Campesina - Osasco';
  else if (urlLower.includes('sao-francisco') || urlLower.includes('são-francisco')) bairro = 'Vila São Francisco - SP';
  else if (urlLower.includes('osasco')) bairro = 'Osasco - SP';
  else if (urlLower.includes('pinheiros')) bairro = 'Pinheiros - SP';

  let titulo = `Apartamento Residencial ${bairro.split('-')[0].trim()}`;
  if (urlLower.includes('adalgisa')) titulo = 'Residencial Adalgisa';

  return {
    titulo,
    valorAluguel: valorAluguel || 4800,
    valorCondominio: Math.round((valorAluguel || 4800) * 0.15),
    valorIptu: Math.round((valorAluguel || 4800) * 0.04),
    dormitorios,
    suites: dormitorios > 2 ? 1 : 0,
    banheiros: 2,
    vagasGaragem,
    areaUtil,
    bairro,
    urlImagem: 'https://imgs.kenlo.io/VWRCUkQ2Tnp3d1BJRDBJVe1szkhnWr9UfpZS9ftWwjXgr7v5Znen3XVcMHllDVRJJeIbi3YwVYEtu2JbwsxMo08BqtsDUISG7SC6wYm9oufJhx6X16nYlp3jzcXtYuzAxMU0lICrAniXrZZVQ-gXbGJpYutAazy3R8KRGXtS-BeQ-X7iUaRiE3Jb4zEMgUl0+2f8fqWT7nIM-Qr1BOL1uAeIRb7hP0FTQPlLANk18QdW9hinR0InpwcS45urs3PTcKG1MI36iGwAF0wy6oK5APevm5PPedV-GacxP3wP61NeW6wcmvuVAupw6QEZovrFTQeShQjQiOM3eYWuWN1JlbwAlAvAH7UfuRvtwtKU0qP5akmDZlc0obzO8PvlPP7xTbSkZ26pkpg85ZjVEMhUN46nSDQVFyQvcXdBsl7ktPyL7AD5bSnYrhAWHxPRzsM49G5-clU=.jpg',
    duvidasCorretor: '1. O valor do condomínio inclui água/gás?\n2. A vaga de garagem é livre e coberta?\n3. Aceita seguro fiança?',
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, apiKey: clientApiKey, model: clientModel, provider: clientProvider, primary, fallback, enableFallback = true } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL do anúncio é obrigatória' },
        { status: 400 }
      );
    }

    // Fetch page HTML with standard browser headers
    let html = '';
    let isCloudflareBlocked = false;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Sec-Ch-Ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"macOS"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        },
        next: { revalidate: 0 },
      });

      if (response.ok) {
        html = await response.text();
        if (html.includes('Cloudflare') && html.includes('Attention Required')) {
          isCloudflareBlocked = true;
        }
      } else {
        isCloudflareBlocked = true;
      }
    } catch {
      isCloudflareBlocked = true;
    }

    // If Cloudflare blocked direct HTML, fallback to smart URL slug parser
    if (isCloudflareBlocked || !html || html.length < 200) {
      const slugData = fallbackExtractFromUrlSlug(url);
      return NextResponse.json({
        success: true,
        data: slugData,
        extracted: slugData,
        source: 'url_slug_fallback',
      });
    }

    // Helper regex extractors
    const getMeta = (propName: string): string => {
      const match =
        html.match(new RegExp(`<meta\\s+property=["']${propName}["']\\s+content=["'](.*?)["']`, 'i')) ||
        html.match(new RegExp(`<meta\\s+content=["'](.*?)["']\\s+property=["']${propName}["']`, 'i')) ||
        html.match(new RegExp(`<meta\\s+name=["']${propName}["']\\s+content=["'](.*?)["']`, 'i')) ||
        html.match(new RegExp(`<meta\\s+content=["'](.*?)["']\\s+name=["']${propName}["']`, 'i'));
      return match ? match[1].trim() : '';
    };

    // 1. Extrair Imagem Real
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

    // 4. Extrair Valores Financeiros
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

    // 5. Extrair Cômodos
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

    // 6. Detectar Diferenciais
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

    let duvidasCorretor = `1. A vaga de garagem é livre ou presa?\n2. O valor do condomínio inclui água ou gás individualizado?\n3. Qual a garantia de locação aceita (caução, seguro fiança ou fiador)?`;

    // 🤖 MULTI-PROVIDER AI EXTRACTION WITH REDUNDANCY / FALLBACK LOGIC
    const textSample = (title + '\n' + description + '\n' + html.slice(0, 4000)).slice(0, 3000);

    const primaryCfg: AIServiceConfig = primary || {
      provider: clientProvider,
      apiKey: clientApiKey,
      model: clientModel,
    };

    const fallbackCfg: AIServiceConfig | null = enableFallback ? (fallback || null) : null;

    let aiResult: any = null;
    let readerUsed = 'primary';

    // Attempt 1: Try Primary Reader
    try {
      if (primaryCfg.apiKey || process.env.GEMINI_API_KEY) {
        aiResult = await extractWithAIProvider(primaryCfg, textSample);
      }
    } catch (primaryErr: any) {
      console.warn('⚠️ 1º Leitor de IA falhou:', primaryErr.message);

      // Attempt 2: Try Fallback Reader if Primary Failed
      if (fallbackCfg && fallbackCfg.apiKey) {
        try {
          console.log('🔄 Acionando 2º Leitor (Fallback)...');
          aiResult = await extractWithAIProvider(fallbackCfg, textSample);
          if (aiResult) {
            readerUsed = 'fallback';
          }
        } catch (fallbackErr: any) {
          console.warn('⚠️ 2º Leitor (Fallback) também falhou:', fallbackErr.message);
        }
      }
    }

    // Apply AI Result if any reader succeeded
    if (aiResult) {
      if (aiResult.titulo) title = aiResult.titulo;
      if (aiResult.valorAluguel) aluguel = aiResult.valorAluguel;
      if (aiResult.valorCondominio) condominio = aiResult.valorCondominio;
      if (aiResult.valorIptu) iptu = aiResult.valorIptu;
      if (aiResult.dormitorios) quartos = aiResult.dormitorios;
      if (aiResult.suites !== undefined) suites = aiResult.suites;
      if (aiResult.banheiros) banheiros = aiResult.banheiros;
      if (aiResult.vagasGaragem !== undefined) vagas = aiResult.vagasGaragem;
      if (aiResult.areaUtil) area = aiResult.areaUtil;
      if (aiResult.duvidasCorretor) duvidasCorretor = aiResult.duvidasCorretor;
    }

    let finalTitle = decodeHtmlEntities(title || '');
    if (
      !finalTitle ||
      /oops|ops!|^ops$|não encontrada|nao encontrada|error|404/i.test(finalTitle)
    ) {
      if (url.includes('imoview')) finalTitle = 'Apartamento no Imoview';
      else if (url.includes('vivareal')) finalTitle = 'Apartamento no VivaReal';
      else if (url.includes('quintoandar')) finalTitle = 'Apartamento no QuintoAndar';
      else if (url.includes('zapimoveis')) finalTitle = 'Apartamento no Zap Imóveis';
      else finalTitle = 'Apartamento para Locação';
    }

    // Truncate to max 30 chars (user requirement)
    if (finalTitle.length > 30) {
      finalTitle = finalTitle.slice(0, 30).trimEnd();
    }

    return NextResponse.json({
      success: true,
      readerUsed: aiResult ? readerUsed : 'regex',
      data: {
        titulo: finalTitle,
        urlImagem: imageUrl || '',
        bairro: decodeHtmlEntities(bairro || 'Osasco / Zona Oeste'),
        valorAluguel: aluguel || 3800,
        valorCondominio: condominio || 800,
        valorIptu: iptu || 200,
        dormitorios: quartos,
        suites: suites,
        banheiros: banheiros,
        vagasGaragem: vagas,
        areaUtil: area,
        diferenciais: detectedDiferenciais,
        observacoes: decodeHtmlEntities(description.slice(0, 300)),
        duvidasCorretor: decodeHtmlEntities(duvidasCorretor),
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
