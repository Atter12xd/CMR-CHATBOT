import { useState } from 'react';
import { Mail, MessageSquare, Send } from 'lucide-react';

export default function ContactoContent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: en producción conectarías a Formspree, Web3Forms o tu backend
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Contacto
            </h1>
            <p className="text-xl text-slate-400">
              ¿Dudas sobre planes empresa o integraciones? Escríbenos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Email</h3>
                  <a href="mailto:soporte@wazapp.ai" className="text-blue-400 hover:text-blue-300">
                    soporte@wazapp.ai
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Soporte en app</h3>
                  <p className="text-slate-400 text-sm">Si ya tienes cuenta, usa el chat de ayuda dentro de la plataforma.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-8">
              {sent ? (
                <div className="text-center py-8">
                  <p className="text-emerald-400 font-medium mb-2">¡Mensaje enviado!</p>
                  <p className="text-slate-400 text-sm">Te responderemos en las próximas 24-48 horas.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                      Nombre
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="¿En qué podemos ayudarte?"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Enviar
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
