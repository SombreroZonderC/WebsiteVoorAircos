// Astro-integratie: schrijft na de build dist/_headers (Netlify) met de beveiligingsheaders.
// De Content-Security-Policy staat geen inline scripts toe, behalve de scripts die Astro zelf in de
// pagina's zet: daarvan wordt hier de hash berekend, zodat de policy altijd bij de build past.
// scripts/serve-dist.mjs leest hetzelfde bestand, dus de tests draaien onder dezelfde policy als live.
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;
// Datablokken (JSON-LD) worden niet uitgevoerd en vallen buiten script-src.
const DATABLOK = /type="application\/(ld\+)?json"/;

async function htmlBestanden(map) {
  const items = await readdir(map, { withFileTypes: true, recursive: true });
  return items.filter((i) => i.isFile() && i.name.endsWith('.html')).map((i) => join(i.parentPath, i.name));
}

export async function scriptHashes(dist) {
  const hashes = new Set();
  for (const bestand of await htmlBestanden(dist)) {
    const html = await readFile(bestand, 'utf8');
    for (const [, attrs, code] of html.matchAll(INLINE_SCRIPT)) {
      if (DATABLOK.test(attrs) || !code.trim()) continue;
      hashes.add(`'sha256-${createHash('sha256').update(code).digest('base64')}'`);
    }
  }
  return [...hashes].sort();
}

export const csp = (hashes) =>
  [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(' ')}`.trim(),
    // Inline stijlen: Astro zet kleine stylesheets in de pagina en componenten gebruiken style-attributen
    // voor CSS-variabelen. Stijlen kunnen geen code uitvoeren; scripts blijven strikt.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');

export const headers = (hashes) => ({
  'Content-Security-Policy': csp(hashes),
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
});

export default function beveiligingsheaders() {
  return {
    name: 'beveiligingsheaders',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const hashes = await scriptHashes(dist);
        const regels = [
          '# Gegenereerd door integrations/beveiligingsheaders.mjs. Niet met de hand aanpassen.',
          '/*',
          ...Object.entries(headers(hashes)).map(([naam, waarde]) => `  ${naam}: ${waarde}`),
          '',
          '/_astro/*',
          '  Cache-Control: public, max-age=31536000, immutable',
          '',
        ];
        await writeFile(join(dist, '_headers'), regels.join('\n'));
        logger.info(`_headers geschreven (${hashes.length} inline scripts toegestaan via hash)`);
      },
    },
  };
}
