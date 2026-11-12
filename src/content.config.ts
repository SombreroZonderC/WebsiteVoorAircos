import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { kaart, seoOmschrijving, seoTitel } from './lib/schemas';

// De mappen en velden hieronder zijn één-op-één over te nemen in een
// Keystatic-config (collections met format 'md' / 'yaml'), zodat er later
// een CMS bovenop kan zonder de inhoud te verplaatsen.

const diensten = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/diensten' }),
  schema: z.object({
    titel: z.string(),
    menuLabel: z.string(),
    seoTitel,
    seoOmschrijving,
    eyebrow: z.string(),
    intro: z.string(),
    volgorde: z.number(),
    icoon: z.enum(['snow', 'flame', 'wrench']),
    accent: z.enum(['koud', 'warm']),
    beeld: z.enum(['airco', 'warmtepomp', 'onderhoud']),
    voordelen: z.array(kaart),
    faqCategorie: z.enum(['airco', 'warmtepomp', 'onderhoud', 'algemeen']),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/faq' }),
  schema: z.object({
    vraag: z.string(),
    categorie: z.enum(['airco', 'warmtepomp', 'onderhoud', 'algemeen']),
    volgorde: z.number().default(100),
  }),
});

const reviews = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/reviews' }),
  schema: z.object({
    naam: z.string(),
    datum: z.coerce.date(),
    bron: z.string().default('Google'),
    tekst: z.string(),
  }),
});

const paginas = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/paginas' }),
  schema: z.object({
    titel: z.string(),
    seoTitel,
    seoOmschrijving,
    eyebrow: z.string(),
    intro: z.string(),
  }),
});

// Tekeningen voor kennisbankartikelen (src/components/KennisIllustratie.astro).
export const illustratieSoorten = ['hybride-vs-electric', 'airco-verwarmen', 'geluid-perceel', 'onderhoud-taken', 'warmtelast-ruimte', 'werkbereik-vorst', 'koudemiddel-gwp'] as const;
export type IllustratieSoort = (typeof illustratieSoorten)[number];

// Kennisbank: algemene vakinformatie met bronnen, geen beloftes namens het bedrijf.
const kennis = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/kennis' }),
  schema: z.object({
    titel: z.string(),
    seoTitel,
    seoOmschrijving,
    eyebrow: z.string(),
    intro: z.string(),
    /** Kort reuzenwoord voor de hero */
    woord: z.string().max(12),
    accent: z.enum(['koud', 'warm']),
    volgorde: z.number().default(100),
    gepubliceerd: z.coerce.date().optional(),
    bijgewerkt: z.coerce.date(),
    leestijd: z.number(),
    kernpunten: z.array(z.string()).min(2).max(5),
    bronnen: z.array(z.object({ naam: z.string(), url: z.url() })).min(1),
    verwant: z.array(z.string()).default([]),
    /** Verplicht bij meer dan twee alinea's (gecontroleerd in de tests) */
    illustratie: z.object({ soort: z.enum(illustratieSoorten), bijschrift: z.string() }).optional(),
  }),
});

export const collections = { diensten, faq, reviews, paginas, kennis };
