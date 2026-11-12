import { readFileSync } from 'node:fs';

// Alle pagina's van de gebouwde site, uit de sitemap: een nieuwe pagina of een nieuw artikel wordt
// vanzelf meegetest. Plus de pagina's die bewust niet in de sitemap staan.
const sitemap = readFileSync('dist/sitemap-0.xml', 'utf8');
export const vindbaar = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => new URL(url).pathname.replace(/\/$/, '') || '/');
export const nietVindbaar = ['/bedankt'];
export const paginas = [...vindbaar, ...nietVindbaar];

if (vindbaar.length < 10) throw new Error('Sitemap onvolledig: draai eerst `npm run build`.');
