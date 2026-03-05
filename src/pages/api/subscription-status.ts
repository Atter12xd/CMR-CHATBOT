import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return new Response(
      JSON.stringify({ active: false }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const supabaseAnon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnon) {
    return new Response(
      JSON.stringify({ active: false }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return new Response(
      JSON.stringify({ active: false }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return new Response(
      JSON.stringify({ active: false }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey);
  const { data: orgs } = await supabaseAdmin
    .from('organizations')
    .select('id')
    .eq('owner_id', user.id)
    .limit(1);

  const orgId = orgs?.[0]?.id;
  if (!orgId) {
    return new Response(
      JSON.stringify({ active: false }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { data: sub } = await supabaseAdmin
    .from('stripe_subscriptions')
    .select('id')
    .eq('organization_id', orgId)
    .in('status', ['trialing', 'active'])
    .limit(1)
    .maybeSingle();

  return new Response(
    JSON.stringify({ active: !!sub?.id }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
