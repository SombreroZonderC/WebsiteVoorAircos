// Contactformulier: voorinvullen vanaf de dienstpagina's, eigen foutmeldingen per veld en één keer versturen.
// Zonder JavaScript werkt het formulier gewoon, met de standaardcontrole van de browser.

/** Meldingen per veld; de sleutel is het name-attribuut. Kort houden: een melding moet op één regel passen,
 * ook op een smalle telefoon, want de plek ervoor heeft een vaste hoogte (zie ContactFormulier.astro). */
const meldingen: Record<string, { leeg?: string; ongeldig?: string }> = {
  naam: { leeg: 'Vul je naam in.', ongeldig: 'Vul je naam in.' },
  email: { leeg: 'Vul je e-mailadres in.', ongeldig: 'Dit e-mailadres klopt niet.' },
  telefoon: { ongeldig: 'Dit telefoonnummer klopt niet.' },
  postcode: { ongeldig: 'Een postcode ziet eruit als 1234 AB.' },
  bericht: { leeg: 'Vertel kort waarmee ik je kan helpen.' },
};

type Veld = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** Tekst voor het bericht op basis van de link waarmee de bezoeker binnenkwam (null = niets voorinvullen). */
export function voorinvulling(params: URLSearchParams, klachten: Record<string, string>, adviezen: Record<string, string>) {
  const ruimtes = params.get('ruimtes');
  if (ruimtes && /^[1-4]\+?$/.test(ruimtes)) {
    return `Ik wil graag advies over een airco voor ${ruimtes} ${ruimtes === '1' ? 'ruimte' : 'ruimtes'}.`;
  }
  const klacht = params.get('klacht');
  if (klacht && Object.hasOwn(klachten, klacht)) return `Storing: ${klachten[klacht].toLowerCase()}. `;
  const advies = params.get('advies');
  if (advies && Object.hasOwn(adviezen, advies)) {
    return `Uit de geschiktheidscheck: ${adviezen[advies]} Ik hoor graag of dat klopt voor mijn huis.`;
  }
  return null;
}

const CONCEPT = 'contact-concept';
function leesConcept(): Record<string, string> {
  try {
    const concept: unknown = JSON.parse(sessionStorage.getItem(CONCEPT) ?? '{}');
    return concept && typeof concept === 'object' ? (concept as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function foutVan(veld: Veld) {
  const m = meldingen[veld.name] ?? {};
  // Alleen spaties telt als leeg (een textarea kent geen pattern, dus dit moet hier)
  if (veld.required && veld.value.trim() === '') return m.leeg ?? 'Dit veld is verplicht.';
  const v = veld.validity;
  if (v.valid) return '';
  if (v.valueMissing) return m.leeg ?? 'Dit veld is verplicht.';
  if (v.tooLong) return 'Deze tekst is te lang.';
  return m.ongeldig ?? veld.validationMessage;
}

export function startContactformulier(form: HTMLFormElement) {
  const velden = [...form.querySelectorAll<Veld>('input[id], textarea[id], select[id]')];
  const bericht = form.querySelector<HTMLTextAreaElement>('[name="bericht"]')!;
  const knop = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
  const params = new URLSearchParams(location.search);

  // Voorinvullen. Alleen waarden die het formulier zelf kent; vrije tekst uit de link wordt nooit overgenomen.
  const onderwerp = params.get('onderwerp');
  form.querySelectorAll<HTMLInputElement>('input[name="onderwerp"]').forEach((radio) => {
    if (radio.value === onderwerp) radio.checked = true;
  });
  const tekst = voorinvulling(params, JSON.parse(form.dataset.klachten ?? '{}'), JSON.parse(form.dataset.adviezen ?? '{}'));
  if (tekst && !bericht.value) bericht.value = tekst;

  // Concept bewaren: wie per ongeluk wegklikt of ververst, is zijn tekst niet kwijt. Blijft in dit tabblad
  // (sessionStorage), gaat niet naar een server en wordt gewist bij versturen.
  const bewaard = leesConcept();
  const onderwerpen = [...form.querySelectorAll<HTMLInputElement>('input[name="onderwerp"]')];
  velden.forEach((veld) => {
    if (typeof bewaard[veld.name] === 'string' && !veld.value) veld.value = bewaard[veld.name].slice(0, 4000);
  });
  // Een onderwerp uit de link gaat voor op een bewaard onderwerp
  if (!onderwerpen.some((r) => r.checked)) onderwerpen.forEach((r) => (r.checked = r.value === bewaard.onderwerp));
  form.addEventListener('input', () => {
    const concept = Object.fromEntries(velden.filter((v) => v.value).map((v) => [v.name, v.value]));
    const gekozen = onderwerpen.find((r) => r.checked);
    if (gekozen) concept.onderwerp = gekozen.value;
    try {
      sessionStorage.setItem(CONCEPT, JSON.stringify(concept));
    } catch {
      // Opslag vol of geblokkeerd: dan zonder concept verder
    }
  });

  // Eigen foutmeldingen in plaats van de ballonnetjes van de browser
  form.noValidate = true;
  const toon = (veld: Veld) => {
    const fout = foutVan(veld);
    const plek = form.querySelector<HTMLElement>(`#${veld.id}-fout`);
    veld.setAttribute('aria-invalid', String(Boolean(fout)));
    // De plek voor de melding is er altijd (vaste hoogte), zodat er niets verspringt
    if (plek) plek.textContent = fout;
    return !fout;
  };
  velden.forEach((veld) => {
    veld.addEventListener('blur', () => {
      // Spaties voor en na weghalen, zodat er geen lege of scheve waarden worden verstuurd
      if (!(veld instanceof HTMLSelectElement) && veld.value !== veld.value.trim()) veld.value = veld.value.trim();
      toon(veld);
    });
    // Tijdens het typen alleen een bestaande melding laten verdwijnen, niet midden in een woord gaan klagen
    veld.addEventListener('input', () => veld.getAttribute('aria-invalid') === 'true' && toon(veld));
  });

  const status = form.querySelector<HTMLElement>('[data-status]')!;
  // Lokaal en in de demo is er geen formulierverwerking: verzending nabootsen.
  const nabootsen = ['localhost', '127.0.0.1'].includes(location.hostname);
  form.addEventListener('submit', (e) => {
    const fout = velden.filter((veld) => !toon(veld));
    if (fout.length > 0) {
      e.preventDefault();
      status.textContent = fout.length === 1 ? 'Er is nog 1 veld niet goed ingevuld.' : `Er zijn nog ${fout.length} velden niet goed ingevuld.`;
      fout[0].focus();
      return;
    }
    if (knop.disabled) return e.preventDefault();
    try {
      sessionStorage.removeItem(CONCEPT);
    } catch {
      // geen opslag beschikbaar
    }
    // Niet dubbel versturen. Pas na dit event uitschakelen, anders gaat het formulier niet meer weg.
    setTimeout(() => {
      knop.disabled = true;
      status.textContent = 'Bezig met versturen…';
    });
    if (nabootsen) {
      e.preventDefault();
      location.href = form.action;
    }
  });
  // Terug vanaf de bedankpagina (bfcache): knop weer bruikbaar
  addEventListener('pageshow', () => {
    knop.disabled = false;
    status.textContent = '';
  });
}
