import { useState, useRef } from 'react';
import { X, Upload, Image, FileText, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '../lib/supabase';

const supabase = createClient();

type FileType = 'image' | 'document';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (fileUrl: string, fileType: FileType, caption?: string) => Promise<void>;
  chatId: string;
}

export default function FileUploadModal({ isOpen, onClose, onSend, chatId }: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validar tipo de archivo
    const isImage = file.type.startsWith('image/');
    const isDocument = file.type === 'application/pdf' || 
                       file.type.includes('document') ||
                       file.type.includes('sheet') ||
                       file.type.includes('presentation');

    if (!isImage && !isDocument) {
      setError('Tipo de archivo no soportado. Solo imágenes (JPG, PNG, WEBP) y documentos (PDF, DOCX, XLSX).');
      return;
    }

    // Validar tamaño (WhatsApp limits: 16MB para imágenes, 100MB para documentos)
    const maxSize = isImage ? 16 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`El archivo es demasiado grande. Máximo ${isImage ? '16MB' : '100MB'}.`);
      return;
    }

    setSelectedFile(file);
    setFileType(isImage ? 'image' : 'document');

    // Generar preview para imágenes
    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleUploadAndSend = async () => {
    if (!selectedFile || !fileType) return;

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(10);

      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${chatId}/${timestamp}.${fileExt}`;

      setUploadProgress(30);

      // Subir archivo a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadProgress(60);

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error('No se pudo obtener la URL del archivo');
      }

      setUploadProgress(80);

      // Enviar mensaje con el archivo
      await onSend(urlData.publicUrl, fileType, caption || undefined);

      setUploadProgress(100);

      // Limpiar y cerrar
      resetModal();
      onClose();
    } catch (err: any) {
      console.error('Error subiendo archivo:', err);
      setError(err.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    setCaption('');
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!uploading) {
      resetModal();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {fileType === 'image' ? 'Enviar Imagen' : fileType === 'document' ? 'Enviar Documento' : 'Adjuntar Archivo'}
          </h3>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* File Input */}
          {!selectedFile && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-primary-500 hover:bg-primary-50 transition-colors group"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                    <Upload size={32} className="text-gray-400 group-hover:text-primary-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">
                      Haz clic para seleccionar un archivo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Imágenes (JPG, PNG, WEBP) hasta 16MB
                    </p>
                    <p className="text-xs text-gray-500">
                      Documentos (PDF, DOCX, XLSX) hasta 100MB
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Preview */}
          {selectedFile && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="bg-gray-50 rounded-lg p-4 flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {fileType === 'image' ? (
                    <Image size={24} className="text-primary-600" />
                  ) : (
                    <FileText size={24} className="text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={resetModal}
                  disabled={uploading}
                  className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              </div>

              {/* Image Preview */}
              {filePreview && fileType === 'image' && (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain bg-gray-50"
                  />
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {fileType === 'image' ? 'Descripción (opcional)' : 'Mensaje (opcional)'}
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={fileType === 'image' ? 'Agrega una descripción...' : 'Agrega un mensaje...'}
                  rows={3}
                  disabled={uploading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none disabled:opacity-50"
                />
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subiendo archivo...</span>
                    <span className="text-primary-600 font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedFile && (
          <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleUploadAndSend}
              disabled={uploading || !selectedFile}
              className="px-6 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <span>Enviar</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
