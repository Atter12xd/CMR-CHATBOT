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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80">
          <h3 className="text-base font-semibold text-slate-900">
            {fileType === 'image' ? 'Enviar Imagen' : fileType === 'document' ? 'Enviar Documento' : 'Adjuntar Archivo'}
          </h3>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <X size={18} className="text-slate-400" />
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
                className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-violet-300 hover:bg-violet-50/30 transition-all duration-200 group"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-14 h-14 bg-slate-50 ring-1 ring-slate-200/80 rounded-2xl flex items-center justify-center group-hover:bg-violet-50 group-hover:ring-violet-100 transition-all">
                    <Upload size={24} className="text-slate-300 group-hover:text-violet-500 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-700">
                      Haz clic para seleccionar un archivo
                    </p>
                    <p className="text-[12px] text-slate-400 mt-1.5">
                      Imágenes (JPG, PNG, WEBP) hasta 16MB
                    </p>
                    <p className="text-[12px] text-slate-400">
                      Documentos (PDF, DOCX, XLSX) hasta 100MB
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Error (fuera de selección) */}
          {error && !selectedFile && (
            <div className="bg-rose-50 border border-rose-200/60 rounded-xl p-3 flex items-start gap-2.5">
              <AlertCircle size={15} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}


          {/* Preview */}
          {selectedFile && (
            <div className="space-y-4">
              {/* File Info */}
              <div className="bg-slate-50 ring-1 ring-slate-200/80 rounded-xl p-4 flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-white ring-1 ring-slate-100">
                  {fileType === 'image' ? (
                    <Image size={18} className="text-violet-600" />
                  ) : (
                    <FileText size={18} className="text-sky-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-[12px] text-slate-400 mt-0.5">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={resetModal}
                  disabled={uploading}
                  className="flex-shrink-0 p-1.5 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                >
                  <X size={15} className="text-slate-400" />
                </button>
              </div>


              {/* Image Preview */}
              {filePreview && fileType === 'image' && (
                <div className="rounded-xl overflow-hidden border border-slate-200/80">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain bg-slate-50"
                  />
                </div>
              )}


              {/* Caption */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  {fileType === 'image' ? 'Descripción (opcional)' : 'Mensaje (opcional)'}
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={fileType === 'image' ? 'Agrega una descripción...' : 'Agrega un mensaje...'}
                  rows={3}
                  disabled={uploading}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 resize-none disabled:opacity-50 transition-all placeholder:text-slate-400"
                />
              </div>


              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Subiendo archivo...</span>
                    <span className="text-violet-600 font-semibold text-[13px]">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-violet-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}


              {/* Error */}
              {error && (
                <div className="bg-rose-50 border border-rose-200/60 rounded-xl p-3 flex items-start gap-2.5">
                  <AlertCircle size={15} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-700">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>


        {/* Footer */}
        {selectedFile && (
          <div className="flex items-center justify-end gap-2.5 px-5 py-4 border-t border-slate-200/80 bg-slate-50/50 rounded-b-2xl">
            <button
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200/80 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleUploadAndSend}
              disabled={uploading || !selectedFile}
              className="px-5 py-2.5 text-sm font-medium bg-violet-600 text-white rounded-xl hover:bg-violet-700 shadow-sm shadow-violet-600/20 transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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