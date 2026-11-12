import { test, expect } from '@playwright/test';

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

test('diepte-effect staat uit bij "minder beweging"', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ baseURL, reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveClass(/diepte/);
  await ctx.close();
});

test('onderhoud: storingswijzer wisselt klacht en stuurt die door naar contact', async ({ page }) => {
  await page.goto('/onderhoud');
  const knop = page.getByRole('radio', { name: /druppelt water/ });
  await knop.click();
  await expect(knop).toHaveAttribute('aria-checked', 'true');
  const antwoord = page.locator('#klacht-lekt-water');
  await expect(antwoord).toBeVisible();
  await expect(page.locator('#klacht-koelt-niet')).toBeHidden();
  await knop.press('ArrowDown');
  await expect(page.locator('#klacht-geluid')).toBeVisible();
  await page.goto('/onderhoud');
  await page.getByRole('radio', { name: /druppelt water/ }).click();
  await antwoord.getByRole('link', { name: /Stuur deze klacht door/ }).click();
  await expect(page).toHaveURL(/klacht=lekt-water/);
  await expect(page.locator('#bericht')).toHaveValue(/druppelt water/);
});

test('warmtepomp: uitkomst van de check gaat mee naar het contactformulier', async ({ page }) => {
  await page.goto('/warmtepompen');
  const check = page.locator('[data-check]');
  await check.locator('input[name="isolatie"][value="goed"]').check({ force: true });
  await check.locator('input[name="afgifte"][value="vloer"]').check({ force: true });
  await expect(page.locator('[data-check-cta]')).toHaveAttribute('href', /advies=electric/);
  await page.locator('[data-check-cta]').click();
  await expect(page.locator('#bericht')).toHaveValue(/Uit de geschiktheidscheck/);
});

test('vragen: een link met zoekvraag of anker opent meteen het juiste antwoord', async ({ page }) => {
  await page.goto('/veelgestelde-vragen?q=subsidie');
  await expect(page.locator('[data-zoekveld]')).toHaveValue('subsidie');
  await expect(page.locator('#vraag-warmtepomp-subsidie')).toHaveAttribute('open', '');
  await expect(page.getByRole('status')).toContainText('gevonden voor “subsidie”');
  await page.locator('[data-zoekveld]').fill('');
  await expect(page).not.toHaveURL(/q=/);

  await page.goto('/veelgestelde-vragen#vraag-airco-geluid');
  const vraag = page.locator('#vraag-airco-geluid');
  await expect(vraag).toHaveAttribute('open', '');
  await expect(vraag).toBeInViewport();
  // Een vraag openen zet het anker in de adresbalk, zodat de link te delen is
  await page.locator('#vraag-werkgebied summary').click();
  await expect(page).toHaveURL(/#vraag-werkgebied$/);
});
