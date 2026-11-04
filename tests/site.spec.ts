import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const paginas = [
  '/',
  '/airconditioning',
  '/warmtepompen',
  '/onderhoud',
  '/contact',
  '/over-sjoerd',
  '/werkgebied',
  '/veelgestelde-vragen',
  '/privacy',
  '/bedankt',
];

for (const pad of paginas) {
  test(`${pad}: laadt zonder fouten, één h1, geen ernstige toegankelijkheidsproblemen`, async ({ page }) => {
    const fouten: string[] = [];
    page.on('pageerror', (e) => fouten.push(e.message));
    const res = await page.goto(pad);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    const ernstig = axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(ernstig.map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
    const breedte = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(breedte, 'geen horizontale overloop').toBeLessThanOrEqual(0);
    expect(fouten).toEqual([]);
  });
}

test('home: koelen/verwarmen wisselt tekst, kaarten en thermometer', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Binnen koel.', { exact: true })).toBeVisible();
  await page.getByRole('radio', { name: /Verwarmen/ }).first().click();
  await expect(page.getByText('Binnen warm.', { exact: true })).toBeVisible();
  await expect(page.getByText('Binnen koel.', { exact: true })).toBeHidden();
  await expect(page.locator('#th-buiten [data-waarde]')).toHaveText('−4°');
});

test('home: keuze werkt met pijltjestoetsen', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('radio', { name: /Koelen/ }).first().focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: /Verwarmen/ }).first()).toHaveAttribute('aria-checked', 'true');
});

test('airco: opstelling-kiezer schakelt naar multi-split en neemt keuze mee', async ({ page }) => {
  await page.goto('/airconditioning');
  await page.locator('[data-kies="3"]').click();
  await expect(page.locator('.unit.aan')).toHaveCount(3);
  const cta = page.locator('[data-optie="3"] a.btn');
  await expect(cta).toHaveAttribute('href', /ruimtes=3/);
  await cta.click();
  await expect(page.locator('input[name="onderwerp"][value="airconditioning"]')).toBeChecked();
  await expect(page.locator('#bericht')).toHaveValue(/3 ruimtes/);
});

test('warmtepomp: huis-doorsnede en geschiktheidscheck reageren', async ({ page }) => {
  await page.goto('/warmtepompen');
  await page.locator('[data-sys="electric"]').click();
  await expect(page.locator('[data-huis]')).toHaveAttribute('data-systeem', 'electric');
  await page.locator('input[name="isolatie"][value="goed"]').check({ force: true });
  await page.locator('input[name="afgifte"][value="vloer"]').check({ force: true });
  await expect(page.locator('[data-richting]')).toContainText('All-electric');
});

test('vragen: zoeken op "kosten" vindt de kostenvraag en telt mee', async ({ page }) => {
  await page.goto('/veelgestelde-vragen');
  await page.locator('[data-zoekveld]').fill('kosten');
  await expect(page.getByRole('heading', { name: /Wat kost een airco of warmtepomp/ })).toBeVisible();
  await expect(page.locator('[data-teller="algemeen"]')).not.toHaveText(/^0 /);
  await page.locator('[data-zoekveld]').fill('xyzonbekend');
  await expect(page.locator('[data-geen]')).toBeVisible();
});

test('mobiel menu: opent, sluit met Escape en na klik op een link', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'alleen mobiel');
  await page.goto('/');
  const knop = page.locator('[data-toggle]');
  await knop.click();
  await expect(knop).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(knop).toHaveAttribute('aria-expanded', 'false');
  await knop.click();
  await page.locator('#hoofdmenu a', { hasText: 'Onderhoud' }).click();
  await expect(page).toHaveURL(/onderhoud/);
});

test('diepte-effect staat uit bij "minder beweging"', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4322/');
  await expect(page.locator('html')).not.toHaveClass(/diepte/);
  await ctx.close();
});

test('structured data is geldige JSON op elke pagina', async ({ page }) => {
  for (const pad of paginas) {
    await page.goto(pad);
    const blokken = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blokken.length).toBeGreaterThan(0);
    for (const b of blokken) expect(() => JSON.parse(b)).not.toThrow();
  }
});
