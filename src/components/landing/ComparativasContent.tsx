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
    <div className="min-h-screen bg-app-shell font-professional text-app-ink">
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-app-canvas">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-app-ink mb-4 font-display">
              wazapp.ai vs otras soluciones
            </h1>
            <p className="text-xl text-app-muted">
              Todo lo que necesitas para vender por WhatsApp, sin pagar de más.
            </p>
          </div>

          <div className="overflow-x-auto rounded-[22px] border border-app-line bg-white shadow-app-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-app-line">
                  <th className="text-left p-6 font-semibold text-app-ink">Característica</th>
                  <th className="p-6 font-semibold text-brand-600">wazapp.ai</th>
                  <th className="p-6 font-semibold text-app-muted">Otras soluciones</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, i) => (
                  <tr key={feature} className="border-b border-app-line last:border-0">
                    <td className="p-6 text-app-ink">{feature}</td>
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
              className="inline-flex items-center gap-2 px-8 py-4 bg-app-charcoal text-white font-semibold rounded-2xl hover:bg-app-charcoal/90 transition-colors shadow-md"
            >
              Probar wazapp.ai gratis
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
