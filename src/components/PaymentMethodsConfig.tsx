import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  CreditCard,
  Smartphone,
  Building2,
  Landmark,
  Info,
  Loader2,
  CheckCircle2,
  CircleOff,
  Wallet,
} from 'lucide-react';
import type { PaymentMethod } from '../data/paymentMethods';
import { defaultPaymentMethods } from '../data/paymentMethods';
import { useOrganization } from '../hooks/useOrganization';
import { loadPaymentMethods, savePaymentMethods } from '../services/payment-methods';
import PageHeader from './PageHeader';
import StatsCard from './StatsCard';
import StatsCardSkeleton from './StatsCardSkeleton';

interface PaymentMethodsConfigProps {
  methods?: PaymentMethod[];
  onSave?: (methods: PaymentMethod[]) => void;
}

const fieldClass =
  'w-full px-3.5 py-2.5 text-sm bg-ref-muted border border-app-line rounded-ref text-app-ink placeholder:text-app-muted focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500/35 transition-all';

const statsContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const statsItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 30 },
  },
};

const methodCard = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 360, damping: 28 },
  },
};

function PaymentMethodCardSkeleton() {
  return (
    <div className="rounded-ref border border-app-line bg-ref-card p-5 animate-pulse shadow-sm">
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-xl bg-app-field shrink-0" />
        <div className="flex-1 space-y-3 min-w-0">
          <div className="h-4 w-48 max-w-full bg-app-field rounded-lg" />
          <div className="h-3 w-32 bg-app-field/80 rounded-md" />
          <div className="h-10 w-full bg-app-field rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
}

export default function PaymentMethodsConfig({
  methods: propsMethods,
  onSave: propsOnSave,
}: PaymentMethodsConfigProps) {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
    propsMethods?.length ? propsMethods : defaultPaymentMethods
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMethods = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const list = await loadPaymentMethods(organizationId);
      setPaymentMethods(list);
    } catch (err) {
      console.error('Error cargando métodos de pago:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (propsMethods?.length) {
      setPaymentMethods(propsMethods);
      setLoading(false);
      return;
    }
    if (!organizationId) {
      setLoading(false);
      return;
    }
    fetchMethods();
  }, [organizationId, propsMethods, fetchMethods]);

  const payStats = useMemo(() => {
    const active = paymentMethods.filter((m) => m.active).length;
    return {
      total: paymentMethods.length,
      active,
      inactive: paymentMethods.length - active,
    };
  }, [paymentMethods]);

  const handleChange = (id: string, field: keyof PaymentMethod, value: string | boolean) => {
    setPaymentMethods((prev) =>
      prev.map((method) => (method.id === id ? { ...method, [field]: value } : method))
    );
  };

  const handleSave = async () => {
    for (const m of paymentMethods) {
      if (!m.active) continue;
      if (!m.accountName?.trim()) {
        alert(`Completa «A nombre de» en ${m.name}.`);
        return;
      }
      if (m.type === 'bcp' || m.type === 'interbank') {
        const hasAhorros = Boolean(m.accountNumber?.trim());
        const hasCorriente = Boolean(m.accountNumberCorriente?.trim());
        if (!hasAhorros && !hasCorriente) {
          alert(`${m.name}: indica al menos un número de cuenta (ahorros y/o corriente).`);
          return;
        }
      }
    }

    if (propsOnSave) {
      propsOnSave(paymentMethods);
      alert('Métodos de pago guardados exitosamente');
      return;
    }
    if (!organizationId) {
      alert('No hay organización seleccionada');
      return;
    }
    setSaving(true);
    try {
      await savePaymentMethods(organizationId, paymentMethods);
      alert('Métodos de pago guardados exitosamente');
    } catch (err: any) {
      console.error('Error guardando métodos de pago:', err);
      alert(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const getIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'yape':
      case 'plin':
        return <Smartphone className="size-[18px] text-brand-500" />;
      case 'bcp':
        return <Building2 className="size-[18px] text-brand-600" />;
      case 'interbank':
        return <Landmark className="size-[18px] text-sky-600" />;
      default:
        return <CreditCard className="size-[18px] text-violet-500" />;
    }
  };

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] font-professional">
        <div className="flex flex-col items-center gap-3">
          <div className="app-spinner">
            <Loader2 size={20} className="animate-spin text-brand-500" />
          </div>
          <p className="text-[14px] text-app-muted">Cargando…</p>
        </div>
      </div>
    );
  }

  if (!organizationId && !propsOnSave) {
    return (
      <div className="space-y-5 font-professional">
        <PageHeader
          eyebrow="Pagos"
          title="Métodos de pago"
          description="Configura los métodos que el bot ofrecerá a los clientes."
        />
        <div className="app-card p-5">
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <p className="text-app-muted text-[14px] leading-relaxed">
              Crea o selecciona una organización para configurar pagos. Ve a{' '}
              <a href="/configuracion" className="text-brand-600 font-semibold hover:text-brand-500">
                Configuración
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  const showData = !loading || !!propsMethods?.length;

  return (
    <div className="space-y-5 font-professional">
      <PageHeader
        eyebrow="Pagos"
        title="Métodos de pago"
        description="Configura los métodos que el bot ofrecerá a los clientes."
        actions={
          <motion.button
            type="button"
            onClick={handleSave}
            disabled={saving || !showData}
            whileTap={{ scale: saving || !showData ? 1 : 0.98 }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/20 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{saving ? 'Guardando…' : 'Guardar'}</span>
          </motion.button>
        }
      />

      {loading && !propsMethods?.length ? (
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
          aria-busy="true"
          aria-label="Cargando métricas"
        >
          {[0, 1, 2, 3, 4].map((k) => (
            <StatsCardSkeleton key={k} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={statsContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        >
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard title="Métodos en lista" value={payStats.total} icon={Wallet} accentClassName="text-brand-500" />
          </motion.div>
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard
              title="Activos"
              value={payStats.active}
              icon={CheckCircle2}
              accentClassName="text-emerald-500"
            />
          </motion.div>
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard
              title="Desactivados"
              value={payStats.inactive}
              icon={CircleOff}
              accentClassName="text-app-muted"
            />
          </motion.div>
        </motion.div>
      )}

      <div className="space-y-3">
        {loading && !propsMethods?.length ? (
          <div className="space-y-3" aria-label="Cargando métodos">
            {[0, 1, 2, 3, 4].map((k) => (
              <PaymentMethodCardSkeleton key={k} />
            ))}
          </div>
        ) : (
          <motion.div className="space-y-3" initial="hidden" animate="show" variants={statsContainer}>
            {paymentMethods.map((method, index) => (
              <motion.div key={method.id} variants={methodCard} custom={index}>
                <div
                  className={`rounded-ref border bg-ref-card overflow-hidden shadow-sm transition-all duration-200 ${
                    method.active
                      ? 'border-brand-500/35 shadow-lg shadow-brand-500/10'
                      : 'border-app-line hover:border-app-line-strong'
                  }`}
                >
                  {method.active && (
                    <div className="h-1 bg-gradient-to-r from-brand-500/60 via-emerald-500/40 to-brand-400/50" />
                  )}
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
                            method.active
                              ? 'bg-brand-500/12 border-brand-500/25'
                              : 'bg-app-field border-app-line'
                          }`}
                        >
                          {getIcon(method.type)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-semibold text-app-ink leading-snug">{method.name}</h3>
                          <label className="flex items-center gap-2 cursor-pointer mt-2">
                            <input
                              type="checkbox"
                              checked={method.active}
                              onChange={(e) => handleChange(method.id, 'active', e.target.checked)}
                              className="w-4 h-4 text-brand-500 rounded-md border-app-line bg-ref-card focus:ring-brand-500/25 focus:ring-2"
                            />
                            <span className="text-[13px] text-app-muted">Activar este método</span>
                          </label>
                        </div>
                      </div>
                      {method.active && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/12 border border-emerald-500/25 text-[11px] font-semibold text-emerald-600 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Activo
                        </span>
                      )}
                    </div>

                    {method.active && (
                      <div className="mt-5 space-y-4 pt-5 border-t border-app-line">
                        <div>
                          <label className="block text-[12px] font-semibold text-app-muted mb-1.5 uppercase tracking-wide">
                            A nombre de <span className="text-rose-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={method.accountName}
                            onChange={(e) => handleChange(method.id, 'accountName', e.target.value)}
                            required={method.active}
                            placeholder="Ej: Juan Pérez"
                            className={fieldClass}
                          />
                        </div>

                        {(method.type === 'yape' || method.type === 'plin') && (
                          <div>
                            <label className="block text-[12px] font-semibold text-app-muted mb-1.5 uppercase tracking-wide">
                              Número de celular
                            </label>
                            <input
                              type="text"
                              value={method.accountNumber || ''}
                              onChange={(e) => handleChange(method.id, 'accountNumber', e.target.value)}
                              placeholder="Ej: 999 888 777 (número para Yape/Plin)"
                              className={fieldClass}
                            />
                            <p className="text-[12px] text-app-muted mt-1.5 leading-relaxed">
                              El bot mostrará este número para que el cliente te envíe el pago.
                            </p>
                          </div>
                        )}

                        {(method.type === 'bcp' || method.type === 'interbank') && (
                          <>
                            <p className="text-[12px] text-app-muted leading-relaxed">
                              Puedes configurar <strong className="text-app-ink">cuenta de ahorros</strong>,{' '}
                              <strong className="text-app-ink">cuenta corriente</strong> o ambas. El bot mostrará
                              solo las que completes.
                            </p>
                            <div>
                              <label className="block text-[12px] font-semibold text-app-muted mb-1.5 uppercase tracking-wide">
                                Cuenta de ahorros
                              </label>
                              <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                value={method.accountNumber || ''}
                                onChange={(e) => handleChange(method.id, 'accountNumber', e.target.value)}
                                placeholder="Número CCI o cuenta de ahorros (opcional si hay corriente)"
                                className={fieldClass}
                              />
                            </div>
                            <div>
                              <label className="block text-[12px] font-semibold text-app-muted mb-1.5 uppercase tracking-wide">
                                Cuenta corriente
                              </label>
                              <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="off"
                                value={method.accountNumberCorriente || ''}
                                onChange={(e) => handleChange(method.id, 'accountNumberCorriente', e.target.value)}
                                placeholder="Número de cuenta corriente (opcional si hay ahorros)"
                                className={fieldClass}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-ref border border-app-line bg-ref-card overflow-hidden shadow-sm"
      >
        <div className="p-5 sm:p-6 flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-app-field border border-app-line text-brand-600 shrink-0">
            <Info className="size-[18px]" />
          </div>
          <p className="text-[13px] text-app-muted leading-relaxed min-w-0">
            Cuando un cliente quiera pagar, el bot mostrará automáticamente los métodos <strong className="text-app-ink">activos</strong> con los datos que configures aquí. En BCP e Interbank puedes publicar cuenta de ahorros, corriente o ambas.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
