import type { Chat } from '../data/mockData';

export type InboxSection = 'whatsapp' | 'web' | 'shopify';

export function inboxSectionForChat(chat: Chat): InboxSection {
  if (chat.platform === 'whatsapp') return 'whatsapp';
  if (chat.platform === 'web' && chat.webChannel === 'shopify') return 'shopify';
  return 'web';
}

export function chatMatchesInboxSection(chat: Chat, section: InboxSection): boolean {
  return inboxSectionForChat(chat) === section;
}

/** Subtítulo corto bajo el nombre del contacto (cabecera del hilo). */
export function inboxChannelSubtitle(chat: Chat, whatsAppNumber?: string): string {
  if (chat.platform === 'whatsapp') {
    return whatsAppNumber ? `WhatsApp · ${whatsAppNumber}` : 'WhatsApp';
  }
  if (chat.platform === 'facebook') return 'Facebook Messenger';
  if (chat.platform === 'web' && chat.webChannel === 'shopify') return 'Widget en tienda Shopify';
  return 'Widget en tu web';
}
