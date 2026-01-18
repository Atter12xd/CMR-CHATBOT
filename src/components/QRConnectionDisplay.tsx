import { useState, useEffect, useRef } from 'react';
import { QrCode, Loader2, CheckCircle2, XCircle, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { generateQR, pollQRStatus, type QRStatusResponse } from '../services/whatsapp-qr';

interface QRConnectionDisplayProps {
  organizationId: string;
  onConnected: () => void;
  onError: (error: string) => void;
}

export default function QRConnectionDisplay({ organizationId, onConnected, onError }: QRConnectionDisplayProps) {
  const [qrData, setQrData] = useState<{ code: string; qrImage: string; qrUrl: string; expiresAt: string } | null>(null);
  const [status, setStatus] = useState<'pending' | 'scanned' | 'expired' | 'used'>('pending');
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const stopPollingRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    generateQRCode();
    return () => {
      // Limpiar polling al desmontar
      if (stopPollingRef.current) {
        stopPollingRef.current();
      }
    };
  }, [organizationId]);

  // Contador regresivo
  useEffect(() => {
    if (!qrData) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiresAt = new Date(qrData.expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
      
      setTimeRemaining(remaining);

      if (remaining === 0 && status === 'pending') {
        setStatus('expired');
        if (stopPollingRef.current) {
          stopPollingRef.current();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [qrData, status]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      const data = await generateQR(organizationId);
      setQrData(data);
      setStatus('pending');
      
      // Iniciar polling
      const stopPolling = pollQRStatus(
        data.code,
        (qrStatus: QRStatusResponse) => {
          setStatus(qrStatus.status);
          if (qrStatus.status === 'used') {
            // QR fue usado exitosamente
            if (stopPollingRef.current) {
              stopPollingRef.current();
            }
            setTimeout(() => {
              onConnected();
            }, 1000);
          } else if (qrStatus.status === 'expired') {
            // QR expirado
            if (stopPollingRef.current) {
              stopPollingRef.current();
            }
          }
        },
        () => {
          // Polling completado
        },
        3000 // Poll cada 3 segundos
      );
      
      stopPollingRef.current = stopPolling;
    } catch (err: any) {
      console.error('Error generando QR:', err);
      onError(err.message || 'Error al generar código QR');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Generando código QR...</p>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-gray-600 mb-4">No se pudo generar el código QR</p>
        <button
          onClick={generateQRCode}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* QR Code */}
      <div className="relative">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <img
            src={qrData.qrImage}
            alt="QR Code"
            className="w-64 h-64"
          />
        </div>
        
        {/* Overlay si está escaneado */}
        {status === 'scanned' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">QR Escaneado</p>
              <p className="text-xs text-gray-500 mt-1">Procesando...</p>
            </div>
          </div>
        )}
      </div>

      {/* Estado y mensajes */}
      <div className="text-center space-y-2">
        {status === 'pending' && (
          <>
            <h3 className="text-lg font-semibold text-gray-800">Escanea este código con tu teléfono</h3>
            <p className="text-sm text-gray-600">
              Abre la cámara de tu teléfono y apunta hacia el código QR
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Expira en: {formatTime(timeRemaining)}
              </span>
            </div>
          </>
        )}

        {status === 'scanned' && (
          <>
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-700">Código escaneado</h3>
            <p className="text-sm text-gray-600">Autoriza la conexión en tu teléfono</p>
          </>
        )}

        {status === 'used' && (
          <>
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2 animate-pulse" />
            <h3 className="text-lg font-semibold text-green-700">¡Conectado exitosamente!</h3>
            <p className="text-sm text-gray-600">Tu WhatsApp está ahora vinculado</p>
          </>
        )}

        {status === 'expired' && (
          <>
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-red-700">Código QR expirado</h3>
            <p className="text-sm text-gray-600 mb-4">El código ha expirado. Genera uno nuevo</p>
            <button
              onClick={generateQRCode}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Generar nuevo QR
            </button>
          </>
        )}
      </div>

      {/* Código alfanumérico (opcional) */}
      {status === 'pending' && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 text-center mb-2">O abre esta URL en tu teléfono:</p>
          <code className="text-xs text-blue-600 break-all">{qrData.qrUrl}</code>
        </div>
      )}
    </div>
  );
}
