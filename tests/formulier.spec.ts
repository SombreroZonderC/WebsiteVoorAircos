import { test, expect } from '@playwright/test';

test('formulier: lege verzending toont meldingen per veld en zet de focus op het eerste foute veld', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Verstuur aanvraag' }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator('#naam-fout')).toHaveText('Vul je naam in.');
  await expect(page.locator('#email-fout')).toHaveText('Vul je e-mailadres in.');
  await expect(page.locator('#bericht-fout')).not.toBeEmpty();
  await expect(page.locator('#naam')).toBeFocused();
  await expect(page.locator('#naam')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('status')).toHaveText('Er zijn nog 3 velden niet goed ingevuld.');
});

test('formulier: melding verdwijnt zodra het veld klopt; postcode en e-mail worden gecontroleerd', async ({ page }) => {
  await page.goto('/contact');
  await page.locator('#email').fill('geen-adres');
  await page.locator('#postcode').fill('12');
  await page.locator('#plaats').focus();
  await expect(page.locator('#email-fout')).toContainText('klopt niet');
  await expect(page.locator('#postcode-fout')).toHaveText('Een postcode ziet eruit als 1234 AB.');
  await page.locator('#email').fill('naam@voorbeeld.nl');
  await page.locator('#postcode').fill('8111 RR');
  await expect(page.locator('#email-fout')).toBeEmpty();
  await expect(page.locator('#postcode-fout')).toBeEmpty();
  await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'false');
});

test('formulier: geldige aanvraag gaat naar de bedankpagina', async ({ page }) => {
  await page.goto('/contact?onderwerp=onderhoud');
  await expect(page.locator('input[name="onderwerp"][value="onderhoud"]')).toBeChecked();
  await page.locator('#naam').fill('Test Persoon');
  await page.locator('#email').fill('test@voorbeeld.nl');
  await page.locator('#bericht').fill('Dit is een testbericht.');
  await page.getByRole('button', { name: 'Verstuur aanvraag' }).click();
  await expect(page).toHaveURL(/\/bedankt$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Je bericht is binnen');
});

test('formulier: velden hebben een maximale lengte en een verborgen lokveld voor spam', async ({ page }) => {
  await page.goto('/contact');
  for (const [id, max] of [['naam', '100'], ['email', '254'], ['telefoon', '20'], ['bericht', '4000']]) {
    await expect(page.locator(`#${id}`)).toHaveAttribute('maxlength', max);
  }
  const lokveld = page.locator('input[name="bot-field"]');
  await expect(lokveld).toHaveAttribute('tabindex', '-1');
  await expect(page.locator('form[name="offerte"]')).toHaveAttribute('netlify-honeypot', 'bot-field');
});

test('formulier: een concept blijft bewaard na verversen en is weg na versturen', async ({ page }) => {
  await page.goto('/contact');
  await page.locator('#naam').fill('Test Persoon');
  await page.locator('#bericht').fill('Halverwege mijn bericht');
  await page.locator('input[name="onderwerp"][value="warmtepompen"]').check({ force: true });
  await page.reload();
  await expect(page.locator('input[name="onderwerp"][value="warmtepompen"]')).toBeChecked();
  await expect(page.locator('#naam')).toHaveValue('Test Persoon');
  await expect(page.locator('#bericht')).toHaveValue('Halverwege mijn bericht');
  await page.locator('#email').fill('test@voorbeeld.nl');
  await page.getByRole('button', { name: 'Verstuur aanvraag' }).click();
  await expect(page).toHaveURL(/\/bedankt$/);
  await page.goto('/contact');
  await expect(page.locator('#bericht')).toHaveValue('');
});

test('formulier: een ongeldig telefoonnummer wordt afgewezen, een gewoon nummer niet', async ({ page }) => {
  await page.goto('/contact');
  const telefoon = page.locator('#telefoon');
  for (const fout of ['abc', '12', '<script>']) {
    await telefoon.fill(fout);
    await telefoon.blur();
    await expect(page.locator('#telefoon-fout'), fout).toContainText('klopt niet');
  }
  for (const goed of ['06 12345678', '+31 6 12345678', '(0572) 12-34-56', '']) {
    await telefoon.fill(goed);
    await telefoon.blur();
    await expect(page.locator('#telefoon-fout'), goed).toBeEmpty();
  }
});

test('formulier: alleen spaties telt als leeg', async ({ page }) => {
  await page.goto('/contact');
  await page.locator('#naam').fill('   ');
  await page.locator('#email').fill('test@voorbeeld.nl');
  await page.locator('#bericht').fill('  \n  ');
  await page.getByRole('button', { name: 'Verstuur aanvraag' }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator('#naam-fout')).toHaveText('Vul je naam in.');
  await expect(page.locator('#bericht-fout')).not.toBeEmpty();
});

test('formulier: elk pattern is een geldige expressie voor de browser en doet wat het moet', async ({ page }) => {
  // Browsers compileren pattern met de v-vlag; een ongeldig patroon wordt stil genegeerd en controleert dan niets.
  await page.goto('/contact');
  const patronen = await page.locator('[pattern]').evaluateAll((els) =>
    els.map((el) => {
      const bron = el.getAttribute('pattern')!;
      try {
        new RegExp(`^(?:${bron})$`, 'v');
        return { naam: el.getAttribute('name'), fout: null };
      } catch (e) {
        return { naam: el.getAttribute('name'), fout: String(e) };
      }
    }),
  );
  expect(patronen.map((p) => p.naam).sort()).toEqual(['naam', 'postcode', 'telefoon']);
  expect(patronen.filter((p) => p.fout)).toEqual([]);
});

test('formulier: een melding die verschijnt verschuift niets, dus de eerste klik op versturen komt aan', async ({ page }) => {
  // Regressie: de melding bij het verlaten van een leeg veld duwde de knop omlaag, tussen indrukken en loslaten
  // van de muis. De klik ging dan verloren en er gebeurde niets.
  await page.goto('/contact');
  await page.locator('#naam').fill('Test Persoon');
  await page.locator('#email').fill('test@voorbeeld.nl');
  await page.locator('#bericht').focus();
  const knop = page.getByRole('button', { name: 'Verstuur aanvraag' });
  await knop.scrollIntoViewIfNeeded();
  const voor = (await knop.boundingBox())!;
  // Echte muis: indrukken haalt de focus uit het veld (melding verschijnt), loslaten moet nog op de knop zijn
  await page.mouse.move(voor.x + voor.width / 2, voor.y + voor.height / 2);
  await page.mouse.down();
  await page.mouse.up();
  await expect(page.getByRole('status')).toHaveText('Er is nog 1 veld niet goed ingevuld.');
  await expect(page.locator('#bericht')).toBeFocused();
  expect(Math.abs((await knop.boundingBox())!.y - voor.y), 'knop staat nog op dezelfde plek').toBeLessThan(2);
});

test('formulier: meldingen verschuiven de velden eronder niet', async ({ page }) => {
  await page.goto('/contact');
  // Plek op de pagina (niet in het venster: focus kan het venster laten scrollen)
  const plek = () => page.evaluate(() => ['telefoon', 'woning', 'bericht'].map((id) => Math.round(document.getElementById(id)!.getBoundingClientRect().top + scrollY)));
  const voor = await plek();
  await page.locator('#naam').focus();
  await page.locator('#email').fill('fout');
  await page.locator('#postcode').fill('1');
  await page.locator('#bericht').focus();
  await expect(page.locator('#naam-fout')).not.toBeEmpty();
  await expect(page.locator('#postcode-fout')).not.toBeEmpty();
  expect(await plek()).toEqual(voor);
});
