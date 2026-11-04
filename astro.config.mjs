import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://thecoolfactory.nl',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [
    sitemap({
      filter: (page) => !['/bedankt', '/404'].some((pad) => page.includes(pad)),
    }),
  ],
});
