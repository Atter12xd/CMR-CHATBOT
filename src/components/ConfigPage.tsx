import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, CreditCard, ExternalLink } from 'lucide-react';
import { useOrganization } from '../hooks/useOrganization';
import { createClient } from '../lib/supabase';
import WhatsAppIntegration from './WhatsAppIntegration';
import CreateOrganizationButton from './CreateOrganizationButton';


export default function ConfigPage() {
  const { organizationId, loading, refetch: loadOrganization } = useOrganization();
  const [oauthStatus, setOauthStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);


  // Verificar parámetros de URL para mensajes de OAuth
  useEffect(() => {
    if (typeof window === 'undefined') return;


    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const connected = urlParams.get('connected');


    if (success && connected) {
      setOauthStatus({
        type: 'success',
        message: '¡WhatsApp conectado exitosamente vía Facebook!',
      });
      // Limpiar URL
      window.history.replaceState({}, '', '/configuracion');
    } else if (error) {
      setOauthStatus({
        type: 'error',
        message: decodeURIComponent(error),
      });
      // Limpiar URL
      window.history.replaceState({}, '', '/configuracion');
    }
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
      </div>
    );
  }


  if (!organizationId) {
    return (
      <div className="space-y-6 max-w-3xl">
        {/* Encabezado */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Ajustes
            </p>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
          <p className="text-sm text-slate-500 mt-1">Gestiona la configuración de tu CRM</p>
        </div>

        {/* Aviso organización */}
        <div className="bg-violet-50 border border-violet-200/60 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
              <svg className="h-4.5 w-4.5 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-violet-900 mb-1">
                Organización no encontrada
              </h3>
              <p className="text-sm text-violet-700/80 mb-4 leading-relaxed">
                Necesitas crear una organización para usar las integraciones. Esto se hace automáticamente al registrarte, pero parece que no se creó.
              </p>
              <CreateOrganizationButton onCreated={loadOrganization} />
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6 max-w-3xl">
      {/* Encabezado */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-violet-500"></span>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Ajustes
          </p>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="text-sm text-slate-500 mt-1">Gestiona la configuración de tu CRM</p>
      </div>

      {/* Tarjeta de WhatsApp */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Header de la tarjeta */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 ring-1 ring-emerald-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.61.61l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.607-.798-6.379-2.145l-.292-.222-3.025 1.01 1.01-3.025-.222-.292A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">WhatsApp Business</h2>
              <p className="text-[13px] text-slate-500 mt-0.5">
                Conecta tu número de WhatsApp Business para recibir y enviar mensajes desde tu CRM
              </p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Mensaje de OAuth */}
          {oauthStatus && (
            <div className={`mb-6 p-4 rounded-xl border ${
              oauthStatus.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200/60' 
                : 'bg-rose-50 border-rose-200/60'
            }`}>
              <div className="flex items-center gap-2.5">
                {oauthStatus.type === 'success' ? (
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4.5 w-4.5 text-rose-600 flex-shrink-0" />
                )}
                <p className={`text-sm font-medium ${
                  oauthStatus.type === 'success' ? 'text-emerald-800' : 'text-rose-800'
                }`}>
                  {oauthStatus.message}
                </p>
              </div>
            </div>
          )}


          {/* WhatsApp Integration */}
          <WhatsAppIntegration organizationId={organizationId} />
        </div>
      </div>

      {/* Facturación / Cancelar suscripción */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-50 ring-1 ring-violet-100 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Facturación y suscripción</h2>
              <p className="text-[13px] text-slate-500 mt-0.5">
                Actualiza tu método de pago, descarga facturas o cancela tu suscripción cuando quieras
              </p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            Si cancelas, dejarás de tener acceso al final del periodo de facturación. Si vuelves a suscribirte con el mismo correo, no tendrás de nuevo los 14 días gratis.
          </p>
          <button
            type="button"
            onClick={async () => {
              setPortalLoading(true);
              try {
                const { data: { session } } = await createClient().auth.getSession();
                if (!session?.access_token) {
                  alert('Inicia sesión para gestionar tu suscripción.');
                  return;
                }
                const res = await fetch('/api/create-billing-portal-session', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${session.access_token}` },
                });
                const data = await res.json().catch(() => ({}));
                if (data.url) {
                  window.location.href = data.url;
                  return;
                }
                alert(data.error || 'No se pudo abrir el portal de facturación.');
              } catch (e) {
                alert('Error de conexión. Intenta de nuevo.');
              } finally {
                setPortalLoading(false);
              }
            }}
            disabled={portalLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-sm disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {portalLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Abriendo...
              </>
            ) : (
              <>
                Gestionar suscripción (cancelar, tarjeta, facturas)
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}