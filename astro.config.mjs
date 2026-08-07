import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.hymtravel.com',
  output: 'static',
  // 'auto' inlines stylesheets under ~4kB and links the rest. The shared
  // sheets are far larger than that and byte-identical across pages, so
  // linking them lets a visitor fetch each one once instead of re-reading
  // it inside every page's HTML. Filenames are content-hashed, so they can
  // be cached indefinitely and bust themselves on change.
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  integrations: [
    sitemap({
      // 404 has no business in a sitemap. Everything else does.
      filter: (page) => !page.includes('/404'),
      // Google ignores changefreq and priority. Omit both rather than ship
      // 94 lines of noise that imply a freshness signal we are not honouring.
      changefreq: undefined,
      priority: undefined,
      lastmod: new Date(),
    }),
  ],
});
