import { X } from 'lucide-react';
import type { Chat } from '../data/mockData';
import { inboxChannelSubtitle } from '../lib/inbox-section';

type Variant = 'modal' | 'sidebar';

interface ChatContactPanelProps {
  chat: Chat;
  displayName: string;
  variant: Variant;
  onClose?: () => void;
}

export default function ChatContactPanel({ chat, displayName, variant, onClose }: ChatContactPanelProps) {
  const isModal = variant === 'modal';

  const platformLabel = inboxChannelSubtitle(chat);

  return (
    <div
      className={
        isModal
          ? 'max-h-[90vh] flex flex-col overflow-hidden bg-white'
          : 'flex flex-col h-full min-h-0 overflow-hidden bg-white'
      }
    >
      {isModal && (
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[#E5E7EB] shrink-0">
          <span className="text-sm font-bold text-[#3D3D40]">Contacto</span>
          {onClose && (
            <button type="button" onClick={onClose} className="p-1.5 hover:bg-[#f3f4f6] rounded-md transition-colors">
              <X size={18} className="text-[#6D6D70]" />
            </button>
          )}
        </div>
      )}

      <div className={`overflow-y-auto flex-1 min-h-0 ${isModal ? 'p-4' : 'p-4'}`}>
        <div className="text-center pb-4 mb-4 border-b border-[#E5E7EB]">
          <img
            src={chat.customerAvatar}
            alt={displayName}
            className="w-[60px] h-[60px] rounded-full object-cover bg-[#f3f4f6] mx-auto mb-2 border border-[#E5E7EB]"
          />
          <div className="text-[15px] font-bold text-[#3D3D40]">{displayName}</div>
          <p className="text-xs text-[#6D6D70] mt-0.5">{platformLabel}</p>
        </div>

        <div>
          <p className="text-[10px] font-bold text-[#6D6D70] uppercase tracking-[0.07em] mb-2 pb-1.5 border-b border-[#E5E7EB]">
            Información de contacto
          </p>
          <div className="space-y-2.5">
            {chat.customerEmail && (
              <div className="flex justify-between gap-2 text-xs">
                <span className="text-[#6D6D70] shrink-0">Email</span>
                <span className="text-[#3D3D40] font-medium text-right break-all">{chat.customerEmail}</span>
              </div>
            )}
            {chat.customerPhone && (
              <div className="flex justify-between gap-2 text-xs">
                <span className="text-[#6D6D70] shrink-0">Teléfono</span>
                <span className="text-[#3D3D40] font-medium">{chat.customerPhone}</span>
              </div>
            )}
            <div className="flex justify-between gap-2 text-xs">
              <span className="text-[#6D6D70] shrink-0">Canal</span>
              <span className="text-[#3D3D40] font-medium">
                {chat.platform === 'whatsapp' && 'WhatsApp Business'}
                {chat.platform === 'facebook' && 'Facebook Messenger'}
                {chat.platform === 'web' && chat.webChannel === 'shopify' && 'Widget Shopify'}
                {chat.platform === 'web' && chat.webChannel !== 'shopify' && 'Widget en tu sitio'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isModal && onClose && (
        <div className="p-4 border-t border-[#E5E7EB] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-md border border-[#E5E7EB] bg-white text-[13px] font-semibold text-[#3D3D40] hover:bg-[#f9fafb] transition-colors"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
