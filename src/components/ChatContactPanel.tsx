import { Mail, Phone, MessageSquare, X } from 'lucide-react';
import type { Chat } from '../data/mockData';

type Variant = 'modal' | 'sidebar';

interface ChatContactPanelProps {
  chat: Chat;
  displayName: string;
  variant: Variant;
  onClose?: () => void;
}

export default function ChatContactPanel({ chat, displayName, variant, onClose }: ChatContactPanelProps) {
  const isModal = variant === 'modal';

  return (
    <div
      className={
        isModal
          ? 'max-h-[90vh] flex flex-col overflow-hidden'
          : 'flex flex-col h-full min-h-0 overflow-hidden bg-white'
      }
    >
      <div className="p-6 bg-app-field/70 border-b border-app-line shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-app-muted text-xs uppercase tracking-[0.12em]">
            Ficha de contacto
          </h3>
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white rounded-2xl transition-colors"
            >
              <X size={16} className="text-app-muted" />
            </button>
          )}
        </div>
        <div className="flex flex-col items-center">
          <div className="rounded-full p-[3px] bg-white border border-app-line mb-3 shadow-sm">
            <img
              src={chat.customerAvatar}
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover bg-app-field"
            />
          </div>
          <h2 className="text-xl font-bold text-app-ink font-display text-center">{displayName}</h2>
          <p className="text-sm text-app-muted mt-1 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                chat.platform === 'whatsapp'
                  ? 'bg-emerald-500'
                  : chat.platform === 'facebook'
                    ? 'bg-brand-600'
                    : 'bg-app-muted'
              }`}
            />
            {chat.platform === 'whatsapp' && 'WhatsApp'}
            {chat.platform === 'facebook' && 'Facebook'}
            {chat.platform === 'web' && 'Web'}
          </p>
        </div>
      </div>
      <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0 bg-white">
        <p className="text-[10px] font-bold text-app-muted uppercase tracking-[0.14em]">Información de contacto</p>
        {chat.customerEmail && (
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-app-field/80 border border-app-line">
            <Mail className="size-4 text-brand-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] text-app-muted font-medium">Email</p>
              <p className="text-sm text-app-ink break-all">{chat.customerEmail}</p>
            </div>
          </div>
        )}
        {chat.customerPhone && (
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-app-field/80 border border-app-line">
            <Phone className="size-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] text-app-muted font-medium">Teléfono</p>
              <p className="text-sm text-app-ink">{chat.customerPhone}</p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-app-field/80 border border-app-line">
          <MessageSquare className="size-4 text-violet-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] text-app-muted font-medium">Canal</p>
            <p className="text-sm text-app-ink">
              {chat.platform === 'whatsapp' && 'WhatsApp Business'}
              {chat.platform === 'facebook' && 'Facebook Messenger'}
              {chat.platform === 'web' && 'Chat web'}
            </p>
          </div>
        </div>
      </div>
      {isModal && onClose && (
        <div className="p-4 border-t border-app-line bg-app-field/40 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-full border border-app-line bg-white text-app-ink hover:bg-app-field text-sm font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
