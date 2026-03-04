import { createClient } from '../lib/supabase';
import type { BotTrainingData } from '../data/botTraining';

const supabase = createClient();
const BUCKET = 'bot-training';

function rowToTraining(row: {
  id: string;
  type: string;
  source: string;
  content: string | null;
  file_url: string | null;
  status: string;
  extracted_at: string | null;
  created_at: string | null;
}): BotTrainingData {
  return {
    id: row.id,
    type: row.type as 'web' | 'pdf' | 'manual',
    source: row.source,
    content: row.content || '',
    extractedAt: row.extracted_at ? new Date(row.extracted_at) : new Date(),
    status: row.status as BotTrainingData['status'],
  };
}

export async function loadTrainingData(organizationId: string): Promise<BotTrainingData[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('bot_training_data')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(rowToTraining);
}

export async function saveTrainingItem(
  organizationId: string,
  item: { type: 'web' | 'pdf'; source: string; content: string; fileUrl?: string | null }
): Promise<BotTrainingData> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('bot_training_data')
    .insert({
      organization_id: organizationId,
      type: item.type,
      source: item.source,
      content: item.content,
      file_url: item.fileUrl || null,
      status: 'completed',
      extracted_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  await upsertBotContext(organizationId, item.content, 'training', data.id);
  return rowToTraining(data);
}

async function upsertBotContext(
  organizationId: string,
  contextText: string,
  sourceType: string,
  sourceId: string
) {
  const { data: existing } = await supabase
    .from('bot_context')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('source_type', sourceType)
    .eq('source_id', sourceId)
    .maybeSingle();

  const row = {
    organization_id: organizationId,
    context_text: contextText,
    source_type: sourceType,
    source_id: sourceId,
    priority: 0,
  };

  if (existing) {
    await supabase.from('bot_context').update(row).eq('id', existing.id);
  } else {
    await supabase.from('bot_context').insert(row);
  }
}

export async function deleteTrainingItem(id: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { error: delError } = await supabase.from('bot_training_data').delete().eq('id', id);
  if (delError) throw delError;

  await supabase.from('bot_context').delete().eq('source_id', id);
}

export async function uploadTrainingFile(file: File): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const ext = file.name.split('.').pop() || 'pdf';
  const path = `${session.user.id}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}
