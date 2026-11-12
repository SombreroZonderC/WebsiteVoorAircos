import type { CollectionEntry } from 'astro:content';
import { heeftPlaceholder, platteTekst } from './tekst';

export function faqSchema(items: CollectionEntry<'faq'>[]) {
  const geldig = items.filter((f) => f.body && !heeftPlaceholder(f.body));
  if (geldig.length === 0) return [];
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: geldig.map((f) => ({
        '@type': 'Question',
        name: f.data.vraag,
        acceptedAnswer: { '@type': 'Answer', text: platteTekst(f.body!) },
      })),
    },
  ];
}
