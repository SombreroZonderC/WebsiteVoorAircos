import { test, expect } from '@playwright/test';
import { paginas, vindbaar } from './paginas';

test('elke vindbare pagina heeft een eigen titel, omschrijving, canonical en deelafbeelding', async ({ page, request }) => {
  const titels = new Map<string, string>();
  const omschrijvingen = new Map<string, string>();
  for (const pad of vindbaar) {
    await page.goto(pad);
    const titel = await page.title();
    const omschrijving = (await page.locator('meta[name="description"]').getAttribute('content')) ?? '';
    expect(titel.length, `${pad}: titel "${titel}"`).toBeLessThanOrEqual(60);
    expect(omschrijving.length, `${pad}: omschrijving`).toBeGreaterThanOrEqual(70);
    expect(omschrijving.length, `${pad}: omschrijving`).toBeLessThanOrEqual(170);
    expect(titels.get(titel), `titel dubbel: ${titel}`).toBeUndefined();
    expect(omschrijvingen.get(omschrijving), `omschrijving dubbel op ${pad}`).toBeUndefined();
    titels.set(titel, pad);
    omschrijvingen.set(omschrijving, pad);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://thecoolfactory.nl${pad === '/' ? '/' : pad}`);
    const og = new URL((await page.locator('meta[property="og:image"]').getAttribute('content'))!);
    expect((await request.get(og.pathname)).status(), `${pad}: ${og.pathname}`).toBe(200);
  }
});

test('alle interne links en afbeeldingen bestaan', async ({ page, request }) => {
  const doelen = new Map<string, string>();
  for (const pad of paginas) {
    await page.goto(pad);
    const gevonden = await page.locator('a[href^="/"], img[src^="/"], link[href^="/"]').evaluateAll((els) =>
      els.map((el) => el.getAttribute('href') ?? el.getAttribute('src')!),
    );
    for (const doel of gevonden) doelen.set(doel.split(/[?#]/)[0], pad);
  }
  for (const [doel, bron] of doelen) {
    expect((await request.get(doel)).status(), `${doel} (gelinkt vanaf ${bron})`).toBe(200);
  }
});

test('ankerlinks binnen een pagina wijzen naar een bestaand element', async ({ page }) => {
  for (const pad of paginas) {
    await page.goto(pad);
    const kapot = await page.locator('a[href^="#"]').evaluateAll((as) =>
      as.map((a) => a.getAttribute('href')!).filter((h) => h.length > 1 && !document.getElementById(decodeURIComponent(h.slice(1)))),
    );
    expect(kapot, pad).toEqual([]);
  }
});

test('niet-vindbare pagina’s staan op noindex en buiten de sitemap; onbekend adres geeft de 404-pagina', async ({ page }) => {
  await page.goto('/bedankt');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  expect(vindbaar).not.toContain('/bedankt');
  const res = await page.goto('/bestaat-niet');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('uit de lucht');
});

test('llms.txt en robots.txt verwijzen naar bestaande pagina’s', async ({ request }) => {
  const llms = await (await request.get('/llms.txt')).text();
  const links = [...llms.matchAll(/\]\(https:\/\/thecoolfactory\.nl([^)]*)\)/g)].map(([, pad]) => pad || '/');
  expect(links.length).toBeGreaterThan(8);
  for (const pad of links) expect((await request.get(pad)).status(), pad).toBe(200);
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://thecoolfactory.nl/sitemap-index.xml');
});
