import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'hybrid', // Permite páginas estáticas y SSR
  adapter: vercel(),
  integrations: [react(), tailwind()],
  server: {
    port: 4321
  }
});

