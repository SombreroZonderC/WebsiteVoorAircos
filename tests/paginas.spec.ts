import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { onbekend, paginas } from './paginas';

for (const pad of paginas) {
  test(`${pad}: laadt zonder fouten, één h1, geen ernstige toegankelijkheidsproblemen`, async ({ page }) => {
    const fouten: string[] = [];
    page.on('pageerror', (e) => fouten.push(e.message));
    // Ook consolefouten tellen mee: een geblokkeerd script (Content-Security-Policy) of een ontbrekend bestand
    page.on('console', (m) => m.type() === 'error' && fouten.push(m.text()));
    const res = await page.goto(pad);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
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

test('smalste scherm (320 breed): geen horizontale overloop op welke pagina dan ook', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ baseURL, viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  for (const pad of paginas) {
    await page.goto(pad);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over, pad).toBeLessThanOrEqual(0);
  }
  await ctx.close();
});

test('labels in tekeningen zijn op een telefoon minimaal 11 px groot', async ({ browser, baseURL }) => {
  for (const breedte of [390, 375, 360, 320]) {
    const ctx = await browser.newContext({ baseURL, viewport: { width: breedte, height: 800 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    for (const pad of paginas) {
      await page.goto(pad);
      const teKlein = await page.evaluate(() =>
        [...document.querySelectorAll<SVGTextElement>('svg text')]
          .map((t) => {
            const svg = t.ownerSVGElement!;
            const vak = svg.getBoundingClientRect();
            if (!vak.width || !svg.viewBox.baseVal.width) return null;
            const px = parseFloat(getComputedStyle(t).fontSize) * (vak.width / svg.viewBox.baseVal.width);
            return px < 11 ? `${t.textContent?.trim()} (${px.toFixed(1)} px)` : null;
          })
          .filter(Boolean),
      );
      expect(teKlein, `${pad} op ${breedte} px`).toEqual([]);
    }
    await ctx.close();
  }
});

test('de 404-pagina: één h1 en geen toegankelijkheidsproblemen', async ({ page }) => {
  const res = await page.goto(onbekend);
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveCount(1);
  const uitslag = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(uitslag.violations.filter((v) => v.impact !== 'minor').map((v) => `${v.id}: ${v.nodes[0]?.target}`)).toEqual([]);
});

test('tekeningen passen op gangbare telefoons; op het smalste scherm is schuiven aangegeven en bedienbaar', async ({ browser, baseURL }) => {
  for (const breedte of [390, 375, 360, 320]) {
    const ctx = await browser.newContext({ baseURL, viewport: { width: breedte, height: 800 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    for (const pad of paginas) {
      await page.goto(pad);
      const vakken = await page.locator('.tekening-schuif').evaluateAll((els) =>
        els.map((el) => ({
          over: el.scrollWidth - el.clientWidth,
          aangegeven: el.classList.contains('schuifbaar') && el.tabIndex === 0 && Boolean(el.getAttribute('aria-label')),
          tabstop: el.hasAttribute('tabindex'),
        })),
      );
      for (const vak of vakken) {
        if (breedte >= 360) {
          expect(vak.over, `${pad} op ${breedte} px: tekening past`).toBeLessThanOrEqual(1);
          expect(vak.tabstop, `${pad} op ${breedte} px: geen extra tabstop als er niets te schuiven is`).toBe(false);
        } else if (vak.over > 1) {
          expect(vak.aangegeven, `${pad} op ${breedte} px: schuiven aangegeven en met toetsen te bedienen`).toBe(true);
        }
      }
    }
    await ctx.close();
  }
});

test('toetsenbordfocus verdwijnt op een telefoon niet achter de vaste belbalk', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'de belbalk bestaat alleen op een smal scherm');
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 390, height: 700 });
  for (const pad of ['/veelgestelde-vragen', '/kennisbank/hybride-of-all-electric', '/onderhoud']) {
    await page.goto(pad);
    const bedekt: string[] = [];
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(350); // rustig scrollen laten uitlopen
      const fout = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        const balk = document.querySelector<HTMLElement>('.mobile-cta');
        if (!el || el === document.body || !balk || balk.contains(el)) return null;
        const b = balk.getBoundingClientRect();
        const zichtbaar = getComputedStyle(balk).display !== 'none' && !balk.classList.contains('weg') && b.height > 0;
        const r = el.getBoundingClientRect();
        // Volledig of grotendeels achter de balk: de onderkant van het element ligt onder de bovenkant van de balk
        return zichtbaar && r.bottom > b.top + 2 && r.top < b.bottom ? (el.textContent ?? '').trim().slice(0, 40) : null;
      });
      if (fout) bedekt.push(fout);
    }
    expect(bedekt, pad).toEqual([]);
  }
});

test('hoog contrast (Windows): de gekozen optie is herkenbaar aan een rand', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ baseURL, forcedColors: 'active', viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const rand = (sel: string) => page.locator(sel).evaluate((el) => getComputedStyle(el).outlineStyle);
  await page.goto('/contact?onderwerp=warmtepompen');
  expect(await rand('input[name="onderwerp"][value="warmtepompen"] + .vak')).toBe('solid');
  expect(await rand('input[name="onderwerp"][value="onderhoud"] + .vak')).toBe('none');
  await page.goto('/');
  expect(await rand('[data-zet="koel"]')).toBe('solid');
  expect(await rand('[data-zet="warm"]')).toBe('none');
  await page.goto('/onderhoud');
  expect(await rand('[data-klacht][aria-checked="true"]')).toBe('solid');
  await ctx.close();
});

// Toegankelijkheid in de toestanden die pas na een handeling bestaan. Hier telt ook 'moderate' mee.
async function axe(page: import('@playwright/test').Page, wat: string) {
  await page.waitForTimeout(150);
  const uitslag = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  const fouten = uitslag.violations.filter((v) => v.impact !== 'minor').map((v) => `${v.id}: ${v.nodes[0]?.target}`);
  expect(fouten, wat).toEqual([]);
}

// Met 'minder beweging': het gaat om de eindtoestand, niet om een kleur halverwege een overgang.
test.describe('toegankelijkheid na interactie', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

test('foutmeldingen, geopende vraag, zoekresultaat, andere keuzes', async ({ page }) => {
  await page.goto('/contact');
  await page.locator('#postcode').fill('12');
  await page.getByRole('button', { name: 'Verstuur aanvraag' }).click();
  await expect(page.locator('#naam-fout')).not.toBeEmpty();
  await axe(page, 'formulier met foutmeldingen');

  await page.goto('/veelgestelde-vragen');
  await page.locator('details summary').first().click();
  await axe(page, 'geopende vraag');
  await page.locator('[data-zoekveld]').fill('subsidie');
  await axe(page, 'zoekresultaat');

  await page.goto('/');
  await page.getByRole('radio', { name: /Verwarmen/ }).first().click();
  await axe(page, 'homepage op verwarmen');

  await page.goto('/onderhoud');
  await page.getByRole('radio', { name: /druppelt water/ }).click();
  await axe(page, 'storingswijzer met andere klacht');

  await page.goto('/warmtepompen');
  await page.locator('[data-sys="electric"]').click();
  await page.locator('input[name="isolatie"][value="goed"]').check({ force: true });
  await axe(page, 'warmtepompen met andere keuzes');
});

test('open mobiel menu', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'alleen mobiel');
  await page.goto('/airconditioning');
  await page.getByRole('button', { name: 'Menu openen' }).click();
  await expect(page.locator('#hoofdmenu a').first()).toBeVisible();
  await page.waitForTimeout(500);
  await axe(page, 'open menu');
});
});
