import { useState } from 'react';
import { Globe, FileText, Plus, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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

  const getStatusIcon = (status: BotTrainingData['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'processing':
        return <Loader2 size={16} className="text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Entrenar Bot</h1>
        <p className="text-gray-600 mt-2">
          Alimenta a tu bot con información de tu empresa, productos y documentos
        </p>
      </div>

      {/* Acciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Extraer de Web */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Globe size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Extraer de Página Web</h3>
              <p className="text-sm text-gray-500">Obtén información de tu sitio web</p>
            </div>
          </div>
          {!showWebForm ? (
            <button
              onClick={() => setShowWebForm(true)}
              className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Agregar URL
            </button>
          ) : (
            <div className="space-y-3">
              <input
                type="url"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
                placeholder="https://tu-empresa.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={isProcessing}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleWebExtract}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Procesando...' : 'Extraer Información'}
                </button>
                <button
                  onClick={() => {
                    setShowWebForm(false);
                    setWebUrl('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Subir PDF */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Subir PDF</h3>
              <p className="text-sm text-gray-500">Procesa documentos y catálogos</p>
            </div>
          </div>
          <label className="block w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer text-center">
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
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Información Entrenada ({trainingData.length})
          </h2>
        </div>
        {trainingData.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">
              No hay información entrenada. Agrega una página web o sube un PDF para comenzar.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {trainingData.map((item) => (
              <div key={item.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {item.type === 'web' ? (
                        <Globe size={18} className="text-blue-600" />
                      ) : (
                        <FileText size={18} className="text-purple-600" />
                      )}
                      <span className="font-medium text-gray-900">
                        {item.type === 'web' ? 'Página Web' : 'PDF'}
                      </span>
                      {getStatusIcon(item.status)}
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.status === 'completed' ? 'bg-green-100 text-green-700' :
                        item.status === 'error' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.status === 'completed' ? 'Completado' :
                         item.status === 'error' ? 'Error' : 'Procesando'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.source}</p>
                    {item.status === 'completed' && item.content && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-line">{item.content}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {item.extractedAt.toLocaleString('es-ES')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 ¿Cómo funciona?</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>El bot aprenderá automáticamente de la información que agregues</li>
          <li>Puedes extraer información de tu página web principal</li>
          <li>Sube PDFs con catálogos, políticas o información de productos</li>
          <li>El bot usará esta información para responder preguntas de los clientes</li>
        </ul>
      </div>
    </div>
  );
}






