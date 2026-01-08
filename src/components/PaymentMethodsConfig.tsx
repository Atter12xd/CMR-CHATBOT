import { useState } from 'react';
import { Save, CreditCard, Smartphone, Building2 } from 'lucide-react';
import type { PaymentMethod } from '../data/paymentMethods';
import { defaultPaymentMethods } from '../data/paymentMethods';

interface PaymentMethodsConfigProps {
  methods: PaymentMethod[];
  onSave: (methods: PaymentMethod[]) => void;
}

export default function PaymentMethodsConfig({ methods, onSave }: PaymentMethodsConfigProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
    methods.length > 0 ? methods : defaultPaymentMethods
  );

  const handleChange = (id: string, field: keyof PaymentMethod, value: string | boolean) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id ? { ...method, [field]: value } : method
      )
    );
  };

  const handleSave = () => {
    onSave(paymentMethods);
    alert('Métodos de pago guardados exitosamente');
  };

  const getIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'yape':
      case 'plin':
        return <Smartphone size={20} className="text-primary-600" />;
      case 'bcp':
        return <Building2 size={20} className="text-primary-600" />;
      default:
        return <CreditCard size={20} className="text-primary-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Métodos de Pago</h2>
          <p className="text-gray-600 mt-1">Configura los métodos de pago que el bot ofrecerá a los clientes</p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <Save size={18} />
          <span>Guardar</span>
        </button>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`bg-white rounded-lg border-2 p-6 ${
              method.active ? 'border-primary-500' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getIcon(method.type)}
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{method.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={method.active}
                        onChange={(e) => handleChange(method.id, 'active', e.target.checked)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Activar este método</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {method.active && (
              <div className="mt-4 space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    A nombre de <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={method.accountName}
                    onChange={(e) => handleChange(method.id, 'accountName', e.target.value)}
                    required={method.active}
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {method.type === 'bcp' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de cuenta <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={method.accountNumber || ''}
                        onChange={(e) => handleChange(method.id, 'accountNumber', e.target.value)}
                        required={method.active}
                        placeholder="Ej: 1234567890123456"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de cuenta
                      </label>
                      <select
                        value={method.accountType || 'Ahorros'}
                        onChange={(e) => handleChange(method.id, 'accountType', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Cuando un cliente quiera realizar un pago, el bot mostrará automáticamente 
          los métodos de pago activos con la información configurada aquí.
        </p>
      </div>
    </div>
  );
}



