import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, CreditCard, ExternalLink, AlertCircle } from 'lucide-react';
import { useOrganization } from '../hooks/useOrganization';
import { createClient } from '../lib/supabase';
import WhatsAppIntegration from './WhatsAppIntegration';
import ShopifyIntegration from './ShopifyIntegration';
import CreateOrganizationButton from './CreateOrganizationButton';
import PageHeader from './PageHeader';

const sectionMotion = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 32 },
  },
};

export default function ConfigPage() {
  const { organizationId, loading, refetch: loadOrganization } = useOrganization();
  const [oauthStatus, setOauthStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');
    const connected = urlParams.get('connected');

    if (success && connected) {
      setOauthStatus({
        type: 'success',
        message: '¡WhatsApp conectado correctamente vía Facebook!',
      });
      window.history.replaceState({}, '', '/configuracion');
    } else if (error) {
      setOauthStatus({
        type: 'error',
        message: decodeURIComponent(error),
      });
      window.history.replaceState({}, '', '/configuracion');
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] font-professional">
        <div className="flex flex-col items-center gap-3">
          <div className="app-spinner">
            <Loader2 size={20} className="animate-spin text-brand-500" />
          </div>
          <p className="text-[14px] text-app-muted">Cargando configuración…</p>
        </div>
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="space-y-5 max-w-3xl font-professional">
        <PageHeader
          eyebrow="Ajustes"
          title="Configuración"
          description="Gestiona integraciones y facturación de tu organización."
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-app-line bg-white overflow-hidden shadow-app-card"
        >
          <div className="px-5 py-4 sm:px-6 bg-app-field/70 border-b border-app-line flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white border border-app-line text-amber-600 shrink-0 shadow-sm">
              <AlertCircle className="size-[18px]" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-app-ink tracking-tight">Organización no encontrada</h3>
              <p className="text-[12px] text-app-muted mt-0.5 font-medium">
                Crea una organización para usar integraciones y el panel completo
              </p>
            </div>
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-[14px] text-app-muted mb-5 leading-relaxed">
              Suele crearse al registrarte. Si no aparece, puedes crearla aquí y seguir con WhatsApp y el resto del CRM.
            </p>
            <CreateOrganizationButton onCreated={loadOrganization} />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl font-professional">
      <PageHeader
        eyebrow="Ajustes"
        title="Configuración"
        description="Gestiona integraciones y facturación de tu organización."
      />

      <motion.div variants={sectionMotion} initial="hidden" animate="show" className="rounded-2xl border border-app-line bg-white overflow-hidden shadow-app-card">
        <div className="px-5 py-4 sm:px-6 bg-app-field/70 border-b border-app-line">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white border border-app-line text-emerald-600 shrink-0 shadow-sm">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.61.61l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.387 0-4.607-.798-6.379-2.145l-.292-.222-3.025 1.01 1.01-3.025-.222-.292A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-[16px] font-semibold text-app-ink tracking-tight font-display">WhatsApp Business</h2>
              <p className="text-[13px] text-app-muted mt-0.5 leading-snug">
                Conecta tu número para recibir y enviar mensajes desde el panel
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {oauthStatus && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-xl border ${
                oauthStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/25'
                  : 'bg-rose-500/10 border-rose-500/25'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {oauthStatus.type === 'success' ? (
                  <CheckCircle2 className="size-[18px] text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="size-[18px] text-rose-500 shrink-0" />
                )}
                <p
                  className={`text-[14px] font-medium ${
                    oauthStatus.type === 'success' ? 'text-emerald-800' : 'text-rose-700'
                  }`}
                >
                  {oauthStatus.message}
                </p>
              </div>
            </motion.div>
          )}

          <WhatsAppIntegration organizationId={organizationId} />
        </div>
      </motion.div>

      <motion.div
        variants={sectionMotion}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.06 }}
        className="rounded-2xl border border-app-line bg-white overflow-hidden shadow-app-card"
      >
        <div className="px-5 py-4 sm:px-6 bg-app-field/70 border-b border-app-line">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white border border-app-line text-brand-600 shrink-0 shadow-sm">
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M15.337 2.01a1 1 0 011 1v2.035c0 .23.079.454.224.633l1.207 1.49a1 1 0 00.776.37h2.45a1 1 0 01.78 1.625l-1.82 2.307a1 1 0 00-.14.93l.972 2.595a1 1 0 01-1.25 1.282l-2.685-.845a1 1 0 00-.947.176l-2.15 1.612a1 1 0 01-1.594-.801v-2.62a1 1 0 00-.408-.806l-2.105-1.548a1 1 0 01.078-1.662l2.256-1.422a1 1 0 00.453-.846V3.01a1 1 0 011-1h2.753z" />
                  <path d="M4.5 6A2.5 2.5 0 002 8.5v8A2.5 2.5 0 004.5 19h5.085a6.5 6.5 0 01-.66-2H4.5a.5.5 0 01-.5-.5v-8a.5.5 0 01.5-.5h4.425A6.5 6.5 0 019.585 6H4.5z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-semibold text-app-ink tracking-tight font-display">Integración Shopify</h2>
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-brand-500/10 text-brand-700 border border-brand-500/20">
                    Nuevo
                  </span>
                </div>
                <p className="text-[13px] text-app-muted mt-0.5 leading-snug">
                  Conecta tu tienda para traer productos, fotos, precios e información comercial al CRM
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <ShopifyIntegration organizationId={organizationId} />
        </div>
      </motion.div>

      <motion.div
        variants={sectionMotion}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-app-line bg-white overflow-hidden shadow-app-card"
      >
        <div className="px-5 py-4 sm:px-6 bg-app-field/70 border-b border-app-line">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white border border-app-line text-brand-600 shrink-0 shadow-sm">
              <CreditCard className="size-5" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[16px] font-semibold text-app-ink tracking-tight font-display">Facturación y suscripción</h2>
              <p className="text-[13px] text-app-muted mt-0.5 leading-snug">
                Tarjeta, facturas y cancelación cuando lo necesites
              </p>
            </div>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <p className="text-[14px] text-app-muted mb-5 leading-relaxed">
            Si cancelas, perderás el acceso al final del periodo pagado. Si vuelves a suscribirte con el mismo correo,{' '}
            <strong className="text-app-ink">no</strong> se vuelven a aplicar 14 días gratis.
          </p>
          <motion.button
            type="button"
            onClick={async () => {
              setPortalLoading(true);
              try {
                const {
                  data: { session },
                } = await createClient().auth.getSession();
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
              } catch {
                alert('Error de conexión. Intenta de nuevo.');
              } finally {
                setPortalLoading(false);
              }
            }}
            disabled={portalLoading}
            whileTap={{ scale: portalLoading ? 1 : 0.98 }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold bg-app-charcoal text-white hover:bg-black shadow-md disabled:opacity-60 transition-colors w-full sm:w-auto"
          >
            {portalLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Abriendo…
              </>
            ) : (
              <>
                Gestionar suscripción
                <ExternalLink className="size-4" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
