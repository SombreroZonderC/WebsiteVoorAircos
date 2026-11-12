import { z } from 'astro/zod';

// Bouwstenen die in meerdere schema's terugkomen (content collections en instellingen).
export const kaart = z.object({ titel: z.string(), tekst: z.string() });
export const seoOmschrijving = z.string().max(170);
/** Zoekmachines kappen titels af rond 60 tekens. */
export const seoTitel = z.string().max(60);
