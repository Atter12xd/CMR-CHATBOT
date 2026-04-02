import { Loader2, Check, CheckCheck, XCircle } from 'lucide-react';

type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

interface MessageStatusIndicatorProps {
  status: MessageStatus;
  className?: string;
  /** Burbuja oscura (mensaje propio) vs clara */
  tone?: 'light' | 'dark';
}

export default function MessageStatusIndicator({
  status,
  className = '',
  tone = 'light',
}: MessageStatusIndicatorProps) {
  const base = tone === 'dark' ? 'text-white/70' : 'text-app-muted';
  const readColor = tone === 'dark' ? 'text-brand-300' : 'text-brand-600';

  switch (status) {
    case 'sending':
      return (
        <Loader2 size={12} className={`${base} animate-spin ${className}`} title="Enviando..." />
      );

    case 'sent':
      return <Check size={12} className={`${base} ${className}`} title="Enviado" />;

    case 'delivered':
      return <CheckCheck size={12} className={`${base} ${className}`} title="Entregado" />;

    case 'read':
      return <CheckCheck size={12} className={`${readColor} ${className}`} title="Leído" />;

    case 'failed':
      return (
        <XCircle size={12} className={`text-red-500 ${className}`} title="Error al enviar" />
      );

    default:
      return null;
  }
}
