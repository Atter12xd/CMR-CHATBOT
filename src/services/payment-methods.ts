import { createClient } from '../lib/supabase';
import type { PaymentMethod } from '../data/paymentMethods';

const supabase = createClient();

const METHOD_NAMES: Record<string, string> = {
  yape: 'Yape',
  plin: 'Plin',
  bcp: 'BCP',
};

function rowToMethod(row: {
  id: string;
  method: string;
  enabled: boolean;
  account_name: string | null;
  account_number: string | null;
  account_type: string | null;
}): PaymentMethod {
  return {
    id: row.id,
    type: row.method as 'yape' | 'plin' | 'bcp',
    name: METHOD_NAMES[row.method] || row.method,
    accountName: row.account_name || '',
    accountNumber: row.account_number || undefined,
    accountType: (row.account_type as 'Ahorros' | 'Corriente') || undefined,
    active: row.enabled,
  };
}

/**
 * Carga los métodos de pago configurados de la organización desde Supabase
 */
export async function loadPaymentMethods(organizationId: string): Promise<PaymentMethod[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('payment_methods_config')
    .select('*')
    .eq('organization_id', organizationId)
    .order('method');

  if (error) throw error;

  const types: ('yape' | 'plin' | 'bcp')[] = ['yape', 'plin', 'bcp'];
  const byType = new Map((data || []).map((r) => [r.method, rowToMethod(r)]));

  return types.map((method) => byType.get(method) || {
    id: method,
    type: method,
    name: METHOD_NAMES[method],
    accountName: '',
    accountNumber: undefined,
    accountType: method === 'bcp' ? 'Ahorros' : undefined,
    active: false,
  });
}

/**
 * Guarda los métodos de pago en Supabase (upsert por organization_id + method)
 */
export async function savePaymentMethods(
  organizationId: string,
  methods: PaymentMethod[]
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  for (const m of methods) {
    const { error } = await supabase
      .from('payment_methods_config')
      .upsert(
        {
          organization_id: organizationId,
          method: m.type,
          enabled: m.active,
          account_name: m.active ? (m.accountName || null) : null,
          account_number: m.active && m.accountNumber ? (m.accountNumber.trim() || null) : null,
          account_type: m.type === 'bcp' && m.active ? (m.accountType || null) : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'organization_id,method' }
      );

    if (error) throw error;
  }
}
