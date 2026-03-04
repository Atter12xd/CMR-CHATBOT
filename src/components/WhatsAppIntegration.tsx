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
  MessageCircle,
  Eye,
  Clock,
  Info,
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


  const getStatusBadge = (status: IntegrationStatus) => {
    const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      connected: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Conectado' },
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pendiente' },
      error: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Error' },
      disconnected: { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400', label: 'Desconectado' },
    };
    const c = config[status] || config.disconnected;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${c.bg} ${c.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
        {c.label}
      </span>
    );
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
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
      </div>
    );
  }


  const metricCards = [
    { label: 'Enviados', value: metrics.messagesSentToday, suffix: 'msgs', icon: Send, color: 'violet' },
    { label: 'Recibidos', value: metrics.messagesReceivedToday, suffix: 'msgs', icon: MessageCircle, color: 'emerald' },
    { label: 'Entrega', value: `${metrics.deliveryRate}%`, suffix: 'tasa', icon: CheckCircle2, color: 'violet' },
    { label: 'Lectura', value: `${metrics.readRate}%`, suffix: 'tasa', icon: Eye, color: 'amber' },
    { label: 'Respuesta', value: metrics.avgResponseTime > 0 ? metrics.avgResponseTime : '-', suffix: 'min', icon: Clock, color: 'rose' },
  ];

  const colorMap: Record<string, { bg: string; iconColor: string; ring: string; valueTxt: string }> = {
    violet: { bg: 'bg-violet-50', iconColor: 'text-violet-600', ring: 'ring-violet-100', valueTxt: 'text-violet-900' },
    emerald: { bg: 'bg-emerald-50', iconColor: 'text-emerald-600', ring: 'ring-emerald-100', valueTxt: 'text-emerald-900' },
    amber: { bg: 'bg-amber-50', iconColor: 'text-amber-600', ring: 'ring-amber-100', valueTxt: 'text-amber-900' },
    rose: { bg: 'bg-rose-50', iconColor: 'text-rose-600', ring: 'ring-rose-100', valueTxt: 'text-rose-900' },
  };


  return (
    <div className="space-y-5">
      {/* Estado actual - Solo mostrar si está conectado o pendiente */}
      {integration && integration.status !== 'disconnected' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 bg-emerald-50 ring-1 ring-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.61.61l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.607-.798-6.379-2.145l-.292-.222-3.025 1.01 1.01-3.025-.222-.292A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">WhatsApp Business</h3>
                  <p className="text-[13px] text-slate-500 mt-0.5">
                    Número: <span className="font-medium text-slate-700">{integration.phone_number}</span>
                  </p>
                </div>
              </div>
              {getStatusBadge(integration.status)}
            </div>


            {integration.status === 'connected' && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] text-slate-500 space-y-0.5">
                    <p>Conectado desde: <span className="text-slate-700">{new Date(integration.verified_at || '').toLocaleDateString()}</span></p>
                    {integration.last_sync_at && (
                      <p>Última sincronización: <span className="text-slate-700">{new Date(integration.last_sync_at).toLocaleString()}</span></p>
                    )}
                  </div>
                  <button
                    onClick={handleDisconnect}
                    disabled={connecting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    <span>Desconectar</span>
                  </button>
                </div>
              </div>
            )}


            {integration.error_message && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200/60 rounded-xl">
                <p className="text-sm text-rose-700">{integration.error_message}</p>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Formulario de conexión - Mostrar si no hay integración o está desconectado */}
      {(step === 'input' && (!integration || integration.status === 'disconnected')) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Conexión</p>
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1.5">Conectar WhatsApp</h3>
          <p className="text-[13px] text-slate-500 mb-5 leading-relaxed">
            Conecta tu WhatsApp escaneando el código QR desde tu teléfono. Usamos el servidor Contabo (Baileys), sin depender de Meta/Facebook.
          </p>
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200/60 rounded-xl mb-4">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}
          <button
            onClick={() => { setError(null); setStep('qr'); }}
            disabled={connecting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 font-semibold text-sm"
          >
            <QrCode size={18} />
            <span>Generar QR y conectar</span>
          </button>
        </div>
      )}


      {/* Paso QR: mostrar imagen y polling (Baileys / Contabo) */}
      {step === 'qr' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-violet-500"></span>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Verificación</p>
              </div>
              <h3 className="text-base font-semibold text-slate-900">Escanear código QR</h3>
            </div>
            <button
              onClick={() => { setStep('input'); setError(null); setQrImage(null); }}
              className="text-[13px] font-medium text-slate-500 hover:text-slate-800 px-3 py-1.5 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Volver
            </button>
          </div>
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200/60 rounded-xl mb-4">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}
          {(connecting || (!qrImage && !error)) && (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="w-12 h-12 bg-emerald-50 ring-1 ring-emerald-100 rounded-2xl flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                {connecting ? 'Conectando con WhatsApp...' : 'Esperando código QR...'}
              </span>
              <p className="text-[13px] text-slate-400 text-center max-w-sm leading-relaxed">
                La conexión puede tardar 1–2 minutos. Si no aparece el QR, pulsa Volver e intenta de nuevo.
              </p>
            </div>
          )}
          {qrImage && (
            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 mb-4">
                <img src={qrImage} alt="QR WhatsApp" className="max-w-[260px]" />
              </div>
              <p className="text-sm text-slate-600 font-medium">
                Abre WhatsApp → Dispositivos vinculados → Vincular dispositivo
              </p>
              <p className="text-[12px] text-slate-400 mt-1.5">Escanea el código con tu teléfono</p>
            </div>
          )}
        </div>
      )}


      {/* Conectado - Mensaje de éxito */}
      {step === 'connected' && integration?.status === 'connected' && (
        <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-emerald-900">WhatsApp conectado exitosamente</h3>
              <p className="text-[13px] text-emerald-700/80 mt-0.5">
                Tu número {integration.phone_number} está conectado y listo para recibir mensajes.
              </p>
            </div>
          </div>
        </div>
      )}


      {/* Métricas en tiempo real */}
      {integration?.status === 'connected' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-violet-50 ring-1 ring-violet-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-violet-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Métricas de Hoy</h3>
            </div>
            <button
              onClick={loadMetrics}
              disabled={loadingMetrics}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
              title="Actualizar métricas"
            >
              <RefreshCw size={15} className={`text-slate-400 ${loadingMetrics ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="p-5">
            {loadingMetrics ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {metricCards.map((m) => {
                  const c = colorMap[m.color] || colorMap.violet;
                  const Icon = m.icon;
                  return (
                    <div key={m.label} className={`${c.bg} ring-1 ${c.ring} rounded-xl p-4`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon size={14} className={c.iconColor} />
                        <span className={`text-[11px] font-semibold uppercase tracking-wider ${c.iconColor}`}>{m.label}</span>
                      </div>
                      <p className={`text-2xl font-bold ${c.valueTxt}`}>{m.value}</p>
                      <p className={`text-[11px] ${c.iconColor} mt-0.5`}>{m.suffix}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Info size={11} />
                <span>Las métricas se actualizan cada vez que recargues esta página o hagas clic en actualizar.</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}