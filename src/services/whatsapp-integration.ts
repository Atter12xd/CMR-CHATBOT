import { createClient } from '../lib/supabase';

const supabase = createClient();

/**
 * Obtiene el estado de la integración WhatsApp desde Supabase.
 * La conexión real se gestiona con Baileys en el servidor Contabo (ver whatsapp-baileys.ts).
 */
export async function getIntegrationStatus(organizationId: string) {
  const { data, error } = await supabase
    .from('whatsapp_integrations')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}
