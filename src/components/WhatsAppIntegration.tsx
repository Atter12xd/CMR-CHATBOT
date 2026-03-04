import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  TrendingUp,
  QrCode,
  Send,
} from 'lucide-react';
import { createClient } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { generateBaileysQR, getBaileysStatus, disconnectBaileys } from '../services/whatsapp-baileys';

type WhatsAppIntegration = Database['public']['Tables']['whatsapp_integrations']['Row'];
type IntegrationStatus = WhatsAppIntegration['status'];

interface WhatsAppIntegrationProps {
  organizationId: string;
}

export default function WhatsAppIntegration({ organizationId }: WhatsAppIntegrationProps) {
  const [integration, setIntegration] = useState<WhatsAppIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [step, setStep] = useState<'input' | 'connected' | 'qr'>('input');
  const [error, setError] = useState<string | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    messagesSentToday: 0,
    messagesReceivedToday: 0,
    deliveryRate: 0,
    readRate: 0,
    avgResponseTime: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadIntegration();
    loadMetrics();
  }, [organizationId]);

  // Paso QR: POST devuelve al instante; el QR llega por polling a GET /status (evita 504/CORS).
  useEffect(() => {
    if (step !== 'qr' || !organizationId) return;

    let cancelled = false;

    (async () => {
      setConnecting(true);
      setError(null);
      setQrImage(null);
      try {
        const data = await generateBaileysQR(organizationId);
        if (cancelled) return;

        if (data.status === 'already_connected') {
          const status = await getBaileysStatus(organizationId);
          if (status.status === 'connected' && status.phoneNumber) {
            await supabase.from('whatsapp_integrations').upsert({
              organization_id: organizationId,
              phone_number: status.phoneNumber,
              status: 'connected',
              verified_at: new Date().toISOString(),
            }, { onConflict: 'organization_id' });
          }
          setStep('connected');
          loadIntegration();
          setConnecting(false);
          return;
        }

        const status = await getBaileysStatus(organizationId);
        if (cancelled) return;

        if (status.status === 'connected' && status.phoneNumber) {
          await supabase.from('whatsapp_integrations').upsert({
            organization_id: organizationId,
            phone_number: status.phoneNumber,
            status: 'connected',
            verified_at: new Date().toISOString(),
          }, { onConflict: 'organization_id' });
          setStep('connected');
          loadIntegration();
          setConnecting(false);
          return;
        }

        if (status.qrCode) setQrImage(status.qrCode);
        setConnecting(false);

        pollIntervalRef.current = setInterval(async () => {
          if (cancelled) return;
          try {
            const st = await getBaileysStatus(organizationId);
            if (st.qrCode) setQrImage(st.qrCode);
            if (st.status === 'connected' && st.phoneNumber) {
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
              await supabase.from('whatsapp_integrations').upsert({
                organization_id: organizationId,
                phone_number: st.phoneNumber,
                status: 'connected',
                verified_at: new Date().toISOString(),
              }, { onConflict: 'organization_id' });
              setStep('connected');
              setQrImage(null);
              loadIntegration();
            }
          } catch {
            // seguir intentando
          }
        }, 1000);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Error al generar QR');
        setConnecting(false);
      }
    })();

    return () => {
      cancelled = true;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [step, organizationId]);

  const loadIntegration = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('whatsapp_integrations')
        .select('*')
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        if (data.status === 'disconnected') {
          setIntegration(null);
          setStep('input');
        } else {
          setIntegration(data);
          setStep(data.status === 'connected' ? 'connected' : 'input');
        }
      } else {
        setIntegration(null);
        setStep('input');
      }
    } catch (err: any) {
      console.error('Error loading integration:', err);
      setError(err.message || 'Error al cargar la integración');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('¿Estás seguro de desconectar WhatsApp? Esto detendrá la recepción de mensajes.')) {
      return;
    }

    try {
      setConnecting(true);
      setError(null);
      await disconnectBaileys(organizationId);
      await supabase
        .from('whatsapp_integrations')
        .update({ status: 'disconnected' })
        .eq('organization_id', organizationId);
      await loadIntegration();
      setIntegration(null);
      setStep('input');
    } catch (err: any) {
      console.error('Error disconnecting:', err);
      setError(err.message || 'Error al desconectar');
    } finally {
      setConnecting(false);
    }
  };

  const getStatusIcon = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 size={20} className="text-green-500" />;
      case 'pending':
        return <Loader2 size={20} className="text-yellow-500 animate-spin" />;
      case 'error':
        return <XCircle size={20} className="text-red-500" />;
      case 'disconnected':
        return <XCircle size={20} className="text-gray-400" />;
      default:
        return <AlertCircle size={20} className="text-gray-400" />;
    }
  };

  const getStatusText = (status: IntegrationStatus) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'pending':
        return 'Pendiente de verificación';
      case 'error':
        return 'Error de conexión';
      case 'disconnected':
        return 'Desconectado';
      default:
        return 'No conectado';
    }
  };

  const loadMetrics = async () => {
    try {
      setLoadingMetrics(true);
      
      // Obtener fecha de hoy (inicio del día)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Obtener chats de WhatsApp de esta organización
      const { data: chats } = await supabase
        .from('chats')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('platform', 'whatsapp');

      if (!chats || chats.length === 0) {
        return;
      }

      const chatIds = chats.map(c => c.id);

      // Contar mensajes enviados hoy
      const { count: sentCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('chat_id', chatIds)
        .eq('sender', 'agent')
        .gte('created_at', todayISO);

      // Contar mensajes recibidos hoy
      const { count: receivedCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('chat_id', chatIds)
        .eq('sender', 'user')
        .gte('created_at', todayISO);

      // Calcular tasa de entrega (mensajes delivered o read / total enviados)
      const { data: sentMessages } = await supabase
        .from('messages')
        .select('status')
        .in('chat_id', chatIds)
        .eq('sender', 'agent')
        .gte('created_at', todayISO);

      let deliveryRate = 0;
      let readRate = 0;
      
      if (sentMessages && sentMessages.length > 0) {
        const deliveredCount = sentMessages.filter(m => 
          m.status === 'delivered' || m.status === 'read'
        ).length;
        const readCount = sentMessages.filter(m => m.status === 'read').length;
        
        deliveryRate = (deliveredCount / sentMessages.length) * 100;
        readRate = (readCount / sentMessages.length) * 100;
      }

      // Calcular tiempo promedio de respuesta (últimos 10 mensajes)
      const { data: recentUserMessages } = await supabase
        .from('messages')
        .select('created_at, chat_id')
        .in('chat_id', chatIds)
        .eq('sender', 'user')
        .order('created_at', { ascending: false })
        .limit(10);

      let avgResponseTime = 0;
      if (recentUserMessages && recentUserMessages.length > 0) {
        const responseTimes: number[] = [];
        
        for (const userMsg of recentUserMessages) {
          // Buscar la siguiente respuesta del agente
          const { data: agentResponse } = await supabase
            .from('messages')
            .select('created_at')
            .eq('chat_id', userMsg.chat_id)
            .eq('sender', 'agent')
            .gt('created_at', userMsg.created_at)
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();

          if (agentResponse) {
            const userTime = new Date(userMsg.created_at).getTime();
            const agentTime = new Date(agentResponse.created_at).getTime();
            const diff = (agentTime - userTime) / 1000 / 60; // minutos
            responseTimes.push(diff);
          }
        }

        if (responseTimes.length > 0) {
          avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        }
      }

      setMetrics({
        messagesSentToday: sentCount || 0,
        messagesReceivedToday: receivedCount || 0,
        deliveryRate: Math.round(deliveryRate),
        readRate: Math.round(readRate),
        avgResponseTime: Math.round(avgResponseTime),
      });
    } catch (err: any) {
      console.error('Error cargando métricas:', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estado actual - Solo mostrar si está conectado o pendiente */}
      {integration && integration.status !== 'disconnected' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">WhatsApp Business</h3>
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">Número conectado:</span>{' '}
                  {integration.phone_number}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(integration.status)}
              <span className="text-sm font-medium text-gray-700">
                {getStatusText(integration.status)}
              </span>
            </div>
          </div>

          {integration.status === 'connected' && (
            <>
              {/* Información básica */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p>Conectado desde: {new Date(integration.verified_at || '').toLocaleDateString()}</p>
                    {integration.last_sync_at && (
                      <p>Última sincronización: {new Date(integration.last_sync_at).toLocaleString()}</p>
                    )}
                  </div>
                  <button
                    onClick={handleDisconnect}
                    disabled={connecting}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                    <span>Desconectar</span>
                  </button>
                </div>
              </div>

            </>
          )}

          {integration.error_message && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{integration.error_message}</p>
            </div>
          )}
        </div>
      )}

      {/* Formulario de conexión - Mostrar si no hay integración o está desconectado */}
      {(step === 'input' && (!integration || integration.status === 'disconnected')) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conectar WhatsApp</h3>
          <p className="text-sm text-gray-600 mb-4">
            Conecta tu WhatsApp escaneando el código QR desde tu teléfono. Usamos el servidor Contabo (Baileys), sin depender de Meta/Facebook.
          </p>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <button
            onClick={() => { setError(null); setStep('qr'); }}
            disabled={connecting}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-semibold"
          >
            <QrCode size={20} />
            <span>Generar QR y conectar</span>
          </button>
        </div>
      )}

      {/* Paso QR: mostrar imagen y polling (Baileys / Contabo) */}
      {step === 'qr' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Escanear código QR</h3>
            <button
              onClick={() => { setStep('input'); setError(null); setQrImage(null); }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Volver
            </button>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {(connecting || (!qrImage && !error)) && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              <span className="text-gray-700 font-medium">
                {connecting ? 'Conectando con WhatsApp...' : 'Esperando código QR...'}
              </span>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                La conexión puede tardar 1–2 minutos. Si no aparece el QR, pulsa Volver e intenta de nuevo.
              </p>
            </div>
          )}
          {qrImage && (
            <div className="text-center">
              <img src={qrImage} alt="QR WhatsApp" className="mx-auto mb-4 max-w-[280px]" />
              <p className="text-gray-600 text-sm">
                Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo
              </p>
              <p className="text-gray-500 text-xs mt-2">Escanea el código con tu teléfono</p>
            </div>
          )}
        </div>
      )}

      {/* Conectado - Mensaje de éxito */}
      {step === 'connected' && integration?.status === 'connected' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle2 size={24} className="text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">¡WhatsApp conectado exitosamente!</h3>
              <p className="text-sm text-green-700 mt-1">
                Tu número {integration.phone_number} está conectado y listo para recibir mensajes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Métricas en tiempo real */}
      {integration?.status === 'connected' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp size={20} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Métricas de Hoy</h3>
            </div>
            <button
              onClick={loadMetrics}
              disabled={loadingMetrics}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              title="Actualizar métricas"
            >
              <RefreshCw size={16} className={`text-gray-500 ${loadingMetrics ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingMetrics ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Mensajes enviados */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Send size={16} className="text-blue-600" />
                  <span className="text-xs font-medium text-blue-600">Enviados</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{metrics.messagesSentToday}</p>
                <p className="text-xs text-blue-600 mt-1">mensajes</p>
              </div>

              {/* Mensajes recibidos */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageCircle size={16} className="text-green-600" />
                  <span className="text-xs font-medium text-green-600">Recibidos</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{metrics.messagesReceivedToday}</p>
                <p className="text-xs text-green-600 mt-1">mensajes</p>
              </div>

              {/* Tasa de entrega */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle2 size={16} className="text-purple-600" />
                  <span className="text-xs font-medium text-purple-600">Entrega</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{metrics.deliveryRate}%</p>
                <p className="text-xs text-purple-600 mt-1">tasa</p>
              </div>

              {/* Tasa de lectura */}
              <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Eye size={16} className="text-cyan-600" />
                  <span className="text-xs font-medium text-cyan-600">Lectura</span>
                </div>
                <p className="text-2xl font-bold text-cyan-900">{metrics.readRate}%</p>
                <p className="text-xs text-cyan-600 mt-1">tasa</p>
              </div>

              {/* Tiempo de respuesta */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock size={16} className="text-orange-600" />
                  <span className="text-xs font-medium text-orange-600">Respuesta</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">
                  {metrics.avgResponseTime > 0 ? metrics.avgResponseTime : '-'}
                </p>
                <p className="text-xs text-orange-600 mt-1">minutos</p>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 flex items-center space-x-1">
              <Info size={12} />
              <span>Las métricas se actualizan cada vez que recargues esta página o hagas clic en el botón de actualizar.</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

