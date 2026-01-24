    import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
    import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    };

    serve(async (req) => {
      // Manejar CORS preflight
      if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
      }

      try {
        // Obtener token de autenticación
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: 'No autorizado' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Crear cliente Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey, {
          global: { headers: { Authorization: authHeader } },
        });

        // Obtener usuario actual
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: 'No autorizado' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

    if (req.method === 'POST') {
      const { organizationId, phoneNumber } = await req.json();

      if (!organizationId) {
        return new Response(
          JSON.stringify({ error: 'organizationId es requerido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!phoneNumber) {
        return new Response(
          JSON.stringify({ error: 'phoneNumber es requerido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validar formato de número
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return new Response(
          JSON.stringify({ error: 'Formato de número inválido. Usa formato internacional: +51987654321' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

          // Verificar que el usuario es propietario de la organización
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('id')
            .eq('id', organizationId)
            .eq('owner_id', user.id)
            .single();

          if (orgError || !org) {
            return new Response(
              JSON.stringify({ error: 'Organización no encontrada o sin permisos' }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Desactivar QR activos previos de esta organización
          await supabase
            .from('qr_codes')
            .update({ status: 'expired' })
            .eq('organization_id', organizationId)
            .in('status', ['pending', 'scanned']);

          // Generar código único de 32 caracteres
          const code = crypto.randomUUID().replace(/-/g, '').substring(0, 32);

          // Calcular expiración (5 minutos)
          const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Guardar código en BD con el número asociado
      const { data: qrCode, error: insertError } = await supabase
        .from('qr_codes')
        .insert({
          code,
          organization_id: organizationId,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
          metadata: { phoneNumber }, // Guardar número en metadata para usarlo al escanear
        })
        .select()
        .single();

          if (insertError) {
            console.error('Error insertando QR code:', insertError);
            return new Response(
              JSON.stringify({ error: 'Error generando código QR' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Generar URL del QR
          const frontendUrl = Deno.env.get('FRONTEND_URL') || Deno.env.get('PUBLIC_SITE_URL') || 'https://wazapp.ai';
          const qrUrl = `${frontendUrl}/connect/qr/${code}`;

          // Generar imagen QR usando API externa (ya que no tenemos qrcode instalado en Deno)
          const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;

          return new Response(
            JSON.stringify({
              code,
              qrImage: qrImageUrl,
              qrUrl,
              expiresAt: expiresAt.toISOString(),
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // GET: Verificar estado de un código
        if (req.method === 'GET') {
          const url = new URL(req.url);
          const code = url.searchParams.get('code');

          if (!code) {
            return new Response(
              JSON.stringify({ error: 'code es requerido' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const { data: qrCode, error: qrError } = await supabase
            .from('qr_codes')
            .select('*, organization_id')
            .eq('code', code)
            .single();

          if (qrError || !qrCode) {
            return new Response(
              JSON.stringify({ error: 'Código QR no encontrado' }),
              { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Verificar que el usuario es propietario
          const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('id')
            .eq('id', qrCode.organization_id)
            .eq('owner_id', user.id)
            .single();

          if (orgError || !org) {
            return new Response(
              JSON.stringify({ error: 'Sin permisos para ver este código' }),
              { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          // Verificar si expiró
          const now = new Date();
          const expiresAt = new Date(qrCode.expires_at);
          if (now > expiresAt && qrCode.status === 'pending') {
            await supabase
              .from('qr_codes')
              .update({ status: 'expired' })
              .eq('code', code);
            qrCode.status = 'expired';
          }

          return new Response(
            JSON.stringify({
              code: qrCode.code,
              status: qrCode.status,
              expiresAt: qrCode.expires_at,
              scannedAt: qrCode.scanned_at,
              usedAt: qrCode.used_at,
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ error: 'Método no permitido' }),
          { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error en whatsapp-qr-generate:', error);
        return new Response(
          JSON.stringify({ error: error.message || 'Error interno del servidor' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    });
