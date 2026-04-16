import { Phone, Sparkles } from 'lucide-react';
import PageHeader from './PageHeader';

export default function AiCallsPage() {
  return (
    <div className="space-y-5 font-professional">
      <PageHeader title="Llamadas IA" description="Historial y gestión de llamadas automatizadas" />

      <div className="flex flex-col items-center justify-center min-h-[420px] px-4">
        <div className="w-full max-w-md bg-white border border-[#E5E7EB] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,.08),0_4px_24px_-6px_rgba(15,23,42,.08)] px-8 py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[#EBF2FF] flex items-center justify-center">
            <Phone className="w-8 h-8 text-brand-500" strokeWidth={1.75} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600 mb-2">En desarrollo</p>
          <h2 className="text-xl font-bold text-[#1a1a1c] mb-2">Próximamente</h2>
          <p className="text-[13px] text-[#6D6D70] leading-relaxed mb-6">
            Estamos preparando el módulo de llamadas con IA: historial, resultados y programación desde un solo lugar.
          </p>
          <div className="inline-flex items-center gap-2 text-[12px] text-[#6D6D70] bg-[#f9fafb] border border-[#E5E7EB] rounded-full px-4 py-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            Te avisaremos cuando esté listo
          </div>
        </div>
      </div>
    </div>
  );
}
