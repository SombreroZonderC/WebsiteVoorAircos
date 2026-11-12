// Keuzeknoppen als radiogroep (role="radio" binnen role="radiogroup"), volgens het WAI-ARIA-patroon:
// één knop in de tabvolgorde, pijltjes wisselen (rondlopend) en kiezen meteen, Home/End naar begin/eind.
// Gebruikt door de koelen/verwarmen-keuze, de huis-doorsnede, de opstelling-kiezer en de storingswijzer.

interface Opties {
  /** Na elke keuze, ook de eerste (beginstand uit de HTML) */
  bijKeuze: (knop: HTMLButtonElement, index: number) => void;
  /** Alleen na een klik of tik, niet bij toetsenbord */
  bijKlik?: (knop: HTMLButtonElement, index: number) => void;
}

export function radiogroep(knoppen: HTMLButtonElement[], { bijKeuze, bijKlik }: Opties) {
  if (knoppen.length === 0) return;

  const kies = (index: number, focus = false) => {
    knoppen.forEach((knop, i) => {
      const aan = i === index;
      knop.setAttribute('aria-checked', String(aan));
      knop.tabIndex = aan ? 0 : -1;
    });
    if (focus) knoppen[index].focus();
    bijKeuze(knoppen[index], index);
  };

  knoppen.forEach((knop, i) => {
    knop.addEventListener('click', () => {
      kies(i);
      bijKlik?.(knop, i);
    });
    knop.addEventListener('keydown', (e) => {
      const n = knoppen.length;
      const doel =
        e.key === 'ArrowRight' || e.key === 'ArrowDown' ? (i + 1) % n
        : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? (i - 1 + n) % n
        : e.key === 'Home' ? 0
        : e.key === 'End' ? n - 1
        : null;
      if (doel === null) return;
      e.preventDefault();
      kies(doel, true);
    });
  });

  kies(Math.max(0, knoppen.findIndex((k) => k.getAttribute('aria-checked') === 'true')));
}
