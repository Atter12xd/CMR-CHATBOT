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
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="app-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-app-line">
          <h3 className="text-base font-semibold text-app-ink">
            {fileType === 'image' ? 'Enviar Imagen' : fileType === 'document' ? 'Enviar Documento' : 'Adjuntar Archivo'}
          </h3>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-2 hover:bg-app-field rounded-xl transition-colors disabled:opacity-50"
          >
            <X size={18} className="text-app-muted" />
          </button>
        </div>


        {/* Content */}
        <div className="p-5 space-y-4">
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
                className="w-full border-2 border-dashed border-app-line rounded-2xl p-8 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all duration-200 group"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-14 h-14 bg-app-field border border-app-line rounded-2xl flex items-center justify-center group-hover:bg-brand-500/10 group-hover:border-brand-500/25 transition-all">
                    <Upload size={24} className="text-app-muted group-hover:text-brand-600 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-app-ink">
                      Haz clic para seleccionar un archivo
                    </p>
                    <p className="text-[12px] text-app-muted mt-1.5">
                      Imágenes (JPG, PNG, WEBP) hasta 16MB
                    </p>
                    <p className="text-[12px] text-app-muted">
                      Documentos (PDF, DOCX, XLSX) hasta 100MB
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Error (fuera de selección) */}
          {error && !selectedFile && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2.5">
              <AlertCircle size={15} className="text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}


          {/* Preview */}
          {selectedFile && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="bg-app-field/80 border border-app-line rounded-xl p-4 flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-app-line">
                  {fileType === 'image' ? (
                    <Image size={18} className="text-blue-400" />
                  ) : (
                    <FileText size={18} className="text-sky-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-app-ink truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[12px] text-app-muted mt-0.5">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={resetModal}
                  disabled={uploading}
                  className="flex-shrink-0 p-1.5 hover:bg-app-field rounded-xl transition-colors disabled:opacity-50"
                >
                  <X size={15} className="text-app-muted" />
                </button>
              </div>


              {/* Image Preview */}
              {filePreview && fileType === 'image' && (
                <div className="rounded-xl overflow-hidden border border-app-line">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain bg-app-field"
                  />
                </div>
              )}


              {/* Caption */}
              <div>
                <label className="block text-[13px] font-semibold text-app-muted mb-1.5">
                  {fileType === 'image' ? 'Descripción (opcional)' : 'Mensaje (opcional)'}
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={fileType === 'image' ? 'Agrega una descripción...' : 'Agrega un mensaje...'}
                  rows={3}
                  disabled={uploading}
                  className="w-full px-3.5 py-2.5 text-sm bg-app-field border border-app-line rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/40 text-app-ink placeholder:text-app-muted resize-none disabled:opacity-50 transition-all"
                />
              </div>


              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-app-muted">Subiendo archivo...</span>
                    <span className="text-brand-600 font-semibold text-[13px]">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-app-field rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}


              {/* Error */}
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-start gap-2.5">
                  <AlertCircle size={15} className="text-rose-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-700">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>


        {/* Footer */}
        {selectedFile && (
          <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-app-line rounded-b-2xl">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2.5 text-sm font-medium text-app-muted border border-app-line hover:bg-app-field rounded-full transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleUploadAndSend}
              disabled={uploading || !selectedFile}
              className="px-5 py-2.5 text-sm font-medium bg-app-charcoal text-white rounded-full hover:bg-black shadow-md transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
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