import { test, expect } from '@playwright/test';

// Visuele regressie: volledige pagina's vergeleken met vastgelegde beelden (tests/visueel.spec.ts-snapshots/).
// Vangt wat de andere tests niet zien: verschoven blokken, verdwenen stijlen, kapotte tekeningen.
// Na een bewuste ontwerpwijziging: `npm run test:beelden` en de nieuwe beelden nakijken en committen.
const paginas = ['/', '/airconditioning', '/warmtepompen', '/onderhoud', '/contact', '/veelgestelde-vragen', '/kennisbank/r32-of-r290'];

test.use({ contextOptions: { reducedMotion: 'reduce' } });

for (const pad of paginas) {
  test(`beeld: ${pad}`, async ({ page }) => {
    // Vaste datum: de onderhoudskalender markeert het huidige seizoen
    await page.clock.setFixedTime(new Date('2026-07-01T12:00:00'));
    await page.goto(pad);
    await page.evaluate(() => document.fonts.ready);
    // Infaden bij scrollen uitschakelen voor een stabiel beeld
    await page.addStyleTag({ content: '[data-reveal]{opacity:1!important;transform:none!important}' });
    // Eén keer door de pagina scrollen, zodat alles wat op scrollen reageert (stappen, vinkjes) zijn eindstand heeft
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
        scrollTo(0, y);
        await new Promise((klaar) => requestAnimationFrame(klaar));
      }
      scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    await expect(page).toHaveScreenshot({
      fullPage: true,
      animations: 'disabled',
      // Ruimte voor kleine verschillen in letterweergave tussen machines; een verschoven blok valt er ruim buiten
      maxDiffPixelRatio: 0.005,
    });
  });
}
