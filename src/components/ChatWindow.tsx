import { useState, useEffect, useRef } from 'react';
import type { Chat, Message } from '../data/mockData';
import { formatTime } from '../data/mockData';
import { Send, Paperclip, Smile, Bot, Power, Loader2, Image as ImageIcon, X } from 'lucide-react';

interface ChatWindowProps {
  chat: Chat | null;
  onSendMessage: (chatId: string, message: string, image?: string) => void;
  onToggleBot: (chatId: string) => void;
}

export default function ChatWindow({ chat, onSendMessage, onToggleBot }: ChatWindowProps) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen');
      return;
    }

    // Convertir a base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    if (!chat || (!message.trim() && !selectedImage)) return;
    
    onSendMessage(chat.id, message, selectedImage || undefined);
    setMessage('');
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Selecciona una conversación para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <img
            src={chat.customerAvatar}
            alt={chat.customerName}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{chat.customerName}</h3>
              {chat.botActive && (
                <span className="flex items-center space-x-1 text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                  <Bot size={12} />
                  <span>Bot Activo</span>
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{chat.customerEmail}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleBot(chat.id)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                chat.botActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
              title={chat.botActive ? 'Desactivar bot' : 'Activar bot'}
            >
              {chat.botActive ? (
                <>
                  <Power size={16} />
                  <span>Parar Bot</span>
                </>
              ) : (
                <>
                  <Bot size={16} />
                  <span>Activar Bot</span>
                </>
              )}
            </button>
            <span className={`text-xs px-2 py-1 rounded ${
              chat.status === 'active' ? 'bg-green-100 text-green-700' :
              chat.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {chat.status === 'active' ? 'Activo' :
               chat.status === 'waiting' ? 'Esperando' : 'Resuelto'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {chat.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'agent' || msg.sender === 'bot' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender === 'agent'
                  ? 'bg-primary-500 text-white'
                  : msg.sender === 'bot'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              {msg.sender === 'bot' && (
                <div className="flex items-center space-x-1 mb-1">
                  <Bot size={12} />
                  <span className="text-xs font-medium opacity-90">Bot</span>
                </div>
              )}
              {msg.image && (
                <div className="mb-2 rounded-lg overflow-hidden">
                  <img 
                    src={msg.image} 
                    alt="Comprobante de pago" 
                    className="max-w-full max-h-64 object-contain rounded"
                  />
                  {msg.isPaymentReceipt && (
                    <p className="text-xs mt-1 italic opacity-90">📸 Comprobante de pago</p>
                  )}
                </div>
              )}
              {msg.text && <p className="text-sm">{msg.text}</p>}
              <p
                className={`text-xs mt-1 ${
                  msg.sender === 'agent' || msg.sender === 'bot' 
                    ? 'text-primary-100' 
                    : 'text-gray-500'
                }`}
              >
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}
        {chat.botTyping && (
          <div className="flex justify-end">
            <div className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Bot escribiendo...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <div className="relative rounded-lg overflow-hidden border-2 border-primary-500">
              <img 
                src={selectedImage} 
                alt="Imagen seleccionada" 
                className="max-w-xs max-h-32 object-contain"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">📸 Imagen seleccionada (se detectará como comprobante de pago)</p>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="Subir imagen/comprobante"
          >
            <ImageIcon size={20} />
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={selectedImage ? "Agregar mensaje (opcional)..." : "Escribe un mensaje..."}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() && !selectedImage}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            <span>Enviar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
