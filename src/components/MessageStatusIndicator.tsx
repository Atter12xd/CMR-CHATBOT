import { Loader2, Check, CheckCheck, XCircle } from 'lucide-react';

type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

interface MessageStatusIndicatorProps {
  status: MessageStatus;
  className?: string;
}

export default function MessageStatusIndicator({ status, className = '' }: MessageStatusIndicatorProps) {
  switch (status) {
    case 'sending':
      return (
        <Loader2 
          size={12} 
          className={`text-gray-400 animate-spin ${className}`}
          title="Enviando..."
        />
      );
    
    case 'sent':
      return (
        <Check 
          size={12} 
          className={`text-gray-400 ${className}`}
          title="Enviado"
        />
      );
    
    case 'delivered':
      return (
        <CheckCheck 
          size={12} 
          className={`text-gray-400 ${className}`}
          title="Entregado"
        />
      );
    
    case 'read':
      return (
        <CheckCheck 
          size={12} 
          className={`text-[#53bdeb] ${className}`}
          title="Leído"
        />
      );
    
    case 'failed':
      return (
        <XCircle 
          size={12} 
          className={`text-red-500 ${className}`}
          title="Error al enviar"
        />
      );
    
    default:
      return null;
  }
}
