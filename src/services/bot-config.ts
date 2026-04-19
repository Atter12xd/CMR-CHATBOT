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

const SELECT_COLUMNS_FULL = 'id, organization_id, company_name, company_description, initial_greeting, bot_name, catalog_invite, company_website_url';
const SELECT_COLUMNS_BASE = 'id, organization_id, company_name, company_description, initial_greeting, bot_name';

export async function getOrganizationBotConfig(
  organizationId: string
): Promise<OrganizationBotConfig | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No hay sesión activa');

  const { data, error } = await supabase
    .from('organization_bot_config')
    .select(SELECT_COLUMNS_FULL)
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error && (error.message?.includes('catalog_invite') || error.message?.includes('company_website_url'))) {
    const { data: dataBase, error: errBase } = await supabase
      .from('organization_bot_config')
      .select(SELECT_COLUMNS_BASE)
      .eq('organization_id', organizationId)
      .maybeSingle();
    if (errBase) throw errBase;
    return dataBase ? rowToConfig({ ...dataBase, catalog_invite: null, company_website_url: null }) : null;
  }
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

  const catalogInvite = config.catalogInvite.trim();
  const companyWebsiteUrl = config.companyWebsiteUrl.trim();
  if (!catalogInvite && !companyWebsiteUrl) {
    throw new Error(
      'Completa al menos uno: «URL de tu web» o «Invitación a ver web o catálogo» (enlace o texto). El bot los usa para responder cuando preguntan por productos.',
    );
  }

  const rowFull: Record<string, unknown> = {
    organization_id: organizationId,
    company_name: config.companyName.trim() || null,
    company_description: config.companyDescription.trim() || null,
    initial_greeting: config.initialGreeting.trim() || null,
    bot_name: config.botName.trim() || null,
    catalog_invite: catalogInvite || null,
    company_website_url: companyWebsiteUrl || null,
    updated_at: new Date().toISOString(),
  };

  const result = await supabase
    .from('organization_bot_config')
    .upsert(rowFull, { onConflict: 'organization_id' })
    .select()
    .single();

  if (result.error && (result.error.message?.includes('catalog_invite') || result.error.message?.includes('company_website_url'))) {
    const rowBase = {
      organization_id: organizationId,
      company_name: config.companyName.trim() || null,
      company_description: config.companyDescription.trim() || null,
      initial_greeting: config.initialGreeting.trim() || null,
      bot_name: config.botName.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const result2 = await supabase
      .from('organization_bot_config')
      .upsert(rowBase, { onConflict: 'organization_id' })
      .select()
      .single();
    if (result2.error) throw result2.error;
    return rowToConfig(result2.data as Parameters<typeof rowToConfig>[0]);
  }

  if (result.error) throw result.error;
  return rowToConfig(result.data as Parameters<typeof rowToConfig>[0]);
}
