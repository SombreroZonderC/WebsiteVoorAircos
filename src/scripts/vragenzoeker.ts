// Veelgestelde vragen: zoeken op woorddelen (met synoniemen), tellers per onderwerp, en deelbare links:
// /veelgestelde-vragen?q=subsidie zoekt meteen, /veelgestelde-vragen#vraag-… opent die ene vraag.

const synoniemen: Record<string, string[]> = {
  kosten: ['kost', 'prijs', 'offerte', 'betalen'],
  prijs: ['kost', 'prijs', 'offerte'],
  geluid: ['geluid', 'stil', 'herrie', 'lawaai'],
  lawaai: ['geluid', 'stil'],
  subsidie: ['subsidie', 'isde', 'rvo'],
  onderhoud: ['onderhoud', 'storing', 'service'],
  storing: ['storing', 'onderhoud'],
  verwarmen: ['verwarm', 'warmte', 'warmtepomp'],
  koelen: ['koel', 'airco'],
  regio: ['regio', 'werkgebied', 'plaats'],
};

/** Per zoekwoord de varianten waarvan er één in de tekst moet staan. */
export const zoektermen = (zoekvraag: string) =>
  zoekvraag
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((woord) => [woord.length > 5 ? woord.slice(0, -2) : woord, ...(synoniemen[woord] ?? [])]);

export const past = (tekst: string, termen: string[][]) => termen.every((opties) => opties.some((o) => tekst.includes(o)));

export function startVragenzoeker(veld: HTMLInputElement) {
  const items = [...document.querySelectorAll<HTMLDetailsElement>('[data-zoek]')];
  const groepen = [...document.querySelectorAll<HTMLElement>('[data-groep]')];
  const tellers = [...document.querySelectorAll<HTMLElement>('[data-teller]')];
  const geen = document.querySelector<HTMLElement>('[data-geen]')!;
  const uitkomst = document.querySelector<HTMLElement>('[data-uitkomst]')!;
  const aantal = (n: number) => `${n} ${n === 1 ? 'vraag' : 'vragen'}`;

  const zoek = () => {
    const q = veld.value.trim();
    const termen = zoektermen(q);
    items.forEach((d) => {
      const zichtbaar = !q || past(d.dataset.zoek!, termen);
      d.hidden = !zichtbaar;
      d.open = Boolean(q) && zichtbaar;
    });
    groepen.forEach((g) => (g.hidden = !g.querySelector('[data-zoek]:not([hidden])')));
    tellers.forEach((el) => {
      el.textContent = aantal(document.querySelectorAll(`#${el.dataset.teller} [data-zoek]:not([hidden])`).length);
    });
    const gevonden = items.filter((d) => !d.hidden).length;
    geen.hidden = gevonden > 0;
    // Voor schermlezers: het resultaat van de zoekopdracht
    uitkomst.textContent = q ? `${aantal(gevonden)} gevonden voor “${q}”.` : '';
    // Zoekvraag in de adresbalk, zodat de link te delen is (zonder de geschiedenis te vullen)
    const url = new URL(location.href);
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
  };
  veld.addEventListener('input', zoek);

  const beginvraag = new URLSearchParams(location.search).get('q');
  if (beginvraag) {
    veld.value = beginvraag.slice(0, 80);
    zoek();
  }

  // Link naar één vraag: openklappen. Een geopende vraag zet zijn anker in de adresbalk.
  const openAnker = () => {
    let doel: HTMLElement | null = null;
    try {
      doel = location.hash.length > 1 ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    } catch {
      // Verminkte link (ongeldige %-codering): dan gewoon niets openklappen
    }
    if (doel instanceof HTMLDetailsElement && !doel.hidden) {
      doel.open = true;
      doel.scrollIntoView({ block: 'start' });
    }
  };
  addEventListener('hashchange', openAnker);
  openAnker();
  items.forEach((d) =>
    d.addEventListener('toggle', () => {
      if (d.open && !veld.value) history.replaceState(null, '', `#${d.id}`);
    }),
  );
}
