import { useState, useEffect, useCallback } from 'react';
import { Save, CreditCard, Smartphone, Building2, Info, Loader2 } from 'lucide-react';
import type { PaymentMethod } from '../data/paymentMethods';
import { defaultPaymentMethods } from '../data/paymentMethods';
import { useOrganization } from '../hooks/useOrganization';
import { loadPaymentMethods, savePaymentMethods } from '../services/payment-methods';


interface PaymentMethodsConfigProps {
  methods?: PaymentMethod[];
  onSave?: (methods: PaymentMethod[]) => void;
}


export default function PaymentMethodsConfig({ methods: propsMethods, onSave: propsOnSave }: PaymentMethodsConfigProps) {
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


  const handleChange = (id: string, field: keyof PaymentMethod, value: string | boolean) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id ? { ...method, [field]: value } : method
      )
    );
  };


  const handleSave = async () => {
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
        return <Smartphone size={18} className="text-blue-400" />;
      case 'bcp':
        return <Building2 size={18} className="text-blue-400" />;
      default:
        return <CreditCard size={18} className="text-blue-400" />;
    }
  };


  if (loading || orgLoading) {
    return (
      <div className="flex items-center justify-center min-h-[280px]">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-blue-400" />
        </div>
      </div>
    );
  }

  if (!organizationId && !propsOnSave) {
    return (
      <div className="text-sm text-slate-500 p-4">
        Crea o selecciona una organización para configurar métodos de pago.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Pagos</p>
          <h2 className="text-[32px] font-extrabold text-white tracking-tight leading-none">Métodos de Pago</h2>
          <p className="text-slate-500 text-[14px] mt-2">Configura los métodos de pago que el bot ofrecerá a los clientes</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-400 shadow-lg shadow-blue-500/20 transition-all duration-150 active:scale-[0.97] disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{saving ? 'Guardando...' : 'Guardar'}</span>
        </button>
      </div>


      {/* Payment Methods */}
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`bg-[#111827]/80 rounded-2xl border transition-all duration-200 ${
              method.active ? 'border-blue-500/30 shadow-lg shadow-blue-500/10' : 'border-white/[0.06] hover:border-white/[0.1]'
            }`}
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    method.active ? 'bg-blue-500/10 border border-blue-500/15' : 'bg-white/[0.04] border border-white/[0.06]'
                  }`}>
                    {getIcon(method.type)}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{method.name}</h3>
                    <label className="flex items-center gap-2 cursor-pointer mt-1.5">
                      <input
                        type="checkbox"
                        checked={method.active}
                        onChange={(e) => handleChange(method.id, 'active', e.target.checked)}
                        className="w-4 h-4 text-blue-500 rounded-md border-slate-300 focus:ring-blue-500/20"
                      />
                      <span className="text-[13px] text-slate-500">Activar este método</span>
                    </label>
                  </div>
                </div>
                {method.active && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Activo
                  </span>
                )}
              </div>


              {method.active && (
                <div className="mt-4 space-y-4 pt-4 border-t border-white/[0.04]">
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-400 mb-1.5">
                      A nombre de <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={method.accountName}
                      onChange={(e) => handleChange(method.id, 'accountName', e.target.value)}
                      required={method.active}
                      placeholder="Ej: Juan Pérez"
                      className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  {(method.type === 'yape' || method.type === 'plin') && (
                    <div>
                      <label className="block text-[13px] font-semibold text-slate-400 mb-1.5">
                        Número de celular
                      </label>
                      <input
                        type="text"
                        value={method.accountNumber || ''}
                        onChange={(e) => handleChange(method.id, 'accountNumber', e.target.value)}
                        placeholder="Ej: 999 888 777 (el número al que te envían el Yape/Plin)"
                        className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">El bot dirá este número a los clientes para que te envíen el pago.</p>
                    </div>
                  )}

                  {method.type === 'bcp' && (
                    <>
                      <div>
                        <label className="block text-[13px] font-semibold text-slate-400 mb-1.5">
                          Número de cuenta <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={method.accountNumber || ''}
                          onChange={(e) => handleChange(method.id, 'accountNumber', e.target.value)}
                          required={method.active}
                          placeholder="Ej: 1234567890123456"
                          className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-slate-400 mb-1.5">
                          Tipo de cuenta
                        </label>
                        <select
                          value={method.accountType || 'Ahorros'}
                          onChange={(e) => handleChange(method.id, 'accountType', e.target.value)}
                          className="w-full px-3.5 py-2.5 text-sm bg-white/[0.04] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        >
                          <option value="Ahorros">Ahorros</option>
                          <option value="Corriente">Corriente</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>


      {/* Info Note */}
      <div className="bg-blue-500/10 border border-blue-500/15 rounded-2xl p-4">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info size={14} className="text-blue-400" />
          </div>
          <p className="text-[13px] text-slate-400 leading-relaxed">
            Cuando un cliente quiera realizar un pago, el bot mostrará automáticamente 
            los métodos de pago activos con la información configurada aquí.
          </p>
        </div>
      </div>
    </div>
  );
}