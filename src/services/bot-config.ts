import { createClient } from '../lib/supabase';
import type { OrganizationBotConfig } from '../data/botTraining';

const supabase = createClient();

function rowToConfig(row: {
  id: string;
  organization_id: string;
  company_name: string | null;
  company_description: string | null;
  initial_greeting: string | null;
  bot_name: string | null;
  catalog_invite?: string | null;
  company_website_url?: string | null;
}): OrganizationBotConfig {
  return {
    id: row.id,
    organizationId: row.organization_id,
    companyName: row.company_name ?? '',
    companyDescription: row.company_description ?? '',
    initialGreeting: row.initial_greeting ?? '',
    botName: row.bot_name ?? '',
    catalogInvite: row.catalog_invite ?? '',
    companyWebsiteUrl: row.company_website_url ?? '',
  };
}

export async function getOrganizationBotConfig(
  organizationId: string
): Promise<OrganizationBotConfig | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('organization_bot_config')
    .select('id, organization_id, company_name, company_description, initial_greeting, bot_name, catalog_invite, company_website_url')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToConfig(data) : null;
}

export async function saveOrganizationBotConfig(
  organizationId: string,
  config: {
    companyName: string;
    companyDescription: string;
    initialGreeting: string;
    botName: string;
    catalogInvite: string;
    companyWebsiteUrl: string;
  }
): Promise<OrganizationBotConfig> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const row = {
    organization_id: organizationId,
    company_name: config.companyName.trim() || null,
    company_description: config.companyDescription.trim() || null,
    initial_greeting: config.initialGreeting.trim() || null,
    bot_name: config.botName.trim() || null,
    catalog_invite: config.catalogInvite.trim() || null,
    company_website_url: config.companyWebsiteUrl.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('organization_bot_config')
    .upsert(row, { onConflict: 'organization_id' })
    .select()
    .single();

  if (error) throw error;
  return rowToConfig(data);
}
