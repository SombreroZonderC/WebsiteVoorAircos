import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { bedrijf } from '../lib/bedrijf';

// Samenvatting voor AI-assistenten en -zoekmachines (https://llmstxt.org).
export const GET: APIRoute = async () => {
  const diensten = (await getCollection('diensten')).sort((a, b) => a.data.volgorde - b.data.volgorde);
  const a = bedrijf.adres;

  const regels = [
    `# ${bedrijf.naam}`,
    '',
    `> ${bedrijf.naam} is een installatiebedrijf voor airconditioning en warmtepompen in ${a.plaats} (gemeente ${a.gemeente}, ${a.provincie}). Eigenaar ${bedrijf.eigenaar} heeft ${bedrijf.jarenErvaring} jaar ervaring en werkt uitsluitend met ${bedrijf.merk}. Diensten: advies aan huis, installatie en onderhoud.`,
    '',
    '## Contact',
    '',
    `- Telefoon: ${bedrijf.telefoon.internationaal}`,
    `- E-mail: ${bedrijf.email}`,
    `- Adres: ${a.straat}, ${a.postcode} ${a.plaats}`,
    ...(bedrijf.werkgebied.length > 0 ? [`- Werkgebied: ${bedrijf.werkgebied.join(', ')}`] : []),
    '',
    '## Diensten',
    '',
    ...diensten.map((d) => `- [${d.data.menuLabel}](${bedrijf.url}/${d.id}): ${d.data.seoOmschrijving}`),
    '',
    '## Meer informatie',
    '',
    `- [Veelgestelde vragen](${bedrijf.url}/veelgestelde-vragen): antwoorden over airco, warmtepompen en onderhoud`,
    `- [Over ${bedrijf.eigenaar}](${bedrijf.url}/over-sjoerd)`,
    `- [Werkgebied](${bedrijf.url}/werkgebied)`,
    `- [Contact en offerte](${bedrijf.url}/contact)`,
    '',
  ];

  return new Response(regels.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
