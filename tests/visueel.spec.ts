import { test, expect } from '@playwright/test';
import { vindbaar } from './paginas';

// Visuele regressie: elke vindbare pagina als volledig beeld vergeleken met een vastgelegd beeld
// (tests/visueel.spec.ts-snapshots/). Vangt wat de andere tests niet zien: verschoven blokken, verdwenen
// stijlen, kapotte tekeningen. Na een bewuste ontwerpwijziging: `npm run test:beelden`, de nieuwe beelden
// nakijken en committen.
const opties = {
  animations: 'disabled',
  // Eén beeldpunt per CSS-pixel: kleinere bestanden, zelfde zeggingskracht
  scale: 'css',
  // Vrijwel exact: hooguit een paar honderd beeldpunten (randjes van letters). Een verdwenen knop of
  // verschoven regel is duizenden beeldpunten en valt er ruim buiten.
  maxDiffPixels: 400,
} as const;

test.describe('volledige pagina', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  for (const pad of vindbaar) {
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
        // Scroll-uitleg (stappen naast een tekening): eindigen op de eerste stap, anders hangt de
        // gemarkeerde stap af van het toeval waarmee de browser de tussenstanden meldt
        for (const stap of document.querySelectorAll('[data-scroll-uitleg] [data-stap="0"]')) {
          stap.scrollIntoView({ block: 'center' });
          await new Promise((klaar) => setTimeout(klaar, 200));
        }
        scrollTo(0, 0);
      });
      await page.waitForTimeout(400);
      await expect(page).toHaveScreenshot({ fullPage: true, ...opties });
    });
  }
});

// Het diepte-effect (donker vlak blijft staan, licht schuift eroverheen) bestaat alleen mét beweging en op
// een breed scherm. Hier het venster op drie scrollstanden van de homepage.
test.describe('diepte-effect', () => {
  for (const stand of [300, 700, 1700]) {
    test(`beeld: homepage met diepte, gescrold tot ${stand}`, async ({ page, isMobile }) => {
      test.skip(isMobile, 'alleen op een breed scherm');
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('html')).toHaveClass(/diepte/);
      await page.addStyleTag({ content: '[data-reveal]{opacity:1!important;transform:none!important} html{scroll-behavior:auto!important}' });
      await page.evaluate((y) => scrollTo(0, y), stand);
      // Het effect rekent per beeldje: even wachten tot de stand verwerkt is
      await page.evaluate(() => new Promise((klaar) => requestAnimationFrame(() => requestAnimationFrame(klaar))));
      await page.waitForTimeout(400);
      await expect(page).toHaveScreenshot(opties);
    });
  }
});
