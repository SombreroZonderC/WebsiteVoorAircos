import { test, expect } from '@playwright/test';

test('formulier: lege verzending toont meldingen per veld en zet de focus op het eerste foute veld', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Verstuur aanvraag' }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.locator('#naam-fout')).toHaveText('Vul je naam in.');
  await expect(page.locator('#email-fout')).toHaveText('Vul je e-mailadres in.');
  await expect(page.locator('#bericht-fout')).toBeVisible();
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
  await expect(page.locator('#email-fout')).toBeHidden();
  await expect(page.locator('#postcode-fout')).toBeHidden();
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
  await page.reload();
  await expect(page.locator('#naam')).toHaveValue('Test Persoon');
  await expect(page.locator('#bericht')).toHaveValue('Halverwege mijn bericht');
  await page.locator('#email').fill('test@voorbeeld.nl');
  await page.getByRole('button', { name: 'Verstuur aanvraag' }).click();
  await expect(page).toHaveURL(/\/bedankt$/);
  await page.goto('/contact');
  await expect(page.locator('#bericht')).toHaveValue('');
});
