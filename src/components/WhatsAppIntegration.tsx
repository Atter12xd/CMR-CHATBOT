import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  Phone, 
  Key, 
  ExternalLink,
  RefreshCw,
  Trash2,
  Activity,
  Send,
  MessageCircle,
  Eye,
  Clock,
  TrendingUp,
  Info
} from 'lucide-react';
import { createClient } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type WhatsAppIntegration = Database['public']['Tables']['whatsapp_integrations']['Row'];
type IntegrationStatus = WhatsAppIntegration['status'];

interface WhatsAppIntegrationProps {
  organizationId: string;
}

export default function WhatsAppIntegration({ organizationId }: WhatsAppIntegrationProps) {
  const [integration, setIntegration] = useState<WhatsAppIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [step, setStep] = useState<'input' | 'verification' | 'connected'>('input');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    messagesSentToday: 0,
    messagesReceivedToday: 0,
    deliveryRate: 0,
    readRate: 0,
    avgResponseTime: 0,
  });
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusCheckCount, setStatusCheckCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    loadIntegration();
    loadMetrics();
  }, [organizationId]);

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
        setIntegration(data);
        if (data.status === 'connected') {
          setStep('connected');
        } else if (data.status === 'pending') {
          setStep('verification');
        }
      }
    } catch (err: any) {
      console.error('Error loading integration:', err);
      setError(err.message || 'Error al cargar la integración');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWithFacebook = () => {
    // Construir URL de OAuth de Facebook
    const appId = '1697684594201061'; // Tu App ID de Facebook
    const redirectUri = `${window.location.origin}/api/auth/facebook/callback`;
    // Usar URL de Supabase directamente (debe configurarse en Facebook App)
    const supabaseCallbackUri = 'https://fsnolvozwcnbyuradiru.supabase.co/functions/v1/whatsapp-oauth-callback';
    
    // Scopes necesarios para WhatsApp Business API
    const scopes = [
      'business_management',
      'whatsapp_business_management',
      'whatsapp_business_messaging',
    ].join(',');

    // State contiene el organizationId para identificarlo en el callback
    const state = encodeURIComponent(organizationId);

    // URL de autorización de Facebook
    const facebookAuthUrl = `https://www.facebook.com/v21.0/dialog/oauth?` +
      `client_id=${appId}&` +
      `redirect_uri=${encodeURIComponent(supabaseCallbackUri)}&` +
      `scope=${scopes}&` +
      `state=${state}&` +
      `response_type=code`;

    // Redirigir a Facebook OAuth
    window.location.href = facebookAuthUrl;
  };

  const handleStartConnection = async () => {
    if (!phoneNumber.trim()) {
      setError('Por favor ingresa un número de teléfono');
      return;
    }

    // Validar formato de número (debe incluir código de país)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Formato inválido. Usa formato internacional: +51987654321');
      return;
    }

    try {
      setConnecting(true);
      setError(null);

      // Llamar a Edge Function para iniciar el proceso
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      const { requestVerificationCode } = await import('../services/whatsapp-integration');
      const result = await requestVerificationCode({
        organizationId,
        phoneNumber: phoneNumber.trim(),
      });

      // Crear o actualizar integración en BD
      const { data: integrationData, error: dbError } = await supabase
        .from('whatsapp_integrations')
        .upsert({
          organization_id: organizationId,
          phone_number: phoneNumber.trim(),
          status: 'pending',
        }, {
          onConflict: 'organization_id',
        })
        .select()
        .maybeSingle();

      if (dbError) throw dbError;

      setIntegration(integrationData);
      setStep('verification');
    } catch (err: any) {
      console.error('Error starting connection:', err);
      setError(err.message || 'Error al iniciar la conexión');
    } finally {
      setConnecting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setError('Por favor ingresa un código de 6 dígitos');
      return;
    }

    try {
      setConnecting(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      const { verifyCode } = await import('../services/whatsapp-integration');
      await verifyCode({
        organizationId,
        phoneNumber,
        code: verificationCode.trim(),
      });

      // Actualizar integración
      await loadIntegration();
      
      // Verificar estado actualizado
      const { data: updatedIntegration } = await supabase
        .from('whatsapp_integrations')
        .select('*')
        .eq('organization_id', organizationId)
        .maybeSingle();
      
      if (updatedIntegration?.status === 'pending') {
        startStatusPolling();
      } else {
        setStep('connected');
      }
    } catch (err: any) {
      console.error('Error verifying code:', err);
      setError(err.message || 'Error al verificar el código');
    } finally {
      setConnecting(false);
    }
  };

  // Polling del estado del número después de verificar código
  const startStatusPolling = async () => {
    setCheckingStatus(true);
    setStatusCheckCount(0);
    
    const maxAttempts = 20; // Máximo 20 intentos (10 minutos con intervalos de 30s)
    let attempts = 0;
    
    const checkStatus = async () => {
      try {
        attempts++;
        setStatusCheckCount(attempts);
        
        const { checkNumberStatus } = await import('../services/whatsapp-integration');
        await checkNumberStatus(organizationId, integration?.phone_number_id || undefined);
        
        // Recargar integración para obtener estado actualizado
        await loadIntegration();
        const { data: currentIntegrationData } = await supabase
          .from('whatsapp_integrations')
          .select('*')
          .eq('organization_id', organizationId)
          .maybeSingle();
        
        const currentIntegration = currentIntegrationData;
        
        if (currentIntegration?.status === 'connected') {
          // ¡Conectado! Detener polling
          setCheckingStatus(false);
          setStep('connected');
          return;
        }
        
        // Si no está conectado y no hemos alcanzado el máximo, seguir intentando
        if (attempts < maxAttempts && currentIntegration?.status === 'pending') {
          setTimeout(checkStatus, 30000); // Esperar 30 segundos
        } else if (attempts >= maxAttempts) {
          // Límite alcanzado
          setCheckingStatus(false);
          setError('El número está tardando en activarse. Por favor recarga la página más tarde.');
        }
      } catch (err: any) {
        console.error('Error checking status:', err);
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 30000);
        } else {
          setCheckingStatus(false);
        }
      }
    };
    
    // Iniciar primer check después de 5 segundos
    setTimeout(checkStatus, 5000);
  };

  const handleDisconnect = async () => {
    if (!confirm('¿Estás seguro de desconectar WhatsApp? Esto detendrá la recepción de mensajes.')) {
      return;
    }

    try {
      setConnecting(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      const { disconnectWhatsApp } = await import('../services/whatsapp-integration');
      await disconnectWhatsApp({ organizationId });

      setIntegration(null);
      setStep('input');
      setPhoneNumber('');
      setVerificationCode('');
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
      {/* Estado actual */}
      {integration && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">WhatsApp Business</h3>
                <p className="text-sm text-gray-500">{integration.phone_number}</p>
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

              {/* Información técnica */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Info size={16} className="text-gray-500" />
                  <h4 className="text-sm font-semibold text-gray-900">Información Técnica</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {integration.phone_number_id && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Phone Number ID</p>
                      <p className="text-sm font-mono text-gray-900">{integration.phone_number_id}</p>
                    </div>
                  )}
                  {integration.business_account_id && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Business Account ID</p>
                      <p className="text-sm font-mono text-gray-900">{integration.business_account_id}</p>
                    </div>
                  )}
                  {integration.app_id && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">App ID</p>
                      <p className="text-sm font-mono text-gray-900">{integration.app_id}</p>
                    </div>
                  )}
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-green-600 mb-1 flex items-center space-x-1">
                      <Activity size={12} />
                      <span>Estado API</span>
                    </p>
                    <p className="text-sm font-semibold text-green-700">Activo</p>
                  </div>
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

      {/* Formulario de conexión */}
      {step === 'input' && !integration && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Conectar WhatsApp Business</h3>
          
          <div className="space-y-4">
            {/* Botón OAuth - Conectar con Facebook */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900 mb-3 font-medium">
                💡 Método Recomendado: Conecta tu cuenta de Meta Business
              </p>
              <button
                onClick={handleConnectWithFacebook}
                disabled={connecting}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {connecting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Conectar con Facebook</span>
                  </>
                )}
              </button>
              <p className="text-xs text-blue-700 mt-2">
                Conecta tu cuenta de Meta Business Manager para gestionar tus números de WhatsApp fácilmente
              </p>
            </div>

            {/* Separador */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O conecta manualmente</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+51987654321"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Usa formato internacional con código de país (ej: +51987654321)
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleStartConnection}
              disabled={connecting || !phoneNumber.trim()}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {connecting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <Key size={18} />
                  <span>Iniciar Conexión</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Verificación de código */}
      {(step === 'verification' || checkingStatus) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {checkingStatus ? 'Activando tu número...' : 'Verificar Número'}
          </h3>
          
          {checkingStatus ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Activando tu número, esto puede tomar hasta 2 minutos...
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Verificando estado ({statusCheckCount}/20)...
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((statusCheckCount / 20) * 100, 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Se ha enviado un código de verificación de 6 dígitos al número <strong>{phoneNumber}</strong>.
                  Por favor, ingresa el código recibido.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de verificación
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  disabled={checkingStatus}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setStep('input');
                    setVerificationCode('');
                    setError(null);
                  }}
                  disabled={checkingStatus}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleVerifyCode}
                  disabled={connecting || verificationCode.length !== 6 || checkingStatus}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {connecting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Verificando...
                    </span>
                  ) : (
                    'Verificar'
                  )}
                </button>
              </div>
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

