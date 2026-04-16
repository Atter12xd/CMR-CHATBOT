import { createClient } from '../lib/supabase';

const supabase = createClient();

export type AiCallStatus = 'completed' | 'scheduled' | 'failed';
export type AiCallResult = 'confirmed' | 'rejected' | 'no_answer';

export interface AiCall {
  id: string;
  organizationId: string;
  customerName: string;
  customerPhone: string | null;
  status: AiCallStatus;
  result: AiCallResult | null;
  durationSeconds: number | null;
  scheduledAt: Date | null;
  notes: string | null;
  createdAt: Date;
}

export async function loadAiCalls(organizationId: string): Promise<AiCall[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('ai_calls')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('ai_calls no disponible:', error.message);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    organizationId: row.organization_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    status: row.status as AiCallStatus,
    result: row.result as AiCallResult | null,
    durationSeconds: row.duration_seconds,
    scheduledAt: row.scheduled_at ? new Date(row.scheduled_at) : null,
    notes: row.notes,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  }));
}

export function aiCallStats(calls: AiCall[]) {
  const total = calls.length;
  const completed = calls.filter((c) => c.status === 'completed').length;
  const failed = calls.filter((c) => c.status === 'failed').length;
  const scheduled = calls.filter((c) => c.status === 'scheduled').length;
  const done = completed + failed;
  const successRate = done > 0 ? Math.round((completed / done) * 100) : 0;
  return { total, completed, failed, scheduled, successRate };
}
