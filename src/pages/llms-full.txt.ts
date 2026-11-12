import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { bedrijf } from '../lib/bedrijf';
import { absoluut } from '../lib/seo';
import { heeftPlaceholder, platteTekst } from '../lib/tekst';

// Volledige tekst van de kennisbank en de veelgestelde vragen in één bestand, voor AI-assistenten
// (aanvulling op llms.txt, dat alleen een overzicht met links is). Onafgemaakte antwoorden blijven eruit.
export const GET: APIRoute = async () => {
  const kennis = (await getCollection('kennis')).sort((x, y) => x.data.volgorde - y.data.volgorde);
  const faq = (await getCollection('faq', (f) => Boolean(f.body) && !heeftPlaceholder(f.body!))).sort(
    (x, y) => x.data.volgorde - y.data.volgorde,
  );
  const datum = (d: Date) => d.toISOString().slice(0, 10);

  const regels = [
    `# ${bedrijf.naam}: kennisbank en veelgestelde vragen`,
    '',
    `> Algemene uitleg over airconditioning en warmtepompen van ${bedrijf.naam} (${bedrijf.adres.plaats}). Geen persoonlijk advies. Overzicht van de site: ${absoluut('/llms.txt')}`,
    '',
    ...kennis.flatMap((k) => [
      `## ${k.data.titel}`,
      '',
      `Bron: ${absoluut(`/kennisbank/${k.id}`)} · Bijgewerkt: ${datum(k.data.bijgewerkt)}`,
      '',
      k.data.intro,
      '',
      'In het kort:',
      ...k.data.kernpunten.map((p) => `- ${p}`),
      '',
      // Tussenkoppen één niveau dieper, zodat elk artikel één sectie blijft
      (k.body ?? '').trim().replace(/^(#+)/gm, '#$1'),
      '',
      'Bronnen:',
      ...k.data.bronnen.map((b) => `- [${b.naam}](${b.url})`),
      '',
    ]),
    '## Veelgestelde vragen',
    '',
    `Bron: ${absoluut('/veelgestelde-vragen')}`,
    '',
    ...faq.flatMap((f) => [`### ${f.data.vraag}`, '', platteTekst(f.body!), '']),
  ];
  return new Response(regels.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
