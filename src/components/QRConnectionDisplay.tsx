import { useState, useEffect, useRef } from 'react';
import { QrCode, Loader2, CheckCircle2, XCircle, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { generateQR, pollQRStatus, type QRStatusResponse } from '../services/whatsapp-qr';


interface QRConnectionDisplayProps {
  organizationId: string;
  phoneNumber: string; // Número ya ingresado antes de generar QR
  onConnected: () => void;
  onError: (error: string) => void;
}


export default function QRConnectionDisplay({ organizationId, phoneNumber, onConnected, onError }: QRConnectionDisplayProps) {
  const [qrData, setQrData] = useState<{ code: string; qrImage: string; qrUrl: string; expiresAt: string } | null>(null);
  const [status, setStatus] = useState<'pending' | 'scanned' | 'expired' | 'used'>('pending');
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const stopPollingRef = useRef<(() => void) | null>(null);


  useEffect(() => {
    if (phoneNumber) {
      generateQRCode();
    }
    return () => {
      // Limpiar polling al desmontar
      if (stopPollingRef.current) {
        stopPollingRef.current();
      }
    };
  }, [organizationId, phoneNumber]);


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
      const data = await generateQR(organizationId, phoneNumber);
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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-14 h-14 bg-violet-50 ring-1 ring-violet-100 rounded-2xl flex items-center justify-center mb-4">
          <Loader2 className="w-6 h-6 text-violet-600 animate-spin" />
        </div>
        <p className="text-sm text-slate-500">Generando código QR...</p>
      </div>
    );
  }


  if (!qrData) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-14 h-14 bg-rose-50 ring-1 ring-rose-100 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-rose-500" />
        </div>
        <p className="text-sm text-slate-600 mb-4">No se pudo generar el código QR</p>
        <button
          onClick={generateQRCode}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 shadow-sm shadow-violet-600/20 transition-all"
        >
          <RefreshCw size={15} />
          Reintentar
        </button>
      </div>
    );
  }


  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6">
      {/* QR Code */}
      <div className="relative">
        <div className="bg-white p-5 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
          <img
            src={qrData.qrImage}
            alt="QR Code"
            className="w-64 h-64"
          />
        </div>
        
        {/* Overlay si está escaneado */}
        {status === 'scanned' && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="bg-white p-5 rounded-2xl text-center shadow-xl">
              <div className="w-12 h-12 bg-emerald-50 ring-1 ring-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-slate-900">QR Escaneado</p>
              <p className="text-[12px] text-slate-400 mt-1">Procesando...</p>
            </div>
          </div>
        )}
      </div>


      {/* Estado y mensajes */}
      <div className="text-center space-y-2 max-w-xs">
        {status === 'pending' && (
          <>
            <h3 className="text-base font-semibold text-slate-900">Escanea este código con tu teléfono</h3>
            <p className="text-[13px] text-slate-500 leading-relaxed">
              Abre la cámara de tu teléfono y apunta hacia el código QR
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 ring-1 ring-slate-200/80 rounded-xl">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[13px] font-medium text-slate-600">
                  Expira en: {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </>
        )}


        {status === 'scanned' && (
          <>
            <div className="w-11 h-11 bg-emerald-50 ring-1 ring-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-emerald-800">Código escaneado</h3>
            <p className="text-[13px] text-slate-500">Autoriza la conexión en tu teléfono</p>
          </>
        )}


        {status === 'used' && (
          <>
            <div className="w-11 h-11 bg-emerald-50 ring-1 ring-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2 animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-emerald-800">Conectado exitosamente</h3>
            <p className="text-[13px] text-slate-500">Tu WhatsApp está ahora vinculado</p>
          </>
        )}


        {status === 'expired' && (
          <>
            <div className="w-11 h-11 bg-rose-50 ring-1 ring-rose-100 rounded-xl flex items-center justify-center mx-auto mb-2">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-base font-semibold text-rose-800">Código QR expirado</h3>
            <p className="text-[13px] text-slate-500 mb-4">El código ha expirado. Genera uno nuevo</p>
            <button
              onClick={generateQRCode}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 shadow-sm shadow-violet-600/20 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Generar nuevo QR
            </button>
          </>
        )}
      </div>


      {/* URL alternativa */}
      {status === 'pending' && (
        <div className="mt-4 p-4 bg-slate-50 ring-1 ring-slate-200/80 rounded-xl max-w-sm w-full">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-2">O abre esta URL en tu teléfono</p>
          <code className="text-[12px] text-violet-600 break-all block text-center">{qrData.qrUrl}</code>
        </div>
      )}
    </div>
  );
}