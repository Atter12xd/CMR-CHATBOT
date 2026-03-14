import { createClient } from '../lib/supabase';

export interface ProductSuggestion {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  sourceRef: string | null;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

function rowToSuggestion(row: {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  source_ref: string | null;
  status: string;
  created_at: string | null;
}): ProductSuggestion {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    description: row.description ?? null,
    price: Number(row.price),
    category: row.category,
    sourceRef: row.source_ref ?? null,
    status: row.status as ProductSuggestion['status'],
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}

export async function loadProductSuggestions(organizationId: string): Promise<ProductSuggestion[]> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('product_suggestions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(rowToSuggestion);
}

export async function approveProductSuggestion(
  suggestionId: string,
  organizationId: string
): Promise<void> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data: suggestion, error: fetchErr } = await supabase
    .from('product_suggestions')
    .select('name, description, price, category')
    .eq('id', suggestionId)
    .eq('organization_id', organizationId)
    .eq('status', 'pending')
    .single();

  if (fetchErr || !suggestion) throw new Error('Sugerencia no encontrada');

  const { error: insertErr } = await supabase.from('products').insert({
    organization_id: organizationId,
    name: suggestion.name,
    description: suggestion.description || null,
    price: suggestion.price,
    category: suggestion.category,
    image_url: null,
    stock: null,
  });

  if (insertErr) throw insertErr;

  await supabase
    .from('product_suggestions')
    .update({ status: 'approved' })
    .eq('id', suggestionId);
}

export async function rejectProductSuggestion(suggestionId: string, organizationId: string): Promise<void> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { error } = await supabase
    .from('product_suggestions')
    .update({ status: 'rejected' })
    .eq('id', suggestionId)
    .eq('organization_id', organizationId);

  if (error) throw error;
}
