// Minimale statische server voor dist/ (voor tests en Lighthouse): /pad → /pad.html en de headers
// uit dist/_headers, zoals op Netlify. Zo draaien de tests onder dezelfde Content-Security-Policy als live.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const root = resolve(process.cwd(), 'dist');
const port = Number(process.env.PORT ?? 4322);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

// dist/_headers: blokken van een padpatroon gevolgd door ingesprongen "Naam: waarde"-regels.
async function leesHeaders() {
  const tekst = await readFile(join(root, '_headers'), 'utf8').catch(() => '');
  const regels = [];
  for (const regel of tekst.split('\n')) {
    if (!regel.trim() || regel.startsWith('#')) continue;
    if (!/^\s/.test(regel)) regels.push({ patroon: regel.trim(), headers: {} });
    else if (regels.length) {
      const i = regel.indexOf(':');
      regels.at(-1).headers[regel.slice(0, i).trim()] = regel.slice(i + 1).trim();
    }
  }
  return regels;
}
const past = (patroon, pad) => (patroon.endsWith('*') ? pad.startsWith(patroon.slice(0, -1)) : pad === patroon);

// Tekstbestanden gecomprimeerd versturen, zoals Netlify doet (anders meet Lighthouse iets anders dan live).
const comprimeerbaar = /^(text\/|application\/(json|xml|manifest\+json)|image\/svg)/;
const verpakt = new Map(); // bestand + methode → gecomprimeerde inhoud (dist/ verandert niet tijdens een run)
function verpak(bestand, inhoud, type, accepteert = '') {
  const methode = accepteert.includes('br') ? 'br' : accepteert.includes('gzip') ? 'gzip' : null;
  if (!methode || !comprimeerbaar.test(type) || inhoud.length < 1024) return { inhoud, extra: {} };
  const sleutel = `${methode}:${bestand}`;
  if (!verpakt.has(sleutel)) verpakt.set(sleutel, methode === 'br' ? brotliCompressSync(inhoud) : gzipSync(inhoud));
  return { inhoud: verpakt.get(sleutel), extra: { 'Content-Encoding': methode, Vary: 'Accept-Encoding' } };
}

const headerRegels = await leesHeaders();
const headersVoor = (pad) => Object.assign({}, ...headerRegels.filter((r) => past(r.patroon, pad)).map((r) => r.headers));
const isBestand = async (p) => (await stat(p).catch(() => null))?.isFile() ?? false;

async function vind(pad) {
  const kandidaten = pad.endsWith('/') ? [join(pad, 'index.html')] : [pad, `${pad}.html`];
  for (const k of kandidaten) {
    const bestand = resolve(root, `.${k}`);
    // Nooit buiten dist/ lezen, ook niet via ../ of een map die toevallig met "dist" begint.
    if ((bestand === root || bestand.startsWith(root + sep)) && (await isBestand(bestand))) return bestand;
  }
  return null;
}

createServer(async (req, res) => {
  try {
    const pad = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const bestand = pad.includes('\0') ? null : await vind(pad);
    const basis = headersVoor(pad);
    if (bestand) {
      const type = types[extname(bestand)] ?? 'application/octet-stream';
      const { inhoud, extra } = verpak(bestand, await readFile(bestand), type, req.headers['accept-encoding']);
      res.writeHead(200, { ...basis, ...extra, 'Content-Type': type });
      return res.end(inhoud);
    }
    res.writeHead(404, { ...basis, 'Content-Type': types['.html'] });
    res.end(await readFile(join(root, '404.html')).catch(() => 'Niet gevonden'));
  } catch {
    // Onleesbaar pad (bijv. ongeldige %-codering): geen crash, gewoon een fout terug.
    res.writeHead(400, { 'Content-Type': types['.txt'] });
    res.end('Ongeldig verzoek');
  }
}).listen(port, () => console.log(`dist op http://localhost:${port}`));
