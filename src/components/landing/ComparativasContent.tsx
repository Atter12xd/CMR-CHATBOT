import { Check, X, ArrowRight } from 'lucide-react';
import MarketingHero from './MarketingHero';
import SectionLabel from './SectionLabel';

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
    <div className="min-h-screen bg-app-shell font-professional text-app-ink antialiased">
      <MarketingHero maxWidth="xl">
        <SectionLabel>Transparencia</SectionLabel>
        <h1 className="text-4xl md:text-5xl lg:text-[3.1rem] font-bold text-app-ink mb-4 font-professional tracking-[-0.035em] leading-[1.08]">
          wazapp.ai vs otras soluciones
        </h1>
        <p className="text-base sm:text-lg text-app-muted max-w-2xl mx-auto leading-relaxed">
          Todo lo que necesitas para vender por WhatsApp, sin pagar de más.
        </p>
      </MarketingHero>

      <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-app-shell overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-site-grid bg-grid opacity-[0.2] dark:opacity-[0.06] [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_72%)] dark:[mask-image:radial-gradient(ellipse_at_center,black_8%,transparent_80%)]" aria-hidden />
        <div className="relative max-w-5xl mx-auto">
          <div className="rounded-[26px] p-[1px] bg-gradient-to-br from-brand-400/30 via-app-line to-brand-600/15 shadow-app-card-premium overflow-hidden">
            <div className="overflow-x-auto rounded-[25px] bg-white dark:bg-ref-card ring-1 ring-white/90 dark:ring-ref-border/50">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="border-b border-app-line bg-app-field/30">
                    <th className="text-left p-5 sm:p-6 font-semibold text-app-ink text-sm sm:text-base">Característica</th>
                    <th className="p-5 sm:p-6 font-semibold text-brand-700 font-professional">wazapp.ai</th>
                    <th className="p-5 sm:p-6 font-semibold text-app-muted">Otras soluciones</th>
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature, i) => (
                    <tr key={feature} className="border-b border-app-line/90 last:border-0 hover:bg-app-field/15 transition-colors">
                      <td className="p-5 sm:p-6 text-app-ink text-sm sm:text-[15px] font-medium">{feature}</td>
                      <td className="p-5 sm:p-6 text-center">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/12 ring-1 ring-emerald-500/20 mx-auto">
                          <Check className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
                        </span>
                      </td>
                      <td className="p-5 sm:p-6 text-center">
                        {competitors[1].values[i] ? (
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-app-field ring-1 ring-app-line mx-auto">
                            <Check className="w-5 h-5 text-app-muted" strokeWidth={2.5} />
                          </span>
                        ) : (
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/8 ring-1 ring-rose-500/15 mx-auto">
                            <X className="w-5 h-5 text-rose-600/90" strokeWidth={2.5} />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href="/register"
              className="group relative inline-flex items-center gap-2 overflow-hidden px-8 py-4 rounded-2xl text-base font-semibold text-white shadow-app-card-premium transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="absolute inset-0 bg-gradient-to-b from-white/[0.12] to-transparent" />
              <span className="absolute inset-0 bg-brand-500" />
              <span className="relative">Probar wazapp.ai gratis</span>
              <ArrowRight className="relative w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
