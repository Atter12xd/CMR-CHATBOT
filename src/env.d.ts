/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
  /** URL del API Baileys en servidor Contabo (ej. https://api.wazapp.ai o http://86.48.30.26:3001) */
  readonly PUBLIC_BAILEYS_API_URL?: string;
  readonly STRIPE_SECRET_KEY: string;
  readonly STRIPE_WEBHOOK_SECRET: string;
  /** Price ID del plan $50/mes en Stripe (ej. price_xxx) */
  readonly STRIPE_PRICE_ID: string;
  readonly OPENAI_API_KEY: string;
  readonly DATABASE_URL: string;
  readonly DIRECT_URL: string;
  readonly PUBLIC_APP_URL: string;
  readonly NODE_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

