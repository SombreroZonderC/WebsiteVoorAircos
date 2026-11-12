import { bedrijf, bedrijfId } from './bedrijf';
import { nav } from './navigatie';

/**
 * JSON-LD veilig in een <script>-blok: '<', '>' en '&' als unicode-escape, zodat tekst uit de inhoud
 * (straks ook uit een CMS) het script-element nooit kan afsluiten. Het blijft geldige JSON.
 */
export const jsonLd = (data: object) =>
  JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);

export const absoluut = (pad: string) => new URL(pad || '/', bedrijf.url).href;

// Deelafbeeldingen (scripts/og.mjs). Via glob, zodat het niet afhangt van de map waarin de build draait.
const ogBestanden = new Set(
  Object.keys(import.meta.glob('/public/images/og/**/*.jpg')).map((p) => p.replace('/public', '')),
);
export const ogAfbeelding = (pad: string) => {
  const eigen = `/images/og/${pad.replace(/^\//, '') || 'home'}.jpg`;
  return absoluut(ogBestanden.has(eigen) ? eigen : '/images/og.jpg');
};

/** Merknaam alleen achter korte titels, zodat Google niets afkapt (richtlijn ~60 tekens). */
export const volledigeTitel = (titel: string) =>
  titel.includes(bedrijf.naam) || titel.length > 42 ? titel : `${titel} | ${bedrijf.naam}`;

export interface Kruimel {
  name: string;
  item: string;
}

/** Home → [menu-item waar de pagina onder valt] → pagina. Bron voor het zichtbare pad én BreadcrumbList. */
export function kruimelNiveaus(pad: string, paginaNaam: string): Kruimel[] {
  const ouder = nav.find((n) => pad.startsWith(`${n.href}/`));
  return [
    { name: 'Home', item: absoluut('/') },
    ...(ouder ? [{ name: ouder.label, item: absoluut(ouder.href) }] : []),
    { name: nav.find((n) => n.href === pad)?.label ?? paginaNaam, item: absoluut(pad) },
  ];
}

export const kruimelSchema = (niveaus: Kruimel[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: niveaus.map((n, i) => ({ '@type': 'ListItem', position: i + 1, ...n })),
});

/** Het bedrijf zelf; staat op elke pagina en is het ankerpunt (@id) voor Service en Article. */
export const bedrijfSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'HVACBusiness',
  '@id': bedrijfId,
  name: bedrijf.naam,
  description: `${bedrijf.tagline} in ${bedrijf.adres.plaats} en omgeving. Specialist in ${bedrijf.merk}.`,
  url: bedrijf.url,
  telephone: bedrijf.telefoon.internationaal,
  email: bedrijf.email,
  image: absoluut('/images/og.jpg'),
  logo: absoluut('/images/logo-origineel.svg'),
  founder: { '@type': 'Person', name: bedrijf.eigenaar },
  brand: { '@type': 'Brand', name: bedrijf.merk },
  address: {
    '@type': 'PostalAddress',
    streetAddress: bedrijf.adres.straat,
    postalCode: bedrijf.adres.postcode,
    addressLocality: bedrijf.adres.plaats,
    addressRegion: bedrijf.adres.provincie,
    addressCountry: bedrijf.adres.land,
  },
  areaServed:
    bedrijf.werkgebied.length > 0
      ? bedrijf.werkgebied.map((name) => ({ '@type': 'City', name }))
      : { '@type': 'City', name: bedrijf.adres.plaats },
  ...(bedrijf.googleReviewsUrl && { sameAs: [bedrijf.googleReviewsUrl] }),
});
