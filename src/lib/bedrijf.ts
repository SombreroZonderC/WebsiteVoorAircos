import { z } from 'astro/zod';
import bedrijfJson from '../content/instellingen/bedrijf.json';
import homeJson from '../content/instellingen/home.json';
import { kaart, seoOmschrijving, seoTitel } from './schemas';

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
  googleScore: z.object({ score: z.string(), aantal: z.number() }).nullable(),
});

const ruimte = z.object({ titel: z.string(), tekst: z.string(), prijsVanaf: z.string().nullable() });
const keuzeKant = z.object({
  label: z.string(),
  titel: z.string(),
  titelAccent: z.string(),
  lead: z.string(),
  cta: z.string(),
  dienst: z.string(),
  ruimtes: z.array(ruimte),
});
const zoKant = z.object({ titel: z.string(), punten: z.array(z.string()), link: z.string() });

const homeSchema = z.object({
  seoTitel,
  seoOmschrijving,
  hero: z.object({
    titelKoud: z.string(),
    titelWarm: z.string(),
    regelZomer: z.string(),
    regelWinter: z.string(),
    belofte: z.string(),
  }),
  keuze: z.object({ vraag: z.string(), koel: keuzeKant, warm: keuzeKant }),
  zoWerktHet: z.object({ koel: zoKant, warm: zoKant }),
  resultaat: z.object({ koel: kaart, warm: kaart }),
  werkwijze: z.array(kaart),
  sjoerd: kaart,
  over: z.object({ titel: z.string(), tekst: z.string(), punten: z.array(z.string()) }),
  cta: z.object({ titel: z.string(), tekst: z.string() }),
});

export const bedrijf = bedrijfSchema.parse(bedrijfJson);
export const home = homeSchema.parse(homeJson);

export const telLink = `tel:${bedrijf.telefoon.internationaal}`;
export const mailLink = `mailto:${bedrijf.email}`;
export const whatsappLink = `https://wa.me/${bedrijf.telefoon.internationaal.replace('+', '')}`;

export const bedrijfId = `${bedrijf.url}/#bedrijf`;
