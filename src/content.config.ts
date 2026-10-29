import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// De mappen en velden hieronder zijn één-op-één over te nemen in een
// Keystatic-config (collections met format 'md' / 'yaml'), zodat er later
// een CMS bovenop kan zonder de inhoud te verplaatsen.

const kaart = z.object({ titel: z.string(), tekst: z.string() });

const diensten = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/diensten' }),
  schema: z.object({
    titel: z.string(),
    menuLabel: z.string(),
    seoTitel: z.string(),
    seoOmschrijving: z.string().max(170),
    eyebrow: z.string(),
    intro: z.string(),
    volgorde: z.number(),
    icoon: z.enum(['snow', 'flame', 'wrench']),
    accent: z.enum(['koud', 'warm']),
    beeld: z.enum(['airco', 'warmtepomp', 'onderhoud']),
    voordelen: z.array(kaart),
    stappen: z.array(kaart).default([]),
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
    seoTitel: z.string(),
    seoOmschrijving: z.string().max(170),
    eyebrow: z.string(),
    intro: z.string(),
  }),
});

export const collections = { diensten, faq, reviews, paginas };
