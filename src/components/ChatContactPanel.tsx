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
          : 'flex flex-col h-full min-h-0 overflow-hidden bg-app-card/60'
      }
    >
      <div className="p-6 bg-gradient-to-br from-brand-500/10 via-app-card to-purple-600/10 border-b border-app-line shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white text-sm uppercase tracking-[0.12em] text-slate-400">
            Ficha de contacto
          </h3>
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/[0.08] rounded-xl transition-colors"
            >
              <X size={16} className="text-slate-400" />
            </button>
          )}
        </div>
        <div className="flex flex-col items-center">
          <div className="rounded-full p-[3px] bg-gradient-to-br from-brand-400 to-purple-600 mb-3">
            <img
              src={chat.customerAvatar}
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover bg-app-card"
            />
          </div>
          <h2 className="text-xl font-bold text-white font-display text-center">{displayName}</h2>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                chat.platform === 'whatsapp'
                  ? 'bg-emerald-500'
                  : chat.platform === 'facebook'
                    ? 'bg-blue-500'
                    : 'bg-slate-400'
              }`}
            />
            {chat.platform === 'whatsapp' && 'WhatsApp'}
            {chat.platform === 'facebook' && 'Facebook'}
            {chat.platform === 'web' && 'Web'}
          </p>
        </div>
      </div>
      <div className="p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.14em]">Información de contacto</p>
        {chat.customerEmail && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-app-line">
            <Mail className="size-4 text-brand-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Email</p>
              <p className="text-sm text-slate-100 break-all">{chat.customerEmail}</p>
            </div>
          </div>
        )}
        {chat.customerPhone && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-app-line">
            <Phone className="size-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Teléfono</p>
              <p className="text-sm text-slate-100">{chat.customerPhone}</p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.04] border border-app-line">
          <MessageSquare className="size-4 text-purple-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] text-slate-500 font-medium">Canal</p>
            <p className="text-sm text-slate-100">
              {chat.platform === 'whatsapp' && 'WhatsApp Business'}
              {chat.platform === 'facebook' && 'Facebook Messenger'}
              {chat.platform === 'web' && 'Chat web'}
            </p>
          </div>
        </div>
      </div>
      {isModal && onClose && (
        <div className="p-4 border-t border-app-line bg-white/[0.02] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-app-line bg-white/[0.05] text-slate-200 hover:bg-white/[0.08] text-sm font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
