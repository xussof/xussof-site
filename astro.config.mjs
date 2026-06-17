import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// GitHub Pages "project page" URL: https://xussof.github.io/xussof-site/
// If a custom domain is added later, set `site` to it and `base` to '/'.
export default defineConfig({
  site: 'https://xussof.github.io',
  base: '/xussof-site',
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap()],
});
