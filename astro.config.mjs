import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://thecoolfactory.nl',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      filter: (page) => !['/bedankt', '/poc', '/404', '/prototype'].some((pad) => page.includes(pad)),
    }),
  ],
});
