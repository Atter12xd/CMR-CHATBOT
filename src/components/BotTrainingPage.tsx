import { useState, useEffect, useCallback } from 'react';
import { Globe, FileText, X, Loader2, Brain, Info, Building2, Save, Layers } from 'lucide-react';
import type { BotTrainingData } from '../data/botTraining';
import { extractWebInfo, extractPDFInfo } from '../data/botTraining';
import { useOrganization } from '../hooks/useOrganization';
import { loadTrainingData, saveTrainingItem, deleteTrainingItem, uploadTrainingFile } from '../services/bot-training';
import { getOrganizationBotConfig, saveOrganizationBotConfig } from '../services/bot-config';
import { createClient } from '../lib/supabase';


export default function BotTrainingPage() {
  const { organizationId, loading: orgLoading } = useOrganization();
  const [trainingData, setTrainingData] = useState<BotTrainingData[]>([]);
  const [webUrl, setWebUrl] = useState('');
  const [fullSiteUrl, setFullSiteUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFullSiteProcessing, setIsFullSiteProcessing] = useState(false);
  const [extractingProducts, setExtractingProducts] = useState(false);
  const [showWebForm, setShowWebForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [initialGreeting, setInitialGreeting] = useState('');
  const [botName, setBotName] = useState('');
  const [catalogInvite, setCatalogInvite] = useState('');
  const [companyWebsiteUrl, setCompanyWebsiteUrl] = useState('');
  const [configSaving, setConfigSaving] = useState(false);

  const fetchTraining = useCallback(async () => {
    if (!organizationId) return;
    try {
      setLoading(true);
      const list = await loadTrainingData(organizationId);
      setTrainingData(list);
    } catch (err) {
      console.error('Error cargando entrenamiento:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const fetchBotConfig = useCallback(async () => {
    if (!organizationId) return;
    try {
      const config = await getOrganizationBotConfig(organizationId);
      if (config) {
        setCompanyName(config.companyName);
        setCompanyDescription(config.companyDescription);
        setInitialGreeting(config.initialGreeting);
        setBotName(config.botName);
        setCatalogInvite(config.catalogInvite ?? '');
        setCompanyWebsiteUrl(config.companyWebsiteUrl ?? '');
        setFullSiteUrl(config.companyWebsiteUrl ?? '');
      } else {
        setCompanyName('');
        setCompanyDescription('');
        setInitialGreeting('');
        setBotName('');
        setCatalogInvite('');
        setCompanyWebsiteUrl('');
        setFullSiteUrl('');
      }
    } catch (err) {
      console.error('Error cargando configuración del bot:', err);
    }
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    fetchTraining();
    fetchBotConfig();
  }, [organizationId, fetchTraining, fetchBotConfig]);

  const handleSaveBotConfig = async () => {
    if (!organizationId) return;
    setConfigSaving(true);
    try {
      await saveOrganizationBotConfig(organizationId, {
        companyName,
        companyDescription,
        initialGreeting,
        botName,
        catalogInvite,
        companyWebsiteUrl,
      });
      alert('Datos guardados. El bot usará esta información para presentarse y hablar de tu empresa.');
    } catch (err: unknown) {
      console.error('Error guardando configuración:', err);
      alert(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setConfigSaving(false);
    }
  };


  const handleWebExtract = async () => {
    if (!webUrl.trim()) {
      alert('Por favor ingresa una URL válida');
      return;
    }
    if (!organizationId) {
      alert('No hay organización seleccionada');
      return;
    }

    setIsProcessing(true);
    setShowWebForm(false);

    try {
      let content: string;
      try {
        const res = await fetch('/api/extract-web', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: webUrl.trim() }),
        });
        const data = await res.json().catch(() => ({}));
        if (data.error) throw new Error(data.error);
        if (data.content) {
          content = data.content;
        } else {
          throw new Error('Sin contenido');
        }
      } catch (apiErr) {
        content = await extractWebInfo(webUrl);
      }
      await saveTrainingItem(organizationId, { type: 'web', source: webUrl, content });
      await fetchTraining();
      setWebUrl('');
      if (content.length > 200 && confirm('¿Extraer también productos de este contenido? Los verás en Productos > Sugeridos desde web.')) {
        await extractProductsFromContent(organizationId, content, 'Web');
      }
    } catch (err: unknown) {
      console.error('Error extrayendo web:', err);
      alert(err instanceof Error ? err.message : 'Error al procesar la URL');
    } finally {
      setIsProcessing(false);
    }
  };

  async function extractProductsFromContent(orgId: string, content: string, sourceRef: string) {
    setExtractingProducts(true);
    try {
      const { data: { session } } = await createClient().auth.getSession();
      if (!session?.access_token) {
        alert('Inicia sesión para extraer productos.');
        return;
      }
      const res = await fetch('/api/extract-products-from-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content, organizationId: orgId, sourceRef }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.error) alert(data.error);
      else if (data.count > 0) alert(data.message || `Se encontraron ${data.count} productos. Revísalos en Productos > Sugeridos desde web.`);
      else alert(data.message || 'No se encontraron productos en el texto.');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al extraer productos');
    } finally {
      setExtractingProducts(false);
    }
  }

  const handleFullSiteExtract = async () => {
    const urlToUse = (fullSiteUrl || companyWebsiteUrl || '').trim();
    if (!urlToUse) {
      alert('Ingresa la URL de tu web (o guarda antes la "URL de tu web" arriba).');
      return;
    }
    if (!organizationId) {
      alert('No hay organización seleccionada');
      return;
    }
    setIsFullSiteProcessing(true);
    try {
      const res = await fetch('/api/extract-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToUse, maxPages: 20 }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.error) {
        alert(data.error);
        return;
      }
      if (!data.content) {
        alert('No se pudo extraer contenido del sitio.');
        return;
      }
      await saveTrainingItem(organizationId, {
        type: 'web',
        source: `Sitio completo: ${urlToUse}${data.pagesUsed ? ` (${data.pagesUsed} páginas)` : ''}`,
        content: data.content,
      });
      await fetchTraining();
      alert(data.pagesUsed ? `Listo. Se estudiaron ${data.pagesUsed} páginas.` : 'Listo. Sitio guardado.');
      if (data.content?.length > 200 && confirm('¿Extraer también productos de este contenido? Los verás en Productos > Sugeridos desde web.')) {
        await extractProductsFromContent(organizationId, data.content, `Sitio: ${urlToUse}`);
      }
    } catch (err: unknown) {
      console.error('Error estudiando sitio:', err);
      alert(err instanceof Error ? err.message : 'Error al procesar el sitio');
    } finally {
      setIsFullSiteProcessing(false);
    }
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Por favor selecciona un archivo PDF');
      return;
    }
    if (!organizationId) {
      alert('No hay organización seleccionada');
      return;
    }

    setIsProcessing(true);
    e.target.value = '';

    try {
      const content = await extractPDFInfo(file);
      let fileUrl: string | null = null;
      try {
        fileUrl = await uploadTrainingFile(file);
      } catch {
        // opcional: guardar igual sin URL
      }
      await saveTrainingItem(organizationId, {
        type: 'pdf',
        source: file.name,
        content,
        fileUrl,
      });
      await fetchTraining();
    } catch (err: any) {
      console.error('Error procesando PDF:', err);
      alert(err.message || 'Error al procesar el PDF');
    } finally {
      setIsProcessing(false);
    }
  };


  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este entrenamiento?')) return;
    try {
      await deleteTrainingItem(id);
      await fetchTraining();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };


  const getStatusBadge = (status: BotTrainingData['status']) => {
    const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Completado' },
      error: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Error' },
      processing: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400', label: 'Procesando' },
    };
    const c = config[status] || config.processing;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold ${c.bg} ${c.text}`}>
        {status === 'processing' ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
        )}
        {c.label}
      </span>
    );
  };


  if (orgLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Loader2 size={20} className="animate-spin text-blue-400" />
        </div>
      </div>
    );
  }

  if (!organizationId) {
    return (
      <div className="text-sm text-slate-500 p-4">
        Crea o selecciona una organización para entrenar el bot.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header - título sobre fondo oscuro */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">IA</p>
        <h1 className="text-[32px] font-extrabold text-white tracking-tight leading-none">Entrenar Bot</h1>
        <p className="text-slate-500 text-[14px] mt-2 max-w-xl">
          Configura cómo se presenta tu negocio y de qué fuentes aprende el bot. Todo lo que agregues aquí lo usará para saludar, ofrecer tu web o catálogo y responder a los clientes. Los productos que quieras que recomiende y pueda vender debes cargarlos en <strong>Productos</strong>.
        </p>
      </div>

      {/* Datos principales de la empresa (presentación del bot) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-50 ring-1 ring-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Datos de tu empresa</h3>
            <p className="text-[12px] text-slate-400">El bot se presentará y hablará según estos datos</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-slate-600 mb-1">Nombre de la empresa</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ej: Mi Tienda de Zapatillas"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 placeholder:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-slate-600 mb-1">Nombre del bot</label>
            <input
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              placeholder="Ej: Asistente WazApp"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-[12px] font-medium text-slate-600 mb-1">¿A qué se dedica tu empresa?</label>
          <input
            type="text"
            value={companyDescription}
            onChange={(e) => setCompanyDescription(e.target.value)}
            placeholder="Ej: Venta de zapatillas y ropa deportiva"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 placeholder:text-slate-400"
          />
        </div>
        <div className="mt-4">
          <label className="block text-[12px] font-medium text-slate-600 mb-1">Saludo inicial (opcional)</label>
          <textarea
            value={initialGreeting}
            onChange={(e) => setInitialGreeting(e.target.value)}
            placeholder="Ej: ¿Desea que le pase nuestro catálogo o algunas zapatillas en tendencia?"
            rows={2}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 placeholder:text-slate-400 resize-none"
          />
        </div>
        <div className="mt-4">
          <label className="block text-[12px] font-medium text-slate-600 mb-1">Invitación a ver web o catálogo (opcional)</label>
          <input
            type="text"
            value={catalogInvite}
            onChange={(e) => setCatalogInvite(e.target.value)}
            placeholder="Ej: Puede ver nuestra web o ¿Le paso el catálogo?"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 placeholder:text-slate-400"
          />
          <p className="text-[11px] text-slate-400 mt-1">El bot usará esto para invitar al cliente a ver tu web o catálogo (según lo que hayas entrenado abajo).</p>
        </div>
        <div className="mt-4">
          <label className="block text-[12px] font-medium text-slate-600 mb-1">URL de tu web</label>
          <input
            type="url"
            value={companyWebsiteUrl}
            onChange={(e) => setCompanyWebsiteUrl(e.target.value)}
            placeholder="https://tu-empresa.com"
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 placeholder:text-slate-400"
          />
          <p className="text-[11px] text-slate-400 mt-1">La web que el bot estudia y puede ofrecer al cliente. También puedes extraerla abajo en &quot;Extraer de Página Web&quot;.</p>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveBotConfig}
            disabled={configSaving}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-400 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {configSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {configSaving ? 'Guardando...' : 'Guardar datos'}
          </button>
        </div>
      </div>

      {/* Acciones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Extraer de Web */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-sky-50 ring-1 ring-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Globe size={18} className="text-sky-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Extraer de Página Web</h3>
              <p className="text-[12px] text-slate-400">Obtén información de tu sitio web</p>
            </div>
          </div>
          {!showWebForm ? (
            <button
              onClick={() => setShowWebForm(true)}
              className="w-full px-4 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-400 shadow-lg shadow-blue-500/20 transition-all duration-150 active:scale-[0.98]"
            >
              Agregar URL
            </button>
          ) : (
            <div className="space-y-2.5">
              <input
                type="url"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="https://tu-empresa.com"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all placeholder:text-slate-400"
                disabled={isProcessing}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleWebExtract}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-400 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {isProcessing ? 'Procesando...' : 'Extraer'}
                </button>
                <button
                  onClick={() => {
                    setShowWebForm(false);
                    setWebUrl('');
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Estudiar sitio completo (sitemap) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 ring-1 ring-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Layers size={18} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Estudiar sitio completo</h3>
              <p className="text-[12px] text-slate-400">Varias páginas vía sitemap</p>
            </div>
          </div>
          <input
            type="url"
            value={fullSiteUrl}
            onChange={(e) => setFullSiteUrl(e.target.value)}
            placeholder={companyWebsiteUrl || 'https://tu-empresa.com'}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 placeholder:text-slate-400 mb-2"
            disabled={isFullSiteProcessing}
          />
          <p className="text-[11px] text-slate-400 mb-3">Página principal o sitemap.xml. Se leerán hasta 20 páginas.</p>
          <button
            onClick={handleFullSiteExtract}
            disabled={isFullSiteProcessing}
            className="w-full px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {isFullSiteProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin inline mr-2" />
                Estudiando...
              </>
            ) : (
              'Estudiar sitio completo'
            )}
          </button>
        </div>

        {/* Subir PDF */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Subir PDF</h3>
              <p className="text-[12px] text-slate-400">Procesa documentos y catálogos</p>
            </div>
          </div>
          <label className="block w-full px-4 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-400 shadow-lg shadow-blue-500/20 transition-all cursor-pointer text-center active:scale-[0.98]">
            <input
              type="file"
              accept=".pdf"
              onChange={handlePDFUpload}
              className="hidden"
              disabled={isProcessing}
            />
            {isProcessing ? 'Procesando...' : 'Seleccionar PDF'}
          </label>
        </div>
      </div>


      {/* Lista de entrenamientos */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/15 rounded-lg flex items-center justify-center">
              <Brain size={15} className="text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">
              Información Entrenada
            </h2>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 ring-1 ring-slate-200/80 text-[11px] font-semibold text-slate-500">
            {trainingData.length}
          </span>
        </div>

        {trainingData.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-slate-50 ring-1 ring-slate-200/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Brain size={24} className="text-slate-300" />
            </div>
            <p className="text-sm text-slate-500">
              No hay información entrenada. Agrega una página web o sube un PDF para comenzar.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {trainingData.map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.type === 'web' ? 'bg-sky-50 ring-1 ring-sky-100' : 'bg-blue-500/10 border border-blue-500/15'
                      }`}>
                        {item.type === 'web' ? (
                          <Globe size={13} className="text-sky-600" />
                        ) : (
                          <FileText size={13} className="text-blue-400" />
                        )}
                      </div>
                      <span className="text-[13px] font-semibold text-slate-900">
                        {item.type === 'web' ? 'Página Web' : 'PDF'}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-[13px] text-slate-500 truncate ml-9">{item.source}</p>
                    {item.status === 'completed' && item.content && (
                      <div className="mt-2.5 ml-9 p-3 bg-slate-50 ring-1 ring-slate-200/80 rounded-xl">
                        <p className="text-[13px] text-slate-600 whitespace-pre-line leading-relaxed">{item.content}</p>
                      </div>
                    )}
                    <p className="text-[11px] text-slate-400 mt-2 ml-9">
                      {item.extractedAt.toLocaleString('es-ES')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="ml-3 p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Contexto para el dueño */}
      <div className="bg-blue-500/10 border border-blue-500/15 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/15 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info size={16} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-white mb-1.5">Contexto para ti</h3>
            <p className="text-[13px] text-slate-400 mb-2">
              Orden recomendado: (1) Completa <strong>Datos de tu empresa</strong> y guarda — así el bot se presenta con el nombre de tu negocio y puede ofrecer la URL de tu web. (2) Agrega contenido con <strong>Extraer de Página Web</strong>, <strong>Estudiar sitio completo</strong> o <strong>Subir PDF</strong> — el bot usará ese texto para responder preguntas y hablar de tu negocio. (3) En el menú <strong>Productos</strong> carga los productos que quieras que el bot recomiende y pueda vender; el bot solo puede armar pedidos con esos productos.
            </p>
            <ul className="text-[13px] text-slate-400 space-y-1 list-disc list-inside leading-relaxed">
              <li><strong>Una página:</strong> pega la URL y se extrae solo esa página (ideal para home o una landing).</li>
              <li><strong>Sitio completo:</strong> pon la URL de tu web; se buscan hasta 20 páginas vía sitemap y se estudian todas.</li>
              <li><strong>PDF:</strong> catálogos, listas de precios o políticas; el bot los usa como contexto.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}