import { useState } from 'react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

export default function ChatsPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  return (
    <div className="h-full flex">
      <div className="w-80 border-r border-[#E2E8F0] flex-shrink-0">
        <ChatList 
          selectedChatId={selectedChatId} 
          onSelectChat={setSelectedChatId}
        />
      </div>
      <div className="flex-1">
        {selectedChatId ? (
          <ChatWindow chatId={selectedChatId} />
        ) : (
          <div className="h-full flex items-center justify-center bg-[#F8FAFC] text-[#64748B]">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">Selecciona una conversación</p>
              <p className="text-sm">Elige un chat de la lista para comenzar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
