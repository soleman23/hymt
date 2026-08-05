import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://www.hymtravel.com',
  output: 'static',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true
});
