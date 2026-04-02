import { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, MapPin, Clock, Loader2 } from 'lucide-react';

export default function ContactoContent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('general');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-app-shell font-professional text-app-ink">
      <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8 bg-app-canvas">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-app-ink tracking-tight mb-4 font-display">
              ¿Cómo podemos ayudarte?
            </h1>
            <p className="text-lg text-app-muted max-w-2xl mx-auto">
              Estamos aquí para responder tus dudas sobre planes, integraciones o cualquier otra consulta.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-app-ink mb-1">Email</h3>
                  <a 
                    href="mailto:hola@wazapp.ai" 
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    hola@wazapp.ai
                  </a>
                  <p className="text-slate-500 text-sm mt-1">Respondemos en menos de 24h</p>
                </div>
              </div>

              {/* Support */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-app-ink mb-1">Soporte en app</h3>
                  <p className="text-app-muted text-sm">
                    Si ya tienes cuenta, usa el chat de ayuda dentro de la plataforma para soporte más rápido.
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-app-ink mb-1">Horario de atención</h3>
                  <p className="text-app-muted text-sm">
                    Lunes a Viernes: 9:00 - 18:00 (GMT-5)
                  </p>
                  <p className="text-slate-500 text-sm">
                    Soporte prioritario 24/7 para plan Pro y Business
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-app-line pt-8">
                <h3 className="font-semibold text-app-ink mb-4">¿Buscas algo específico?</h3>
                <div className="space-y-3">
                  <a 
                    href="/precios" 
                    className="block text-app-muted hover:text-app-ink text-sm transition-colors"
                  >
                    → Ver planes y precios
                  </a>
                  <a 
                    href="/recursos" 
                    className="block text-app-muted hover:text-app-ink text-sm transition-colors"
                  >
                    → Centro de ayuda y guías
                  </a>
                  <a 
                    href="/sobre-nosotros" 
                    className="block text-app-muted hover:text-app-ink text-sm transition-colors"
                  >
                    → Sobre nosotros
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="rounded-[22px] bg-white border border-app-line shadow-app-card p-8">
                {sent ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-app-ink mb-2 font-display">¡Mensaje enviado!</h3>
                    <p className="text-app-muted">
                      Te responderemos lo antes posible. Revisa tu bandeja de entrada.
                    </p>
                    <button
                      onClick={() => {
                        setSent(false);
                        setName('');
                        setEmail('');
                        setMessage('');
                      }}
                      className="mt-6 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      Enviar otro mensaje
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name & Email Row */}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-app-ink mb-2">
                          Nombre
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-2xl bg-app-field border border-app-line text-app-ink placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all"
                          placeholder="Tu nombre"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-app-ink mb-2">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full px-4 py-3 rounded-2xl bg-app-field border border-app-line text-app-ink placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all"
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-app-ink mb-2">
                        Asunto
                      </label>
                      <select
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-app-field border border-app-line text-app-ink focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all"
                      >
                        <option value="general">Consulta general</option>
                        <option value="ventas">Planes y precios</option>
                        <option value="soporte">Soporte técnico</option>
                        <option value="empresa">Plan Business / Enterprise</option>
                        <option value="integraciones">Integraciones y API</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-app-ink mb-2">
                        Mensaje
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={5}
                        className="w-full px-4 py-3 rounded-2xl bg-app-field border border-app-line text-app-ink placeholder-app-muted focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 transition-all resize-none"
                        placeholder="Cuéntanos en qué podemos ayudarte..."
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-app-charcoal hover:bg-app-charcoal/90 text-white font-semibold rounded-2xl transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          Enviar mensaje
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <p className="text-xs text-slate-500 text-center">
                      Al enviar, aceptas nuestra{' '}
                      <a href="/privacidad" className="text-slate-400 hover:text-white transition-colors">
                        política de privacidad
                      </a>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}