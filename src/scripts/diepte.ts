// Diepte-effect: donkere vlakken (data-diepte-vlak) liggen "achter", het volgende lichte vlak schuift
// er recht overheen. Alleen als de bezoeker beweging toestaat, het scherm breder is dan 860px en elk
// donker vlak in het scherm past. Beoordeeld bij laden en bij elke formaatwijziging (ook als inhoud
// wisselt); per scrollframe wordt alleen --p bijgewerkt.

export function startDiepte() {
  const vlakken = [...document.querySelectorAll<HTMLElement>('[data-diepte-vlak]')];
  if (vlakken.length === 0) return;

  const html = document.documentElement;
  const beweging = matchMedia('(prefers-reduced-motion: no-preference)');
  const inhoud = (v: HTMLElement) => v.querySelector<HTMLElement>('.vlak-inhoud')!;
  let aan = false;
  let gepland = false;

  const teken = () => {
    gepland = false;
    vlakken.forEach((v) => {
      const volgende = v.nextElementSibling as HTMLElement | null;
      if (!volgende) return;
      const p = Math.min(1, Math.max(0, 1 - volgende.getBoundingClientRect().top / innerHeight));
      v.style.setProperty('--p', p.toFixed(3));
      // Volledig afgedekte inhoud uit de tabvolgorde halen
      inhoud(v).inert = p > 0.98;
    });
  };
  const plan = () => {
    if (aan && !gepland) {
      gepland = true;
      requestAnimationFrame(teken);
    }
  };
  const beoordeel = () => {
    const mag = beweging.matches && innerWidth > 860 && vlakken.every((v) => inhoud(v).offsetHeight <= innerHeight);
    if (mag !== aan) {
      aan = mag;
      html.classList.toggle('diepte', mag);
      if (!mag)
        vlakken.forEach((v) => {
          v.style.removeProperty('--p');
          inhoud(v).inert = false;
        });
    }
    plan();
  };

  addEventListener('scroll', plan, { passive: true });
  beweging.addEventListener('change', beoordeel);
  new ResizeObserver(beoordeel).observe(html);
  // De ResizeObserver ziet alleen de pagina; een hoger of lager venster verandert die niet
  addEventListener('resize', beoordeel);
  beoordeel();
}
