import { test, expect } from '@playwright/test';

test('artikel: inhoudsopgave springt naar de juiste tussenkop', async ({ page }) => {
  await page.goto('/kennisbank/r32-of-r290');
  const inhoud = page.getByRole('navigation', { name: 'In dit artikel' });
  const links = inhoud.getByRole('link');
  expect(await links.count()).toBe(await page.locator('.prose h2').count());
  const tweede = links.nth(1);
  const tekst = (await tweede.textContent())!;
  await tweede.click();
  await expect(page).toHaveURL(/#.+/);
  const kop = page.locator('.prose h2', { hasText: tekst });
  await expect(kop).toBeInViewport();
  // De kop verdwijnt niet achter de vaste header
  const top = await kop.evaluate((el) => el.getBoundingClientRect().top);
  const header = await page.locator('[data-header]').evaluate((el) => el.getBoundingClientRect().bottom);
  expect(top).toBeGreaterThanOrEqual(header);
});

test('RSS-feed is geldige XML met elk artikel en staat in de kop van elke pagina', async ({ page, request }) => {
  const res = await request.get('/kennisbank/rss.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  await page.goto('/kennisbank');
  const fout = await page.evaluate((x) => new DOMParser().parseFromString(x, 'application/xml').querySelector('parsererror')?.textContent ?? null, xml);
  expect(fout).toBeNull();
  const artikelen = await page.locator('a.artikel').count();
  expect(xml.match(/<item>/g)?.length).toBe(artikelen);
  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute('href', '/kennisbank/rss.xml');
});

test('llms-full.txt bevat elk artikel met bronnen en geen onafgemaakte teksten', async ({ page, request }) => {
  const tekst = await (await request.get('/llms-full.txt')).text();
  await page.goto('/kennisbank');
  for (const titel of await page.locator('a.artikel h2').allTextContents()) expect(tekst).toContain(`## ${titel}`);
  expect(tekst).toContain('Bronnen:');
  expect(tekst).not.toMatch(/class="todo"|<span/);
});

test('security.txt is geldig en verloopt niet binnen een halfjaar', async ({ request }) => {
  const tekst = await (await request.get('/.well-known/security.txt')).text();
  expect(tekst).toMatch(/^Contact: mailto:.+@.+$/m);
  const verloopt = new Date(tekst.match(/^Expires: (.+)$/m)![1]);
  expect(verloopt.valueOf() - Date.now()).toBeGreaterThan(180 * 24 * 3600 * 1000);
});

test('webmanifest en pictogrammen bestaan', async ({ request }) => {
  const manifest = await (await request.get('/site.webmanifest')).json();
  expect(manifest.name).toBe('The CoolFactory');
  for (const icoon of manifest.icons) expect((await request.get(icoon.src)).status(), icoon.src).toBe(200);
  for (const pad of ['/favicon.ico', '/apple-touch-icon.png']) expect((await request.get(pad)).status(), pad).toBe(200);
});

test('afdrukken: menu en knoppen weg, antwoorden uitgeklapt', async ({ page }) => {
  await page.goto('/veelgestelde-vragen');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('[data-header]')).toBeHidden();
  await expect(page.locator('details .antwoord').first()).toBeVisible();
  await page.goto('/kennisbank/r32-of-r290');
  await expect(page.locator('.prose')).toBeVisible();
  await expect(page.locator('a.btn').first()).toBeHidden();
});

test('afdrukken van contact: gegevens op één vel, geen leeg vlak waar het formulier stond', async ({ page }) => {
  await page.setViewportSize({ width: 794, height: 1123 }); // A4 op 96 dpi
  await page.goto('/contact');
  await page.emulateMedia({ media: 'print' });
  await expect(page.getByRole('link', { name: /06 211/ }).first()).toBeVisible();
  await expect(page.locator('form[name="offerte"]')).toBeHidden();
  const tot = await page.locator('footer').evaluate((el) => el.getBoundingClientRect().bottom + scrollY);
  expect(tot, 'alles past op één A4').toBeLessThanOrEqual(1123);
});

test('afdrukken van de homepage en een dienstpagina: geen pagina-hoge lege vlakken', async ({ page }) => {
  await page.setViewportSize({ width: 794, height: 1123 });
  for (const pad of ['/', '/warmtepompen']) {
    await page.goto(pad);
    await page.emulateMedia({ media: 'print' });
    // Grootste verticale gat tussen opeenvolgende zichtbare tekstblokken
    const gat = await page.evaluate(() => {
      const ys = [...document.querySelectorAll('h1, h2, h3, p, li, figure, svg, img')]
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.height > 0 && r.width > 0)
        .map((r) => [r.top + scrollY, r.bottom + scrollY])
        .sort((a, b) => a[0] - b[0]);
      let eind = 0;
      let grootste = 0;
      for (const [top, bottom] of ys) {
        grootste = Math.max(grootste, top - eind);
        eind = Math.max(eind, bottom);
      }
      return Math.round(grootste);
    });
    expect(gat, `${pad}: grootste lege ruimte in px`).toBeLessThan(400);
    await page.emulateMedia({ media: 'screen' });
  }
});

test('afdrukken: tekst houdt zijn breedte en is leesbaar op de achtergrond, op elke soort pagina', async ({ page }) => {
  await page.setViewportSize({ width: 794, height: 1123 });
  for (const pad of ['/', '/airconditioning', '/warmtepompen', '/onderhoud', '/veelgestelde-vragen', '/kennisbank/r32-of-r290']) {
    await page.goto(pad);
    await page.emulateMedia({ media: 'print' });
    // Geen kolommen van één woord per regel: een alinea van enige lengte is minstens 200 px breed
    const smal = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('main p, main li')]
        .filter((el) => el.innerText.trim().length > 60 && el.getBoundingClientRect().height > 0 && el.getBoundingClientRect().width < 200)
        .map((el) => el.innerText.trim().slice(0, 40)),
    );
    expect(smal, `${pad}: te smalle tekstblokken`).toEqual([]);
    // Dezelfde contrastcontrole als op het scherm
    const { default: AxeBuilder } = await import('@axe-core/playwright');
    const uitslag = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    expect(uitslag.violations.flatMap((v) => v.nodes.map((n) => String(n.target))), `${pad}: contrast op papier`).toEqual([]);
    await page.emulateMedia({ media: 'screen' });
  }
});
