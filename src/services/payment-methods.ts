import { createClient } from '../lib/supabase';
import type { PaymentMethod, PaymentMethodType } from '../data/paymentMethods';

const supabase = createClient();

const METHOD_NAMES: Record<string, string> = {
  yape: 'Yape',
  plin: 'Plin',
  bcp: 'BCP',
  interbank: 'Interbank',
};

type PaymentMethodConfigRow = {
  id: string;
  method: string;
  enabled: boolean;
  account_name: string | null;
  account_number: string | null;
  account_number_corriente?: string | null;
  account_type: string | null;
};

function rowToMethod(row: PaymentMethodConfigRow): PaymentMethod {
  const type = row.method as PaymentMethodType;
  let accountNumber = row.account_number?.trim() || undefined;
  let accountNumberCorriente = row.account_number_corriente?.trim() || undefined;
  const tipo = (row.account_type || '').trim();

  if (!accountNumberCorriente && accountNumber && (tipo === 'Corriente' || tipo.toLowerCase().includes('corriente'))) {
    accountNumberCorriente = accountNumber;
    accountNumber = undefined;
  }

  return {
    id: row.id,
    type,
    name: METHOD_NAMES[row.method] || row.method,
    accountName: row.account_name || '',
    accountNumber,
    accountNumberCorriente,
    active: row.enabled,
  };
}

const METHOD_ORDER: PaymentMethodType[] = ['yape', 'plin', 'bcp', 'interbank'];

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

  const byType = new Map((data || []).map((r) => [r.method, rowToMethod(r as PaymentMethodConfigRow)]));

  return METHOD_ORDER.map((method) => {
    const found = byType.get(method);
    if (found) return found;
    return {
      id: method,
      type: method,
      name: METHOD_NAMES[method],
      accountName: '',
      accountNumber: method === 'bcp' || method === 'interbank' ? '' : undefined,
      accountNumberCorriente: method === 'bcp' || method === 'interbank' ? '' : undefined,
      active: false,
    };
  });
}

/**
 * Guarda los métodos de pago en Supabase (upsert por organization_id + method)
 */
export async function savePaymentMethods(organizationId: string, methods: PaymentMethod[]): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  for (const m of methods) {
    const isBank = m.type === 'bcp' || m.type === 'interbank';
    const ah = m.active && isBank ? (m.accountNumber?.trim() || null) : null;
    const cc = m.active && isBank ? (m.accountNumberCorriente?.trim() || null) : null;

    const { error } = await supabase
      .from('payment_methods_config')
      .upsert(
        {
          organization_id: organizationId,
          method: m.type,
          enabled: m.active,
          account_name: m.active ? (m.accountName || null) : null,
          account_number: m.active && isBank ? ah : m.active ? (m.accountNumber?.trim() || null) : null,
          account_number_corriente: m.active && isBank ? cc : null,
          account_type: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'organization_id,method' }
      );

    if (error) throw error;
  }
}
