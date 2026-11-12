// Markdown uit de content collections omzetten naar platte tekst (structured data, zoeken, llms-full.txt).

/** HTML-tags, markdown-opmaak en overtollige witruimte weg; de woorden blijven staan. */
export const platteTekst = (markdown: string) =>
  markdown
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Antwoorden met een placeholder (class="todo") zijn nog niet af en horen niet in feeds of structured data. */
export const heeftPlaceholder = (tekst: string) => tekst.includes('class="todo"');

/** Voor XML (RSS): de vijf tekens met een eigen betekenis. */
export const xml = (tekst: string) =>
  tekst.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!);

/** Stabiel anker voor een veelgestelde vraag (deelbare link). */
export const vraagAnker = (id: string) => `vraag-${id}`;
