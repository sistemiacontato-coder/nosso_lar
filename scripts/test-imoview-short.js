const fs = require('fs');

const html = fs.readFileSync('/Users/saymon/.gemini/antigravity-ide/brain/ca91ae4f-45eb-446a-9b75-08aa5977b6cb/scratch/imoview-short.html', 'utf-8');

const parseMoney = (str) => {
  if (!str) return 0;
  const clean = str.replace(/[^\d,\.]/g, '').replace(/\./g, '').replace(',', '.');
  return Math.round(parseFloat(clean)) || 0;
};

// 1. Aluguel
let aluguel = 0;
const rentMatch = html.match(/<h2[^>]*>\s*R\$\s*([\d\.,]+)/i) ||
                  html.match(/class=["'](?:preco-imovel|preco-imovel-mobile|preco)["'][^>]*>\s*R\$\s*([\d\.,]+)/i) ||
                  html.match(/R\$\s*([\d\.,]+)(?:\/mês|\/mes|\s*aluguel|\s*locaçã|locacao)/i) ||
                  html.match(/aluguel[\s\S]{0,100}?R\$\s*([\d\.,]+)/i);
if (rentMatch) {
  aluguel = parseMoney(rentMatch[1]);
}

// 2. Condomínio
let condominio = 0;
const condoMatch = html.match(/cond[\s\S]{0,150}?R\$\s*([\d\.,]+)/i);
if (condoMatch) {
  condominio = parseMoney(condoMatch[1]);
}

// 3. IPTU
let iptu = 0;
const iptuMatch = html.match(/iptu[\s\S]{0,150}?R\$\s*([\d\.,]+)/i);
if (iptuMatch) {
  iptu = parseMoney(iptuMatch[1]);
}

// 4. Área
let area = 0;
const areaMatch = html.match(/(?:área|area)[\s\S]{0,100}?([\d\.,]+)\s*m²/i) ||
                  html.match(/([\d\.,]+)\s*(?:m²|m2|metros)/i);
if (areaMatch) {
  area = parseMoney(areaMatch[1]);
}

console.log('--- TEST RESULTS FOR IMOVIEW SHORT LINK ---');
console.log('Aluguel:', aluguel);
console.log('Condomínio:', condominio);
console.log('IPTU:', iptu);
console.log('Custo Total:', aluguel + condominio + iptu);
console.log('Área Útil:', area, 'm²');
