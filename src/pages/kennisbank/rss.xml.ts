import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { bedrijf } from '../../lib/bedrijf';
import { absoluut } from '../../lib/seo';
import { xml } from '../../lib/tekst';

// RSS-feed van de kennisbank, voor feedlezers en zoekmachines. Nieuwste wijziging bovenaan.
export const GET: APIRoute = async () => {
  const artikelen = (await getCollection('kennis')).sort((a, b) => b.data.bijgewerkt.valueOf() - a.data.bijgewerkt.valueOf());
  const feed = absoluut('/kennisbank/rss.xml');
  const items = artikelen.map((a) => {
    const url = absoluut(`/kennisbank/${a.id}`);
    return [
      '    <item>',
      `      <title>${xml(a.data.titel)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${a.data.bijgewerkt.toUTCString()}</pubDate>`,
      `      <description>${xml(a.data.seoOmschrijving)}</description>`,
      '    </item>',
    ].join('\n');
  });
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${xml(`Kennisbank – ${bedrijf.naam}`)}</title>`,
    `    <link>${absoluut('/kennisbank')}</link>`,
    `    <atom:link href="${feed}" rel="self" type="application/rss+xml" />`,
    '    <description>Uitleg over airconditioning en warmtepompen, met bronnen.</description>',
    '    <language>nl-NL</language>',
    ...(artikelen[0] ? [`    <lastBuildDate>${artikelen[0].data.bijgewerkt.toUTCString()}</lastBuildDate>`] : []),
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
