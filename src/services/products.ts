import { createClient } from '../lib/supabase';
import type { Product } from '../data/products';

const supabase = createClient();

const BUCKET = 'product-images';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';

/** Convierte fila de BD a Product del frontend */
function rowToProduct(row: {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  stock: number | null;
  created_at: string | null;
}): Product {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    category: row.category,
    image: row.image_url || DEFAULT_IMAGE,
    description: row.description || undefined,
    stock: row.stock ?? undefined,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}

/**
 * Carga productos de una organización asadesde Supabase
 */
export async function loadProducts(organizationId: string): Promise<Product[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(rowToProduct);
}

/**
 * Crea un producto en Supabase
 */
export async function createProduct(
  organizationId: string,
  product: Omit<Product, 'id' | 'createdAt'>
): Promise<Product> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('products')
    .insert({
      organization_id: organizationId,
      name: product.name,
      description: product.description || null,
      price: product.price,
      category: product.category,
      image_url: product.image || null,
      stock: product.stock ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return rowToProduct(data);
}

/**
 * Actualiza un producto
 */
export async function updateProduct(
  productId: string,
  product: Omit<Product, 'id' | 'createdAt'>
): Promise<Product> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('products')
    .update({
      name: product.name,
      description: product.description || null,
      price: product.price,
      category: product.category,
      image_url: product.image || null,
      stock: product.stock ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', productId)
    .select()
    .single();

  if (error) throw error;
  return rowToProduct(data);
}

/**
 * Elimina un producto
 */
export async function deleteProduct(productId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) throw error;
}

/**
 * Sube una imagen a Storage y devuelve la URL pública.
 * Acepta File o data URL (base64).
 */
export async function uploadProductImage(fileOrDataUrl: File | string): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  let file: File;
  let ext = 'jpg';
  if (typeof fileOrDataUrl === 'string') {
    const res = await fetch(fileOrDataUrl);
    const blob = await res.blob();
    const mime = blob.type || 'image/jpeg';
    ext = mime.split('/')[1] || 'jpg';
    file = new File([blob], `product-${Date.now()}.${ext}`, { type: mime });
  } else {
    file = fileOrDataUrl;
    const name = file.name.toLowerCase();
    if (name.endsWith('.png')) ext = 'png';
    else if (name.endsWith('.webp')) ext = 'webp';
  }

  const path = `${session.user.id}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}
