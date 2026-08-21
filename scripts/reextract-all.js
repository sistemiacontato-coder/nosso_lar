const fs = require('fs');

async function testExtract() {
  const urls = [
    'https://www.b2mimoveis.com.br/imovel/apartamento-osasco-3-quartos-84-m/AP3464-B2MC',
    'http://www.vanderleiaimoveis.com.br/alugar/sp/osasco/vila-yara/apartamento/78804346',
    'http://b2mimoveis.com.br/imovel/detalhes/AP3527-B2MC',
    'https://www.vivareal.com.br/imovel/apartamento-3-quartos-vila-sao-francisco-zona-oeste-zona-oeste-sao-paulo-com-garagem-80m2-aluguel-RS3800-id-2904724653/',
    'https://www.vivareal.com.br/imovel/apartamento-3-quartos-vila-yara-bairros-osasco-com-garagem-75m2-aluguel-RS3800-id-2903669398/',
    'https://www.vivareal.com.br/imovel/apartamento-3-quartos-adalgisa-bairros-osasco-com-garagem-82m2-aluguel-RS4800-id-2900150006/'
  ];

  for (const url of urls) {
    try {
      const res = await fetch('http://localhost:3005/api/extract-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      console.log('--- URL:', url);
      console.log(JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('Error extracting', url, e);
    }
  }
}

testExtract();
