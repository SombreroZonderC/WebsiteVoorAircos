import { z } from 'astro/zod';
import bedrijfJson from '../content/instellingen/bedrijf.json';
import homeJson from '../content/instellingen/home.json';

const kaart = z.object({ titel: z.string(), tekst: z.string() });

const bedrijfSchema = z.object({
  naam: z.string(),
  tagline: z.string(),
  eigenaar: z.string(),
  url: z.url(),
  telefoon: z.object({ weergave: z.string(), internationaal: z.string() }),
  email: z.email(),
  whatsapp: z.boolean(),
  adres: z.object({
    straat: z.string(),
    postcode: z.string(),
    plaats: z.string(),
    gemeente: z.string(),
    provincie: z.string(),
    land: z.string(),
  }),
  jarenErvaring: z.string(),
  merk: z.string(),
  // null of leeg = nog niet bekend; wordt dan niet getoond
  kvk: z.string().nullable(),
  btw: z.string().nullable(),
  openingstijden: z.string().nullable(),
  certificeringen: z.array(z.string()),
  werkgebied: z.array(z.string()),
  googleReviewsUrl: z.url().nullable(),
});

const homeSchema = z.object({
  seoTitel: z.string(),
  seoOmschrijving: z.string().max(170),
  hero: z.object({ eyebrow: z.string(), titelKoud: z.string(), titelWarm: z.string(), lead: z.string() }),
  usps: z.array(kaart),
  werkwijze: z.array(kaart),
  over: z.object({ titel: z.string(), tekst: z.string(), punten: z.array(z.string()) }),
  cta: z.object({ titel: z.string(), tekst: z.string() }),
});

export const bedrijf = bedrijfSchema.parse(bedrijfJson);
export const home = homeSchema.parse(homeJson);

export const telLink = `tel:${bedrijf.telefoon.internationaal}`;
export const mailLink = `mailto:${bedrijf.email}`;
export const whatsappLink = `https://wa.me/${bedrijf.telefoon.internationaal.replace('+', '')}`;

export const nav = [
  { href: '/airconditioning', label: 'Airconditioning' },
  { href: '/warmtepompen', label: 'Warmtepompen' },
  { href: '/onderhoud', label: 'Onderhoud' },
  { href: '/over-sjoerd', label: 'Over Sjoerd' },
  { href: '/werkgebied', label: 'Werkgebied' },
  { href: '/veelgestelde-vragen', label: 'Vragen' },
];

export const bedrijfId = `${bedrijf.url}/#bedrijf`;
