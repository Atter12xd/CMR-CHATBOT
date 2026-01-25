export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  read?: boolean; // Deprecated: usar status en su lugar
  image?: string; // URL o base64 de imagen (para comprobantes de pago)
  isPaymentReceipt?: boolean; // Indica si es un comprobante de pago
}

export interface Chat {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'active' | 'waiting' | 'resolved';
  platform: 'facebook' | 'whatsapp' | 'web';
  messages: Message[];
  botActive: boolean;
  botTyping?: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  chatId?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export const mockChats: Chat[] = [
  {
    id: '1',
    customerName: 'María González',
    customerEmail: 'maria@example.com',
    customerAvatar: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=0ea5e9&color=fff',
    lastMessage: 'Hola, quiero hacer un pedido',
    lastMessageTime: new Date(Date.now() - 2 * 60000),
    unreadCount: 2,
    status: 'active',
    platform: 'facebook',
    botActive: true,
    messages: [
      {
        id: 'm1',
        text: 'Hola, quiero hacer un pedido',
        sender: 'user',
        timestamp: new Date(Date.now() - 5 * 60000),
        read: true,
      },
      {
        id: 'm2',
        text: '¡Hola María! Con gusto te ayudo. ¿Qué producto te interesa?',
        sender: 'agent',
        timestamp: new Date(Date.now() - 4 * 60000),
        read: true,
      },
      {
        id: 'm3',
        text: 'Quiero el producto X en color azul',
        sender: 'user',
        timestamp: new Date(Date.now() - 3 * 60000),
        read: true,
      },
      {
        id: 'm4',
        text: 'Perfecto, ¿qué talla necesitas?',
        sender: 'agent',
        timestamp: new Date(Date.now() - 2 * 60000),
        read: false,
      },
    ],
  },
  {
    id: '3',
    customerName: 'Ana Martínez',
    customerEmail: 'ana@example.com',
    customerAvatar: 'https://ui-avatars.com/api/?name=Ana+Martinez&background=f59e0b&color=fff',
    lastMessage: 'Gracias por la ayuda',
    lastMessageTime: new Date(Date.now() - 2 * 3600000),
    unreadCount: 0,
    status: 'resolved',
    platform: 'web',
    botActive: false,
    messages: [
      {
        id: 'm6',
        text: 'Gracias por la ayuda',
        sender: 'user',
        timestamp: new Date(Date.now() - 2 * 3600000),
        read: true,
      },
    ],
  },
  {
    id: '4',
    customerName: 'Luis Fernández',
    customerEmail: 'luis@example.com',
    customerAvatar: 'https://ui-avatars.com/api/?name=Luis+Fernandez&background=8b5cf6&color=fff',
    lastMessage: 'Necesito cambiar mi pedido',
    lastMessageTime: new Date(Date.now() - 30 * 60000),
    unreadCount: 1,
    status: 'waiting',
    platform: 'facebook',
    botActive: true,
    messages: [
      {
        id: 'm7',
        text: 'Necesito cambiar mi pedido',
        sender: 'user',
        timestamp: new Date(Date.now() - 30 * 60000),
        read: false,
      },
    ],
  },
];

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'María González',
    customerEmail: 'maria@example.com',
    items: [
      { id: '1', name: 'Producto X - Azul', quantity: 2, price: 29.99 },
      { id: '2', name: 'Producto Y', quantity: 1, price: 49.99 },
    ],
    total: 109.97,
    status: 'processing',
    createdAt: new Date(Date.now() - 2 * 3600000),
    chatId: '1',
  },
  {
    id: 'ORD-002',
    customerName: 'Carlos Rodríguez',
    customerEmail: 'carlos@example.com',
    items: [
      { id: '3', name: 'Producto Z', quantity: 1, price: 79.99 },
    ],
    total: 79.99,
    status: 'shipped',
    createdAt: new Date(Date.now() - 24 * 3600000),
  },
  {
    id: 'ORD-003',
    customerName: 'Ana Martínez',
    customerEmail: 'ana@example.com',
    items: [
      { id: '4', name: 'Producto A', quantity: 3, price: 19.99 },
    ],
    total: 59.97,
    status: 'delivered',
    createdAt: new Date(Date.now() - 72 * 3600000),
    chatId: '3',
  },
  {
    id: 'ORD-004',
    customerName: 'Luis Fernández',
    customerEmail: 'luis@example.com',
    items: [
      { id: '5', name: 'Producto B', quantity: 1, price: 99.99 },
    ],
    total: 99.99,
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 3600000),
    chatId: '4',
  },
];

export function getChatById(id: string): Chat | undefined {
  return mockChats.find(chat => chat.id === id);
}

export function getOrderById(id: string): Order | undefined {
  return mockOrders.find(order => order.id === id);
}

export function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes}m`;
  if (hours < 24) return `Hace ${hours}h`;
  return `Hace ${days}d`;
}

