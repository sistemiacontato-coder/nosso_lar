const fs = require('fs');

async function testFullExtract() {
  const url = 'https://app.imoview.com.br/AcessoExterno/VisualizarEmail?hash=7A003800770036006700460032007300550062004E0042007500660041006F00590033002F007A00540059004C007700360078006D004D0050006B006A005800720048007A006600640064004E006D003600710077003D00';

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });

  const html = await res.text();

  const parseMoney = (str) => {
    if (!str) return 0;
    const clean = str.replace(/[^\d,\.]/g, '').replace(/\./g, '').replace(',', '.');
    return Math.round(parseFloat(clean)) || 0;
  };

  // 1. Title
  let title = '';
  const titleMatch = html.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i) || html.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) title = titleMatch[1].replace(/<[^>]+>/g, '').trim();

  // 2. Aluguel
  let aluguel = 0;
  const rentMatch = html.match(/<h2[^>]*>\s*R\$\s*([\d\.,]+)/i);
  if (rentMatch) aluguel = parseMoney(rentMatch[1]);

  // 3. Condomínio
  let condominio = 0;
  const condoMatch = html.match(/(?:Cond\.|Condomínio)[\s\S]{0,100}?R\$\s*([\d\.,]+)/i);
  if (condoMatch) condominio = parseMoney(condoMatch[1]);

  // 4. IPTU
  let iptu = 0;
  const iptuMatch = html.match(/IPTU[\s\S]{0,100}?R\$\s*([\d\.,]+)/i);
  if (iptuMatch) iptu = parseMoney(iptuMatch[1]);

  // 5. Image
  let imageUrl = '';
  const imgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i) ||
                   html.match(/data-src=["'](https:\/\/cdn\.imoview\.com\.br\/[^"']+)["']/i);
  if (imgMatch) imageUrl = imgMatch[1];

  // 6. Bairro
  let bairro = '';
  if (html.toLowerCase().includes('campesina')) bairro = 'Campesina - Osasco';
  else if (html.toLowerCase().includes('vila yara') || html.toLowerCase().includes('yara')) bairro = 'Vila Yara - Osasco';

  // 7. Rooms
  let quartos = 0;
  const qMatch = html.match(/Quartos[\s\S]{0,100}?<h3[^>]*>\s*(\d+)/i);
  if (qMatch) quartos = parseInt(qMatch[1], 10);

  let suites = 0;
  const sMatch = html.match(/Suítes[\s\S]{0,100}?<h3[^>]*>\s*(\d+)/i);
  if (sMatch) suites = parseInt(sMatch[1], 10);

  let banheiros = 0;
  const bMatch = html.match(/Banheiros[\s\S]{0,100}?<h3[^>]*>\s*(\d+)/i);
  if (bMatch) banheiros = parseInt(bMatch[1], 10);

  let vagas = 0;
  const vMatch = html.match(/Vagas[\s\S]{0,100}?<h3[^>]*>\s*(\d+)/i);
  if (vMatch) vagas = parseInt(vMatch[1], 10);

  let area = 0;
  const aMatch = html.match(/Área interna:\s*([\d\.,]+)\s*m²/i) || html.match(/([\d\.,]+)\s*m²/i);
  if (aMatch) area = parseMoney(aMatch[1]);

  console.log('--- TEST RESULTS FOR IMOVIEW LONG EMAIL URL ---');
  console.log('Title:', title);
  console.log('Aluguel:', aluguel);
  console.log('Condomínio:', condominio);
  console.log('IPTU:', iptu);
  console.log('Image:', imageUrl);
  console.log('Bairro:', bairro);
  console.log('Quartos:', quartos);
  console.log('Suítes:', suites);
  console.log('Banheiros:', banheiros);
  console.log('Vagas:', vagas);
  console.log('Área:', area, 'm²');
}

testFullExtract();
