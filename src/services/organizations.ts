import { createClient } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Organization = Database['public']['Tables']['organizations']['Row'];
type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];

export async function getOrganizationByOwner(ownerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', ownerId)
    .single();

  return { data, error };
}

export async function createOrganization(name: string, ownerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('organizations')
    .insert({
      name,
      owner_id: ownerId,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateOrganization(id: string, updates: Partial<OrganizationInsert>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function getOrCreateOrganization(userId: string, userName?: string) {
  // Intentar obtener organización existente
  const { data: existing } = await getOrganizationByOwner(userId);
  
  if (existing) {
    return { data: existing, error: null };
  }

  // Crear nueva organización si no existe
  const orgName = userName || 'Mi Tienda';
  return await createOrganization(orgName, userId);
}






