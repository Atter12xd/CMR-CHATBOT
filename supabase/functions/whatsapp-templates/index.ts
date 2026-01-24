import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const META_GRAPH = 'https://graph.facebook.com/v18.0';

async function getIntegration(supabase: any, organizationId: string, userId: string) {
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('id', organizationId)
    .eq('owner_id', userId)
    .single();
  if (!org) return { data: null, error: 'Organization not found' };

  const { data: integration, error } = await supabase
    .from('whatsapp_integrations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'connected')
    .single();
  return { data: integration, error };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: { action: string; organizationId?: string; templateName?: string; languageCode?: string; to?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { action, organizationId } = body;
  if (!action || !organizationId) {
    return new Response(JSON.stringify({ error: 'action and organizationId required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { data: integration, error: intErr } = await getIntegration(supabase, organizationId, user.id);
  if (intErr || !integration) {
    return new Response(
      JSON.stringify({
        error: 'WhatsApp no conectado para esta organización',
        details: intErr?.message || 'Verifica que el número esté conectado en Configuración.',
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const wabaId = integration.business_account_id || Deno.env.get('WHATSAPP_BUSINESS_ACCOUNT_ID');
  const phoneNumberId = integration.phone_number_id || Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
  let accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN') || integration.access_token;

  if (!accessToken) {
    return new Response(
      JSON.stringify({
        error: 'Falta access token de WhatsApp',
        details: 'Configura WHATSAPP_ACCESS_TOKEN en Supabase → Edge Functions → Secrets, o conecta vía OAuth (Facebook).',
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (action === 'list') {
    if (!wabaId) {
      return new Response(
        JSON.stringify({
          error: 'Falta Business Account ID',
          details: 'La integración no tiene business_account_id. Configura WHATSAPP_BUSINESS_ACCOUNT_ID en Secrets o conecta vía OAuth.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const url = `${META_GRAPH}/${wabaId}/message_templates`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const err = await res.text();
      let details = err;
      try {
        const parsed = JSON.parse(err);
        details = parsed.error?.message || parsed.error?.error_user_msg || parsed.error || err;
      } catch { /* keep raw */ }
      return new Response(
        JSON.stringify({
          error: 'Meta API rechazó la petición de plantillas',
          details: String(details).slice(0, 500),
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const data = await res.json();
    const templates = (data.data || []).filter((t: any) => (t.status || '').toLowerCase() === 'approved');
    return new Response(JSON.stringify({ templates }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (action === 'send') {
    const { templateName, languageCode, to } = body;
    if (!templateName || !to) {
      return new Response(
        JSON.stringify({ error: 'templateName and to (phone number) required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!phoneNumberId) {
      return new Response(
        JSON.stringify({
          error: 'Falta Phone Number ID',
          details: 'Configura WHATSAPP_PHONE_NUMBER_ID en Secrets o conecta un número vía OAuth/QR.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const lang = languageCode || 'en_US';
    const toDigits = to.replace(/\D/g, '');

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toDigits,
      type: 'template',
      template: {
        name: templateName,
        language: { code: lang },
      },
    };

    const url = `${META_GRAPH}/${phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({ error: 'Failed to send template', details: errText }),
        { status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const result = await res.json();
    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.messages?.[0]?.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify({ error: 'Unknown action. Use list or send.' }), {
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
