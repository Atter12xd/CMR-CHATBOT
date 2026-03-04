import { useState } from 'react';
import { Globe, FileText, Plus, X, CheckCircle, AlertCircle, Loader2, Brain, Info } from 'lucide-react';
import type { BotTrainingData } from '../data/botTraining';
import { extractWebInfo, extractPDFInfo } from '../data/botTraining';


export default function BotTrainingPage() {
  const [trainingData, setTrainingData] = useState<BotTrainingData[]>([]);
  const [webUrl, setWebUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWebForm, setShowWebForm] = useState(false);


  const handleWebExtract = async () => {
    if (!webUrl.trim()) {
      alert('Por favor ingresa una URL válida');
      return;
    }


    setIsProcessing(true);
    setShowWebForm(false);


    const newData: BotTrainingData = {
      id: `web-${Date.now()}`,
      type: 'web',
      source: webUrl,
      content: '',
      extractedAt: new Date(),
      status: 'processing',
    };


    setTrainingData(prev => [...prev, newData]);


    try {
      const content = await extractWebInfo(webUrl);
      setTrainingData(prev =>
        prev.map(item =>
          item.id === newData.id
            ? { ...item, content, status: 'completed' }
            : item
        )
      );
    } catch (error) {
      setTrainingData(prev =>
        prev.map(item =>
          item.id === newData.id
            ? { ...item, status: 'error', content: 'Error al procesar la URL' }
            : item
        )
      );
    } finally {
      setIsProcessing(false);
      setWebUrl('');
    }
  };


  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;


    if (file.type !== 'application/pdf') {
      alert('Por favor selecciona un archivo PDF');
      return;
    }


    setIsProcessing(true);


    const newData: BotTrainingData = {
      id: `pdf-${Date.now()}`,
      type: 'pdf',
      source: file.name,
      content: '',
      extractedAt: new Date(),
      status: 'processing',
    };


    setTrainingData(prev => [...prev, newData]);


    try {
      const content = await extractPDFInfo(file.name);
      setTrainingData(prev =>
        prev.map(item =>
          item.id === newData.id
            ? { ...item, content, status: 'completed' }
            : item
        )
      );
    } catch (error) {
      setTrainingData(prev =>
        prev.map(item =>
          item.id === newData.id
            ? { ...item, status: 'error', content: 'Error al procesar el PDF' }
            : item
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };


  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este entrenamiento?')) {
      setTrainingData(prev => prev.filter(item => item.id !== id));
    }
  };


  const getStatusBadge = (status: BotTrainingData['status']) => {
    const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Completado' },
      error: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', label: 'Error' },
      processing: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', label: 'Procesando' },
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


  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-violet-500"></span>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">IA</p>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Entrenar Bot</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Alimenta a tu bot con información de tu empresa, productos y documentos
        </p>
      </div>


      {/* Acciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              className="w-full px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 shadow-sm shadow-violet-600/20 transition-all duration-150 active:scale-[0.98]"
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
                  className="flex-1 px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 shadow-sm shadow-violet-600/20 transition-all disabled:opacity-50"
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


        {/* Subir PDF */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-violet-50 ring-1 ring-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Subir PDF</h3>
              <p className="text-[12px] text-slate-400">Procesa documentos y catálogos</p>
            </div>
          </div>
          <label className="block w-full px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 shadow-sm shadow-violet-600/20 transition-all cursor-pointer text-center active:scale-[0.98]">
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
            <div className="w-8 h-8 bg-violet-50 ring-1 ring-violet-100 rounded-lg flex items-center justify-center">
              <Brain size={15} className="text-violet-600" />
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
                        item.type === 'web' ? 'bg-sky-50 ring-1 ring-sky-100' : 'bg-violet-50 ring-1 ring-violet-100'
                      }`}>
                        {item.type === 'web' ? (
                          <Globe size={13} className="text-sky-600" />
                        ) : (
                          <FileText size={13} className="text-violet-600" />
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


      {/* Información */}
      <div className="bg-violet-50 border border-violet-200/60 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info size={16} className="text-violet-600" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-violet-900 mb-1.5">Cómo funciona</h3>
            <ul className="text-[13px] text-violet-700/80 space-y-1 list-disc list-inside leading-relaxed">
              <li>El bot aprenderá automáticamente de la información que agregues</li>
              <li>Puedes extraer información de tu página web principal</li>
              <li>Sube PDFs con catálogos, políticas o información de productos</li>
              <li>El bot usará esta información para responder preguntas de los clientes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}