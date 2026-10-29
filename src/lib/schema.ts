import type { CollectionEntry } from 'astro:content';

// Antwoorden met een placeholder (class="todo") horen niet in structured data.
const heeftPlaceholder = (tekst: string) => tekst.includes('class="todo"');

const naarTekst = (markdown: string) =>
  markdown
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

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
        acceptedAnswer: { '@type': 'Answer', text: naarTekst(f.body!) },
      })),
    },
  ];
}
