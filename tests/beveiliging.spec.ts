import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { paginas } from './paginas';

// De testserver stuurt de headers uit dist/_headers mee, net als Netlify.
test('beveiligingsheaders staan op pagina’s en bestanden', async ({ request }) => {
  for (const pad of ['/', '/contact', '/bestaat-niet', '/favicon.svg']) {
    const h = (await request.get(pad)).headers();
    expect(h['content-security-policy'], pad).toContain("default-src 'self'");
    expect(h['strict-transport-security'], pad).toMatch(/^max-age=\d{8}$/);
    expect(h['x-content-type-options'], pad).toBe('nosniff');
    expect(h['x-frame-options'], pad).toBe('DENY');
    expect(h['referrer-policy'], pad).toBe('strict-origin-when-cross-origin');
    expect(h['permissions-policy'], pad).toContain('geolocation=()');
  }
});

test('Content-Security-Policy: geen unsafe-inline of unsafe-eval voor scripts, formulieren alleen naar de eigen site', async ({ request }) => {
  const csp = (await request.get('/')).headers()['content-security-policy'];
  const richtlijn = (naam: string) => csp.split('; ').find((r) => r.startsWith(`${naam} `)) ?? '';
  expect(richtlijn('script-src')).toMatch(/^script-src 'self'( 'sha256-[A-Za-z0-9+/=]+')+$/);
  expect(richtlijn('form-action')).toBe("form-action 'self'");
  expect(richtlijn('frame-ancestors')).toBe("frame-ancestors 'none'");
  expect(richtlijn('object-src')).toBe("object-src 'none'");
  expect(richtlijn('base-uri')).toBe("base-uri 'self'");
});

test('Content-Security-Policy blokkeert een ingevoegd inline script', async ({ page }) => {
  await page.goto('/');
  const geblokkeerd = page.waitForEvent('console', (m) => m.text().includes('Content Security Policy'));
  await page.evaluate(() => {
    const s = document.createElement('script');
    s.textContent = 'window.__ingevoegd = true';
    document.head.append(s);
  });
  await geblokkeerd;
  expect(await page.evaluate(() => '__ingevoegd' in window)).toBe(false);
});

test('de site laadt niets van andere domeinen', async ({ page }) => {
  const extern = new Set<string>();
  page.on('request', (r) => {
    const url = new URL(r.url());
    if (url.protocol.startsWith('http') && url.hostname !== 'localhost') extern.add(url.origin);
  });
  for (const pad of paginas) await page.goto(pad, { waitUntil: 'networkidle' });
  expect([...extern]).toEqual([]);
});

test('structured data kan het script-blok niet afsluiten', async () => {
  for (const pad of paginas) {
    const html = readFileSync(`dist${pad === '/' ? '/index' : pad}.html`, 'utf8');
    for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      expect(json, pad).not.toMatch(/[<>]/);
    }
  }
});

test('contactformulier neemt geen vrije tekst uit de link over', async ({ page }) => {
  await page.goto('/contact?onderwerp=%22%5D%3Cscript%3E&klacht=__proto__&advies=constructor&ruimtes=9%3Cb%3E');
  await expect(page.locator('#bericht')).toHaveValue('');
  await expect(page.locator('input[name="onderwerp"]:checked')).toHaveCount(0);
});

test('externe links die een nieuw tabblad openen hebben rel=noopener', async ({ page }) => {
  for (const pad of paginas) {
    await page.goto(pad);
    const fout = await page.locator('a[href^="http"]').evaluateAll((as) =>
      as.filter((a) => (a as HTMLAnchorElement).target === '_blank' && !(a as HTMLAnchorElement).rel.includes('noopener')).map((a) => a.outerHTML),
    );
    expect(fout, pad).toEqual([]);
  }
});
