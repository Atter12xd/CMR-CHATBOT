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
  Trash2
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
  const supabase = createClient();

  useEffect(() => {
    loadIntegration();
  }, [organizationId]);

  const loadIntegration = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('whatsapp_integrations')
        .select('*')
        .eq('organization_id', organizationId)
        .single();

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
        .single();

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
      setStep('connected');
    } catch (err: any) {
      console.error('Error verifying code:', err);
      setError(err.message || 'Error al verificar el código');
    } finally {
      setConnecting(false);
    }
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
      {step === 'verification' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verificar Número</h3>
          
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest"
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
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleVerifyCode}
                disabled={connecting || verificationCode.length !== 6}
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
        </div>
      )}

      {/* Conectado */}
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
    </div>
  );
}

