import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const email = url.searchParams.get('email')?.trim();
  if (!email) {
    return new Response(
      JSON.stringify({ authorized: false }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ authorized: false }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data } = await supabase
    .from('authorized_emails')
    .select('email')
    .ilike('email', email)
    .limit(1)
    .maybeSingle();

  return new Response(
    JSON.stringify({ authorized: !!data?.email }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
