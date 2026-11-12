import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import beveiligingsheaders from './integrations/beveiligingsheaders.mjs';

export default defineConfig({
  site: 'https://thecoolfactory.nl',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      // Exact deze twee pagina's, niet elk adres waar toevallig '404' of 'bedankt' in staat
      filter: (page) => !['/bedankt', '/404'].includes(new URL(page).pathname.replace(/\/$/, '')),
    }),
    beveiligingsheaders(),
  ],
});
