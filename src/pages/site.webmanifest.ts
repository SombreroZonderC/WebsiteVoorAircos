import type { APIRoute } from 'astro';
import { bedrijf } from '../lib/bedrijf';

// Webmanifest: naam, kleuren en pictogrammen voor "Zet op beginscherm". Uit de bedrijfsgegevens, zodat er één bron is.
export const GET: APIRoute = () => {
  const manifest = {
    name: bedrijf.naam,
    short_name: bedrijf.naam,
    description: `${bedrijf.tagline} in ${bedrijf.adres.plaats} en omgeving.`,
    lang: 'nl',
    start_url: '/',
    display: 'browser',
    background_color: '#05090b',
    theme_color: '#061419',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/images/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/images/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
  return new Response(JSON.stringify(manifest, null, 2), { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } });
};
