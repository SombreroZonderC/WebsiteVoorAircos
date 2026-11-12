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
