// Importar productos y métodos de pago para que el bot pueda responder sobre ellos
import type { Product } from './products';
import type { PaymentMethod } from './paymentMethods';
import { getPaymentMethodsText } from './paymentMethods';

// Respuestas automáticas del bot basadas en palabras clave
export const botResponses: { keywords: string[]; response: string | ((products: Product[]) => string) }[] = [
  {
    keywords: ['hola', 'hi', 'buenos días', 'buenas tardes', 'buenas noches'],
    response: '¡Hola! 👋 Soy el asistente virtual. ¿En qué puedo ayudarte hoy?'
  },
  {
    keywords: ['pedido', 'orden', 'comprar', 'producto'],
    response: (products: Product[]) => {
      if (products.length === 0) {
        return '¡Perfecto! Puedo ayudarte con tu pedido. Actualmente no hay productos disponibles, pero puedes contactar con nuestro equipo.';
      }
      const productList = products.slice(0, 3).map(p => `• ${p.name} - $${p.price.toFixed(2)}`).join('\n');
      return `¡Perfecto! Puedo ayudarte con tu pedido. Aquí tienes algunos de nuestros productos:\n\n${productList}\n\n¿Te interesa alguno de estos o quieres ver más opciones?`;
    }
  },
  {
    keywords: ['productos', 'catálogo', 'disponibles', 'qué tienen'],
    response: (products: Product[]) => {
      if (products.length === 0) {
        return 'Actualmente no tenemos productos disponibles. ¡Pronto agregaremos más!';
      }
      const categories = [...new Set(products.map(p => p.category))];
      return `Tenemos ${products.length} productos disponibles en las siguientes categorías: ${categories.join(', ')}. ¿Qué te interesa?`;
    }
  },
  {
    keywords: ['precio', 'costo', 'cuánto', 'precio'],
    response: 'Te puedo ayudar con los precios. ¿De qué producto quieres saber el precio?'
  },
  {
    keywords: ['envío', 'entrega', 'llegará', 'cuándo'],
    response: 'Los envíos suelen tardar entre 3-5 días hábiles. ¿Te gustaría hacer un seguimiento de tu pedido?'
  },
  {
    keywords: ['gracias', 'thank you', 'muchas gracias'],
    response: '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?'
  },
  {
    keywords: ['ayuda', 'help', 'soporte'],
    response: 'Estoy aquí para ayudarte. ¿Cuál es tu consulta?'
  },
  {
    keywords: ['devolución', 'reembolso', 'devolver'],
    response: 'Para procesar una devolución, necesito algunos datos. ¿Podrías decirme el número de tu pedido?'
  },
  {
    keywords: ['cancelar', 'cancelación'],
    response: 'Puedo ayudarte a cancelar tu pedido. ¿Cuál es el número de orden que deseas cancelar?'
  },
  {
    keywords: ['pago', 'pagar', 'comprar', 'realizar pago', 'método de pago', 'yape', 'plin', 'bcp', 'transferencia'],
    response: (products: Product[], paymentMethods: PaymentMethod[]) => {
      const paymentText = getPaymentMethodsText(paymentMethods);
      return `Para realizar tu pago, puedes usar los siguientes métodos:\n\n${paymentText}\n\n` +
        `Una vez realizado el pago, por favor envía el comprobante para procesar tu pedido.`;
    }
  }
];

// Respuesta por defecto si no se encuentra ninguna palabra clave
export const defaultBotResponse = 'Entiendo. ¿Podrías darme más detalles para poder ayudarte mejor?';

// Función para generar respuesta del bot basada en el mensaje del usuario
export function generateBotResponse(
  userMessage: string, 
  products: Product[] = [],
  paymentMethods: PaymentMethod[] = []
): string {
  const messageLower = userMessage.toLowerCase();
  
  for (const { keywords, response } of botResponses) {
    if (keywords.some(keyword => messageLower.includes(keyword))) {
      if (typeof response === 'function') {
        return response(products, paymentMethods);
      }
      return response;
    }
  }
  
  // Buscar productos específicos mencionados
  const mentionedProduct = products.find(p => 
    messageLower.includes(p.name.toLowerCase()) ||
    messageLower.includes(p.category.toLowerCase())
  );
  
  if (mentionedProduct) {
    return `¡Sí! Tenemos "${mentionedProduct.name}" disponible por $${mentionedProduct.price.toFixed(2)}. ${mentionedProduct.description || 'Es un excelente producto.'} ¿Te interesa?`;
  }
  
  return defaultBotResponse;
}

// Simular tiempo de escritura del bot (1-3 segundos)
export function getBotTypingDelay(): number {
  return Math.random() * 2000 + 1000; // Entre 1 y 3 segundos
}

