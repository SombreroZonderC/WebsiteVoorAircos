import { test, expect } from '@playwright/test';
import { paginas } from './paginas';

// Definition of done: alle inhoud werkt zonder JavaScript.
test.use({ javaScriptEnabled: false });

test('zonder JavaScript: elke pagina toont kop en inhoud', async ({ page }) => {
  for (const pad of paginas) {
    await page.goto(pad);
    await expect(page.locator('h1'), pad).toBeVisible();
    // Niets blijft onzichtbaar wachten op een script
    const verborgen = await page.locator('[data-reveal]').evaluateAll((els) => els.filter((el) => getComputedStyle(el).opacity === '0').length);
    expect(verborgen, pad).toBe(0);
  }
});

test('zonder JavaScript: storingswijzer toont alle klachten, veelgestelde vragen zijn te openen', async ({ page }) => {
  await page.goto('/onderhoud');
  const panelen = page.locator('[data-wijzer] [data-paneel]');
  expect(await panelen.count()).toBeGreaterThan(1);
  for (const paneel of await panelen.all()) await expect(paneel).toBeVisible();
  await page.goto('/veelgestelde-vragen');
  const vraag = page.locator('details').first();
  await vraag.locator('summary').click();
  await expect(vraag.locator('.antwoord')).toBeVisible();
});

test('zonder JavaScript: het formulier controleert zelf en verstuurt naar de bedankpagina', async ({ page }) => {
  await page.goto('/contact');
  const form = page.locator('form[name="offerte"]');
  await expect(form).toHaveAttribute('action', '/bedankt');
  await expect(form).toHaveAttribute('method', 'POST');
  await expect(form).not.toHaveAttribute('novalidate', /.*/);
  await expect(page.locator('#naam')).toHaveAttribute('required', '');
  // De browser houdt zelf een naam van alleen spaties en een onzin-telefoonnummer tegen
  await page.locator('#naam').fill('   ');
  await page.locator('#telefoon').fill('abc');
  expect(await page.locator('#naam').evaluate((el: HTMLInputElement) => el.validity.patternMismatch)).toBe(true);
  expect(await page.locator('#telefoon').evaluate((el: HTMLInputElement) => el.validity.patternMismatch)).toBe(true);
});
