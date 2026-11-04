// Minimale statische server voor dist/ (voor tests): /pad → /pad.html, zoals op Netlify.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'dist');
const port = Number(process.env.PORT ?? 4322);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

const bestaat = async (p) => (await stat(p).catch(() => null))?.isFile();

createServer(async (req, res) => {
  const pad = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const kandidaten = pad.endsWith('/') ? [join(root, pad, 'index.html')] : [join(root, pad), join(root, `${pad}.html`)];
  for (const k of kandidaten) {
    if (k.startsWith(root) && (await bestaat(k))) {
      res.writeHead(200, { 'Content-Type': types[extname(k)] ?? 'application/octet-stream' });
      return res.end(await readFile(k));
    }
  }
  res.writeHead(404, { 'Content-Type': types['.html'] });
  res.end(await readFile(join(root, '404.html')).catch(() => 'Niet gevonden'));
}).listen(port, () => console.log(`dist op http://localhost:${port}`));
