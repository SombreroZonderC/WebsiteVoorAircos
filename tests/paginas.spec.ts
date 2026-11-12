import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { paginas } from './paginas';

for (const pad of paginas) {
  test(`${pad}: laadt zonder fouten, één h1, geen ernstige toegankelijkheidsproblemen`, async ({ page }) => {
    const fouten: string[] = [];
    page.on('pageerror', (e) => fouten.push(e.message));
    // Ook consolefouten tellen mee: een geblokkeerd script (Content-Security-Policy) of een ontbrekend bestand
    page.on('console', (m) => m.type() === 'error' && fouten.push(m.text()));
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

test('structured data is geldige JSON op elke pagina', async ({ page }) => {
  for (const pad of paginas) {
    await page.goto(pad);
    const blokken = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blokken.length).toBeGreaterThan(0);
    for (const b of blokken) expect(() => JSON.parse(b)).not.toThrow();
  }
});

test('labels in tekeningen vallen binnen de tekening', async ({ page }) => {
  for (const pad of paginas) {
    await page.goto(pad);
    await page.evaluate(() => document.fonts.ready);
    const uit = await page.evaluate(() =>
      [...document.querySelectorAll<SVGTextElement>('svg text')]
        .map((t) => {
          const vb = t.ownerSVGElement?.viewBox.baseVal;
          if (!vb || !vb.width) return null;
          const bb = t.getBBox();
          const buiten = bb.x < vb.x - 1 || bb.x + bb.width > vb.x + vb.width + 1;
          return buiten ? t.textContent?.trim() : null;
        })
        .filter(Boolean),
    );
    expect(uit, `${pad}: ${uit.join(', ')}`).toEqual([]);
  }
});

test('kennisbank: artikelen met meer dan twee alinea’s hebben minimaal één illustratie', async ({ page }) => {
  await page.goto('/kennisbank');
  const artikelen = await page.locator('a.artikel').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
  expect(artikelen.length).toBeGreaterThan(0);
  for (const pad of artikelen) {
    await page.goto(pad);
    const alineas = await page.locator('.prose p').count();
    if (alineas > 2) await expect(page.locator('figure.illustratie svg'), pad).not.toHaveCount(0);
  }
});
