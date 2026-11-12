import { test, expect } from '@playwright/test';

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

test('navigatie: kruimelpad op subpagina’s, Home in mobiel menu en footer', async ({ page }) => {
  await page.goto('/kennisbank/hybride-of-all-electric');
  const kruimel = page.getByRole('navigation', { name: 'Kruimelpad' });
  await expect(kruimel.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
  await expect(kruimel.getByRole('link', { name: 'Kennisbank' })).toHaveAttribute('href', '/kennisbank');
  await expect(kruimel.locator('[aria-current="page"]')).toHaveText('Hybride of all-electric warmtepomp?');
  await expect(page.locator('footer').getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Kruimelpad' })).toHaveCount(0);
});

test('mobiel menu: actieve pagina gemarkeerd en offerteknop altijd in beeld', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'alleen mobiel');
  await page.setViewportSize({ width: 390, height: 560 });
  await page.goto('/warmtepompen');
  await page.getByRole('button', { name: 'Menu openen' }).click();
  const menu = page.locator('#hoofdmenu');
  await expect(menu.locator('a[aria-current="page"]')).toHaveText(/Warmtepompen/);
  await expect(menu.getByRole('link', { name: 'Offerte aanvragen' })).toBeInViewport();
  await expect(page.locator('.mobile-cta')).toBeHidden();
});

test('menubalk: net boven de grens van het hamburgermenu past alles op één regel', async ({ page, isMobile }) => {
  test.skip(isMobile, 'alleen op een breed scherm');
  for (const breedte of [1181, 1200, 1240, 1280, 1366]) {
    await page.setViewportSize({ width: breedte, height: 800 });
    for (const pad of ['/', '/contact']) {
      await page.goto(pad);
      const hoogtes = await page.locator('#hoofdmenu li:not(.alleen-mobiel) a').evaluateAll((as) => as.map((a) => Math.round(a.getBoundingClientRect().height)));
      expect(Math.max(...hoogtes), `${pad} op ${breedte} px: geen afgebroken menu-item`).toBeLessThan(45);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(over, `${pad} op ${breedte} px: geen overloop`).toBeLessThanOrEqual(0);
      // Niets in de balk overlapt: telefoon en knop staan rechts van het laatste menu-item
      const eind = await page.locator('#hoofdmenu li:not(.alleen-mobiel) a').last().evaluate((a) => a.getBoundingClientRect().right);
      const tel = await page.locator('[data-header] .phone').evaluate((a) => a.getBoundingClientRect().left);
      expect(tel, `${pad} op ${breedte} px`).toBeGreaterThanOrEqual(eind);
    }
  }
});

test('diepte-effect komt terug nadat het venster even te laag was', async ({ page, isMobile }) => {
  test.skip(isMobile, 'alleen op een breed scherm');
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/diepte/);
  await page.setViewportSize({ width: 1440, height: 420 });
  await expect(page.locator('html')).not.toHaveClass(/diepte/);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator('html')).toHaveClass(/diepte/);
});
