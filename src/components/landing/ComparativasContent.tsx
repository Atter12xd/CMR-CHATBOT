import { Check, X } from 'lucide-react';

const features = [
  'Chat unificado',
  'Catálogo de productos',
  'Pedidos integrados',
  'Métodos de pago',
  'Bot de respuestas',
  'Dashboard y métricas',
  'Precio desde 0€',
  'Soporte en español',
];

const competitors = [
  { name: 'wazapp.ai', values: features.map(() => true) },
  { name: 'Otras soluciones', values: [true, true, true, false, false, true, false, false] },
];

export default function ComparativasContent() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              wazapp.ai vs otras soluciones
            </h1>
            <p className="text-xl text-slate-400">
              Todo lo que necesitas para vender por WhatsApp, sin pagar de más.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left p-6 font-semibold text-white">Característica</th>
                  <th className="p-6 font-semibold text-blue-400">wazapp.ai</th>
                  <th className="p-6 font-semibold text-slate-400">Otras soluciones</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, i) => (
                  <tr key={feature} className="border-b border-slate-800/80 last:border-0">
                    <td className="p-6 text-slate-300">{feature}</td>
                    <td className="p-6 text-center">
                      <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                    </td>
                    <td className="p-6 text-center">
                      {competitors[1].values[i] ? (
                        <Check className="w-5 h-5 text-slate-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-slate-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-12 text-center">
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors"
            >
              Probar wazapp.ai gratis
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
