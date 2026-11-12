// Tekeningen in een schuifvak (.tekening-schuif, zie global.css). Past een tekening niet in het scherm, dan
// krijgt het vak een aanwijzing (klasse 'schuifbaar') en wordt het bedienbaar met het toetsenbord. Past hij
// wel, dan blijft het vak onzichtbaar voor toetsenbord en schermlezer.
export function startTekeningen() {
  const vakken = [...document.querySelectorAll<HTMLElement>('.tekening-schuif')];
  if (vakken.length === 0) return;
  const beoordeel = () => {
    for (const vak of vakken) {
      const schuifbaar = vak.scrollWidth > vak.clientWidth + 1;
      vak.classList.toggle('schuifbaar', schuifbaar);
      if (schuifbaar) {
        vak.tabIndex = 0;
        vak.setAttribute('role', 'group');
        vak.setAttribute('aria-label', 'Tekening, schuif opzij voor het hele beeld');
      } else {
        vak.removeAttribute('tabindex');
        vak.removeAttribute('role');
        vak.removeAttribute('aria-label');
      }
    }
  };
  new ResizeObserver(beoordeel).observe(document.documentElement);
  beoordeel();
}
