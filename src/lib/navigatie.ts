import type { IcoonNaam } from '../components/Icon.astro';

// Eén bron voor alle menu's: header (desktop en mobiel), footer, 404 en het kruimelpad.
export interface NavItem {
  href: string;
  label: string;
  icoon: IcoonNaam;
  /** Dienst met eigen kleur in het menu */
  accent?: 'koud' | 'warm';
  /** Past niet in de desktopbalk: alleen in het mobiele menu, de footer en de 404 */
  alleenUitgebreid?: boolean;
}

export const home: NavItem = { href: '/', label: 'Home', icoon: 'home', alleenUitgebreid: true };

export const nav: NavItem[] = [
  { href: '/airconditioning', label: 'Airconditioning', icoon: 'snow', accent: 'koud' },
  { href: '/warmtepompen', label: 'Warmtepompen', icoon: 'flame', accent: 'warm' },
  { href: '/onderhoud', label: 'Onderhoud', icoon: 'wrench' },
  { href: '/over-sjoerd', label: 'Over Sjoerd', icoon: 'user' },
  { href: '/werkgebied', label: 'Werkgebied', icoon: 'pin' },
  { href: '/veelgestelde-vragen', label: 'Vragen', icoon: 'vraag' },
  { href: '/contact', label: 'Contact', icoon: 'chat' },
  { href: '/kennisbank', label: 'Kennisbank', icoon: 'boek', alleenUitgebreid: true },
];

/** Alle bestemmingen, Home voorop (mobiel menu, footer). */
export const volledigMenu: NavItem[] = [home, ...nav];

/** Pad zoals het in links staat: zonder .html, index of afsluitende slash ('' voor de homepage). */
export const paginaPad = (pathname: string) => pathname.replace(/\.html$/, '').replace(/\/(index)?$/, '');

/** Hoort `pad` bij dit menu-item (de pagina zelf of een onderliggende pagina)? */
export const isActief = (item: NavItem, pad: string) =>
  item.href === '/' ? pad === '' : pad === item.href || pad.startsWith(`${item.href}/`);
