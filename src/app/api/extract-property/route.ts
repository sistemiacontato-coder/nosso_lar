import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

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

    // 2. Extrair Título
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
    const cleanUrl = decodeURIComponent(url).toLowerCase();
    if (cleanUrl.includes('vila-yara') || html.toLowerCase().includes('vila yara')) {
      bairro = 'Vila Yara - Osasco';
    } else if (cleanUrl.includes('vila-sao-francisco') || html.toLowerCase().includes('vila são francisco') || html.toLowerCase().includes('vila sao francisco')) {
      bairro = 'Vila São Francisco';
    } else if (cleanUrl.includes('lorian') || html.toLowerCase().includes('lorian boulevard')) {
      bairro = 'Vila São Francisco / Lorian';
    } else if (cleanUrl.includes('continental') || html.toLowerCase().includes('continental')) {
      bairro = 'Continental / Osasco';
    } else if (cleanUrl.includes('osasco') || html.toLowerCase().includes('osasco')) {
      bairro = 'Osasco';
    }

    // 4. Extrair Valores (Aluguel, Condomínio, IPTU)
    let aluguel = 0;
    let condominio = 0;
    let iptu = 0;

    // Buscar no padrão R$ 3.800,00 ou R$3,800.00 ou R$ 3.800
    const priceMatches = html.match(/R\$\s*([\d\.,]+)/gi);
    if (priceMatches && priceMatches.length > 0) {
      for (const p of priceMatches) {
        const clean = p.replace(/[^\d]/g, '');
        // If ends with 00 (cents), remove last 2 zeros if length > 4
        let num = parseInt(clean, 10);
        if (p.includes(',00') || p.includes('.00')) {
          num = Math.floor(num / 100);
        }
        if (num >= 1500 && num <= 30000) {
          aluguel = num;
          break;
        }
      }
    }

    // Buscar condomínio no texto
    const condMatch = html.match(/condom[íi]nio\s*:?\s*R?\$?\s*([\d\.,]+)/i);
    if (condMatch) {
      let val = parseInt(condMatch[1].replace(/[^\d]/g, ''), 10);
      if (condMatch[1].includes(',00') || condMatch[1].includes('.00')) val = Math.floor(val / 100);
      if (val > 100 && val < 5000) condominio = val;
    }

    // Buscar IPTU no texto
    const iptuMatch = html.match(/iptu\s*:?\s*R?\$?\s*([\d\.,]+)/i);
    if (iptuMatch) {
      let val = parseInt(iptuMatch[1].replace(/[^\d]/g, ''), 10);
      if (iptuMatch[1].includes(',00') || iptuMatch[1].includes('.00')) val = Math.floor(val / 100);
      if (val > 20 && val < 2000) iptu = val;
    }

    // 5. Extrair Quartos, Banheiros, Vagas, Metragem
    let quartos = 3;
    let suites = 1;
    let banheiros = 2;
    let vagas = 1;
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
