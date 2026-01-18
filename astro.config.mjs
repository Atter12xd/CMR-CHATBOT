import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';
import fixVercelRuntime from './src/integrations/fix-vercel-runtime.ts';

export default defineConfig({
  output: 'hybrid', // Permite páginas estáticas y SSR
  adapter: vercel(),
  integrations: [react(), tailwind(), fixVercelRuntime()],
  server: {
    port: 4321
  }
});
