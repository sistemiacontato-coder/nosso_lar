const fs = require('fs');

function fallbackExtractFromUrlSlug(urlStr) {
  const urlLower = urlStr.toLowerCase();
  
  let valorAluguel = 0;
  const rentMatch = urlLower.match(/aluguel-rs?(\d{3,5})(?:-|$|\/)/i) ||
                    urlLower.match(/rs-?(\d{3,5})(?:-|$|\/)/i) ||
                    urlLower.match(/aluguel-?(\d{3,5})(?:-|$|\/)/i);
  if (rentMatch) {
    const val = parseInt(rentMatch[1], 10);
    if (val >= 500 && val <= 50000) {
      valorAluguel = val;
    }
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
    valorAluguel: valorAluguel,
    valorCondominio: 0,
    valorIptu: 0,
    dormitorios,
    suites: dormitorios > 2 ? 1 : 0,
    banheiros: 2,
    vagasGaragem,
    areaUtil,
    bairro,
  };
}

async function runDirectExtract() {
  const fileContent = fs.readFileSync('./src/lib/initialData.ts', 'utf-8');
  console.log('Reading initialData.ts...');

  const properties = [
    {
      id: 'prop-osasco-3464',
      titulo: 'Residencial Continental',
      urlAnuncio: 'https://www.b2mimoveis.com.br/imovel/apartamento-osasco-3-quartos-84-m/AP3464-B2MC',
      areaUtil: 84,
    },
    {
      id: 'prop-vanderleia-78804346',
      titulo: 'Edifício Deputado Emílio Carlos',
      urlAnuncio: 'http://www.vanderleiaimoveis.com.br/alugar/sp/osasco/vila-yara/apartamento/78804346',
      areaUtil: 75,
    },
    {
      id: 'prop-osasco-3527',
      titulo: 'Lorian Moema',
      urlAnuncio: 'http://b2mimoveis.com.br/imovel/detalhes/AP3527-B2MC',
      areaUtil: 90,
    },
    {
      id: 'prop-vilasaofrancisco-viva',
      titulo: 'Residencial Cândido Mota',
      urlAnuncio: 'https://www.vivareal.com.br/imovel/apartamento-3-quartos-vila-sao-francisco-zona-oeste-zona-oeste-sao-paulo-com-garagem-80m2-aluguel-RS3800-id-2904724653/',
      areaUtil: 80,
    },
    {
      id: 'prop-vilayara-viva-75m',
      titulo: 'Edifício Parque Vila Yara',
      urlAnuncio: 'https://www.vivareal.com.br/imovel/apartamento-3-quartos-vila-yara-bairros-osasco-com-garagem-75m2-aluguel-RS3800-id-2903669398/',
      areaUtil: 75,
    },
    {
      id: 'prop-adalgisa-viva-82m',
      titulo: 'Residencial Adalgisa',
      urlAnuncio: 'https://www.vivareal.com.br/imovel/apartamento-3-quartos-adalgisa-bairros-osasco-com-garagem-82m2-aluguel-RS4800-id-2900150006/',
      areaUtil: 82,
    }
  ];

  for (const p of properties) {
    let aluguel = 0;
    let condo = 0;
    let iptu = 0;

    try {
      const res = await fetch(p.urlAnuncio, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      });

      if (res.ok) {
        const html = await res.text();
        const priceMatch = html.match(/R\$\s*([\d\.,]+)(?:\/mês|\/mes|\s*aluguel)/i);
        if (priceMatch) {
          const clean = priceMatch[1].replace(/\./g, '').replace(',', '.');
          aluguel = parseFloat(clean) || 0;
        }

        const condoMatch = html.match(/condom[íi]nio.*?:?\s*R\$\s*([\d\.,]+)/i);
        if (condoMatch) {
          const clean = condoMatch[1].replace(/\./g, '').replace(',', '.');
          condo = parseFloat(clean) || 0;
        }

        const iptuMatch = html.match(/iptu.*?:?\s*R\$\s*([\d\.,]+)/i);
        if (iptuMatch) {
          const clean = iptuMatch[1].replace(/\./g, '').replace(',', '.');
          iptu = parseFloat(clean) || 0;
        }
      }
    } catch (e) {}

    if (!aluguel) {
      const slugData = fallbackExtractFromUrlSlug(p.urlAnuncio);
      aluguel = slugData.valorAluguel;
    }

    console.log(`📌 Imóvel: ${p.titulo}`);
    console.log(`   URL: ${p.urlAnuncio}`);
    console.log(`   Aluguel: R$ ${aluguel} | Condomínio: R$ ${condo} | IPTU: R$ ${iptu}`);
    console.log(`   Total Mensal: R$ ${aluguel + condo + iptu}\n`);
  }
}

runDirectExtract();
