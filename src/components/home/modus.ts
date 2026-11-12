// De homepage heeft twee kanten: koelen en verwarmen. Beide staan in de HTML (voor zoekmachines);
// elementen met data-m="…" horen bij één kant en de keuzeknoppen in Home.astro wisselen ze.
export const kanten = ['koel', 'warm'] as const;
export type Kant = (typeof kanten)[number];

/** Zonder JavaScript is "koelen" zichtbaar. */
export const verborgen = (kant: Kant) => kant !== 'koel';
