import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  FileText,
  X,
  Loader2,
  Brain,
  Info,
  Building2,
  Save,
  Layers,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import type { BotTrainingData } from '../data/botTraining';
import { extractWebInfo, extractPDFInfo } from '../data/botTraining';
import { useOrganization } from '../hooks/useOrganization';
import { loadTrainingData, saveTrainingItem, deleteTrainingItem, uploadTrainingFile } from '../services/bot-training';
import { getOrganizationBotConfig, saveOrganizationBotConfig } from '../services/bot-config';
import { createClient } from '../lib/supabase';
import PageHeader from './PageHeader';
import StatsCard from './StatsCard';
import StatsCardSkeleton from './StatsCardSkeleton';

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

const listRow = {
  hidden: { opacity: 0, x: -8 },
  show: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, type: 'spring', stiffness: 400, damping: 32 },
  }),
};

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

  const trainingStats = useMemo(() => {
    const web = trainingData.filter((t) => t.type === 'web').length;
    const pdf = trainingData.filter((t) => t.type === 'pdf').length;
    const completed = trainingData.filter((t) => t.status === 'completed').length;
    return { total: trainingData.length, web, pdf, completed };
  }, [trainingData]);

  const hasWebOrCatalogForSave =
    !!(catalogInvite.trim() || companyWebsiteUrl.trim());

  const handleSaveBotConfig = async () => {
    if (!organizationId) return;
    if (!hasWebOrCatalogForSave) {
      alert(
        'Completa al menos uno: «URL de tu web» o «Invitación a ver web o catálogo». El bot los necesita para guiar al cliente cuando pregunta por productos.',
      );
      return;
    }
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
      } catch {
        content = await extractWebInfo(webUrl);
      }
      await saveTrainingItem(organizationId, { type: 'web', source: webUrl, content });
      await fetchTraining();
      setWebUrl('');
      if (
        content.length > 200 &&
        confirm('¿Extraer también productos de este contenido? Los verás en Productos > Sugeridos desde web.')
      ) {
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
      const {
        data: { session },
      } = await createClient().auth.getSession();
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
      else if (data.count > 0)
        alert(data.message || `Se encontraron ${data.count} productos. Revísalos en Productos > Sugeridos desde web.`);
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
      if (
        data.content?.length > 200 &&
        confirm('¿Extraer también productos de este contenido? Los verás en Productos > Sugeridos desde web.')
      ) {
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
    const config: Record<string, { bg: string; text: string; dot: string; label: string; border: string }> = {
      completed: {
        bg: 'bg-emerald-500/12',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
        label: 'Completado',
        border: 'border-emerald-500/25',
      },
      error: {
        bg: 'bg-rose-500/12',
        text: 'text-rose-600',
        dot: 'bg-rose-400',
        label: 'Error',
        border: 'border-rose-500/25',
      },
      processing: {
        bg: 'bg-brand-500/12',
        text: 'text-brand-600',
        dot: 'bg-brand-400',
        label: 'Procesando',
        border: 'border-brand-500/25',
      },
      pending: {
        bg: 'bg-amber-500/12',
        text: 'text-amber-700',
        dot: 'bg-amber-400',
        label: 'Pendiente',
        border: 'border-amber-500/25',
      },
    };
    const c = config[status] || config.processing;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border ${c.bg} ${c.text} ${c.border}`}
      >
        {status === 'processing' ? (
          <Loader2 size={11} className="animate-spin" />
        ) : (
          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        )}
        {c.label}
      </span>
    );
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

  if (!organizationId) {
    return (
      <div className="space-y-5 font-professional">
        <PageHeader
          eyebrow="IA"
          title="Entrenar bot"
          description="Configura cómo se presenta tu negocio y de qué fuentes aprende el bot."
        />
        <div className="app-card p-5">
          <div className="flex items-start gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
            <p className="text-app-muted text-[14px] leading-relaxed">
              Crea o selecciona una organización para entrenar el bot. Ve a{' '}
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

  return (
    <div className="space-y-5 font-professional">
      <PageHeader
        eyebrow="IA"
        title="Entrenar bot"
        description="Configura cómo se presenta tu negocio y de qué fuentes aprende el bot. Los productos que quieras vender debes cargarlos en Productos."
        actions={
          extractingProducts ? (
            <span className="text-[11px] font-semibold text-brand-700 bg-brand-500/12 border border-brand-500/25 px-3 py-1.5 rounded-full inline-flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" />
              Extrayendo productos…
            </span>
          ) : null
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3" aria-busy="true" aria-label="Cargando métricas">
          {[0, 1, 2, 3].map((k) => (
            <StatsCardSkeleton key={k} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={statsContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3"
        >
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard
              title="Fuentes de conocimiento"
              value={trainingStats.total}
              icon={Brain}
              accentClassName="text-violet-500"
            />
          </motion.div>
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard title="Desde web" value={trainingStats.web} icon={Globe} accentClassName="text-brand-600" />
          </motion.div>
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard title="Documentos PDF" value={trainingStats.pdf} icon={FileText} accentClassName="text-brand-500" />
          </motion.div>
          <motion.div variants={statsItem} className="min-w-0">
            <StatsCard
              title="Listas para usar"
              value={trainingStats.completed}
              icon={CheckCircle2}
              accentClassName="text-emerald-400"
            />
          </motion.div>
        </motion.div>
      )}

      {/* Datos de empresa */}
      <div className="rounded-ref border border-app-line bg-ref-card overflow-hidden shadow-sm">
        <div className="px-5 py-4 sm:px-6 bg-app-field/70 border-b border-app-line flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-ref-card border border-app-line text-amber-600 shrink-0 shadow-sm">
            <Building2 className="size-[18px]" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-app-ink tracking-tight">Datos de tu empresa</h3>
            <p className="text-[12px] text-app-muted mt-0.5 font-medium">El bot se presentará y hablará según estos datos</p>
          </div>
        </div>
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-app-muted mb-1.5 uppercase tracking-wide">
                Nombre de la empresa
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ej: Mi Tienda de Zapatillas"
                className={fieldClass}
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-app-muted mb-1.5 uppercase tracking-wide">
                Nombre del bot
              </label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="Ej: Asistente WazApp"
                className={fieldClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-app-muted mb-1.5 uppercase tracking-wide">
              ¿A qué se dedica tu empresa?
            </label>
            <input
              type="text"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="Ej: Venta de zapatillas y ropa deportiva"
              className={fieldClass}
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-app-muted mb-1.5 uppercase tracking-wide">
              Saludo inicial (opcional)
            </label>
            <textarea
              value={initialGreeting}
              onChange={(e) => setInitialGreeting(e.target.value)}
              placeholder="Ej: ¿Desea que le pase nuestro catálogo o algunas zapatillas en tendencia?"
              rows={2}
              className={`${fieldClass} resize-none`}
            />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-app-muted mb-1.5 uppercase tracking-wide">
              Invitación a ver web o catálogo <span className="text-amber-700">(obligatorio si no pones URL)</span>
            </label>
            <input
              type="text"
              value={catalogInvite}
              onChange={(e) => setCatalogInvite(e.target.value)}
              placeholder="Ej: Catálogo: https://… o «¿Le paso el PDF?»"
              className={fieldClass}
            />
            <p className="text-[12px] text-app-muted mt-1.5 leading-relaxed">
              Texto o enlace que el bot ofrece cuando preguntan por productos o catálogo. Si ya tienes URL de web abajo, este campo puede ser un refuerzo breve.
            </p>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-app-muted mb-1.5 uppercase tracking-wide">
              URL de tu web <span className="text-amber-700">(obligatoria si no pones catálogo arriba)</span>
            </label>
            <input
              type="url"
              value={companyWebsiteUrl}
              onChange={(e) => setCompanyWebsiteUrl(e.target.value)}
              placeholder="https://tu-empresa.com"
              className={fieldClass}
            />
            <p className="text-[12px] text-app-muted mt-1.5 leading-relaxed">
              Debes completar esta URL o la invitación/catálogo de arriba (al menos uno). El bot prioriza esto ante preguntas generales de productos. También puedes rellenarla desde «Extraer de página web».
            </p>
          </div>
          <div className="flex justify-end pt-1">
            <motion.button
              type="button"
              onClick={handleSaveBotConfig}
              disabled={configSaving || !hasWebOrCatalogForSave}
              whileTap={{ scale: configSaving ? 1 : 0.98 }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/20 disabled:opacity-50 transition-colors"
            >
              {configSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {configSaving ? 'Guardando…' : 'Guardar datos'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Acciones de extracción */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="rounded-ref border border-app-line bg-ref-card overflow-hidden shadow-sm flex flex-col"
        >
          <div className="h-1 bg-gradient-to-r from-brand-800/50 via-brand-500/40 to-brand-400/45 shrink-0" />
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-ref-card border border-app-line text-brand-600 shrink-0 shadow-sm">
                <Globe className="size-[18px]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-app-ink leading-snug">Extraer de página web</h3>
                <p className="text-[12px] text-app-muted mt-0.5">Una URL, una página</p>
              </div>
            </div>
            {!showWebForm ? (
              <motion.button
                type="button"
                onClick={() => setShowWebForm(true)}
                whileTap={{ scale: 0.98 }}
                className="mt-auto w-full py-2.5 rounded-full text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/20 transition-colors"
              >
                Agregar URL
              </motion.button>
            ) : (
              <div className="space-y-2.5 mt-auto">
                <input
                  type="url"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                  placeholder="https://tu-empresa.com"
                  className={fieldClass}
                  disabled={isProcessing}
                />
                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    onClick={handleWebExtract}
                    disabled={isProcessing}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-2.5 rounded-full text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 shadow-md shadow-brand-500/20 transition-colors"
                  >
                    {isProcessing ? 'Procesando…' : 'Extraer'}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWebForm(false);
                      setWebUrl('');
                    }}
                    className="px-4 py-2.5 text-[14px] font-semibold text-app-muted bg-ref-card border border-app-line rounded-full hover:bg-app-field transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="rounded-ref border border-app-line bg-ref-card overflow-hidden shadow-sm flex flex-col"
        >
          <div className="h-1 bg-gradient-to-r from-emerald-500/60 via-teal-500/40 to-emerald-400/50 shrink-0" />
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-ref-card border border-app-line text-emerald-600 shrink-0 shadow-sm">
                <Layers className="size-[18px]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-app-ink leading-snug">Estudiar sitio completo</h3>
                <p className="text-[12px] text-app-muted mt-0.5">Hasta 20 páginas vía sitemap</p>
              </div>
            </div>
            <input
              type="url"
              value={fullSiteUrl}
              onChange={(e) => setFullSiteUrl(e.target.value)}
              placeholder={companyWebsiteUrl || 'https://tu-empresa.com'}
              className={`${fieldClass} mb-2`}
              disabled={isFullSiteProcessing}
            />
            <p className="text-[12px] text-app-muted mb-3 leading-relaxed">
              URL principal o sitemap.xml. Se leerán hasta 20 páginas.
            </p>
            <motion.button
              type="button"
              onClick={handleFullSiteExtract}
              disabled={isFullSiteProcessing}
              whileTap={{ scale: isFullSiteProcessing ? 1 : 0.98 }}
              className="mt-auto w-full px-4 py-2.5 bg-emerald-600 text-white text-[14px] font-semibold rounded-full hover:bg-emerald-500 shadow-md transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {isFullSiteProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Estudiando…
                </>
              ) : (
                'Estudiar sitio completo'
              )}
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="rounded-ref border border-app-line bg-ref-card overflow-hidden shadow-sm flex flex-col"
        >
          <div className="h-1 bg-gradient-to-r from-purple-500/50 via-brand-500/40 to-purple-400/50 shrink-0" />
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-ref-card border border-app-line text-violet-600 shrink-0 shadow-sm">
                <FileText className="size-[18px]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold text-app-ink leading-snug">Subir PDF</h3>
                <p className="text-[12px] text-app-muted mt-0.5">Catálogos y documentos</p>
              </div>
            </div>
            <label className="mt-auto w-full cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-semibold bg-app-field text-app-ink border border-app-line hover:bg-app-field/80 transition-colors">
              <input
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                className="hidden"
                disabled={isProcessing}
              />
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Procesando…
                </>
              ) : (
                'Seleccionar PDF'
              )}
            </label>
          </div>
        </motion.div>
      </div>

      {/* Lista entrenada */}
      <div className="rounded-ref border border-app-line bg-ref-card overflow-hidden shadow-sm">
        <div className="px-5 py-4 sm:px-6 bg-app-field/70 border-b border-app-line flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-ref-card border border-app-line text-brand-600 shrink-0 shadow-sm">
              <Brain className="size-[18px]" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-app-ink tracking-tight">Información entrenada</h2>
              <p className="text-[12px] text-app-muted font-medium">Fuentes que el bot usa como contexto</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-app-muted bg-ref-card border border-app-line px-3 py-1.5 rounded-full tabular-nums shrink-0">
            {loading ? '—' : trainingData.length}
          </span>
        </div>

        {loading ? (
          <div className="divide-y divide-app-line" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="p-4 sm:p-5 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-app-field shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="h-4 w-36 max-w-full bg-app-field rounded-lg" />
                    <div className="h-3 w-full bg-app-field rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : trainingData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-app-field border border-app-line flex items-center justify-center mb-4">
              <Brain className="size-7 text-app-muted" />
            </div>
            <p className="text-[15px] font-medium text-app-ink">Aún no hay fuentes entrenadas</p>
            <p className="text-[13px] text-app-muted mt-1 max-w-md leading-relaxed">
              Agrega una página web, estudia tu sitio completo o sube un PDF para que el bot aprenda de tu negocio.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-app-line">
            {trainingData.map((item, index) => (
              <motion.div
                key={item.id}
                custom={index}
                variants={listRow}
                initial="hidden"
                animate="show"
                className="p-4 sm:p-5 hover:bg-app-field/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border bg-brand-500/12 border-brand-500/25">
                        {item.type === 'web' ? (
                          <Globe size={16} className="text-brand-600" />
                        ) : (
                          <FileText size={16} className="text-brand-600" />
                        )}
                      </div>
                      <span className="text-[14px] font-semibold text-app-ink">
                        {item.type === 'web' ? 'Página web' : 'PDF'}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-[13px] text-app-muted truncate ml-11 sm:ml-11">{item.source}</p>
                    {item.status === 'completed' && item.content && (
                      <div className="mt-3 ml-0 sm:ml-11 p-3.5 rounded-xl bg-app-field/70 border border-app-line">
                        <p className="text-[13px] text-app-muted whitespace-pre-line leading-relaxed">{item.content}</p>
                      </div>
                    )}
                    <p className="text-[12px] text-app-muted mt-2 ml-0 sm:ml-11 tabular-nums">
                      {item.extractedAt.toLocaleString('es-ES')}
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 text-rose-600 hover:bg-rose-500/12 rounded-xl border border-transparent hover:border-rose-500/20 transition-colors shrink-0"
                  >
                    <X size={17} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Ayuda */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-ref border border-app-line bg-ref-card overflow-hidden shadow-sm"
      >
        <div className="p-5 sm:p-6 flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-ref-card border border-app-line text-brand-600 shrink-0 shadow-sm">
            <Info className="size-[18px]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="size-4 text-brand-500 shrink-0" />
              <h3 className="text-[15px] font-semibold text-app-ink">Orden recomendado</h3>
            </div>
            <p className="text-[13px] text-app-muted mb-3 leading-relaxed">
              (1) Completa <strong className="text-app-ink">Datos de tu empresa</strong> y guarda — el bot se presenta con el nombre de tu negocio y puede ofrecer tu URL. (2) Añade contenido con{' '}
              <strong className="text-app-ink">web</strong>, <strong className="text-app-ink">sitio completo</strong> o{' '}
              <strong className="text-app-ink">PDF</strong>. (3) En <strong className="text-app-ink">Productos</strong> carga lo que el bot puede vender; solo con esos ítems arma pedidos.
            </p>
            <ul className="text-[13px] text-app-muted space-y-1.5 list-disc list-inside leading-relaxed">
              <li>
                <strong className="text-app-ink">Una página:</strong> ideal para home o landing.
              </li>
              <li>
                <strong className="text-app-ink">Sitio completo:</strong> hasta 20 páginas vía sitemap.
              </li>
              <li>
                <strong className="text-app-ink">PDF:</strong> catálogos, precios o políticas.
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
