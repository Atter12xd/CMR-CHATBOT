export interface BotTrainingData {
  id: string;
  type: 'web' | 'pdf' | 'manual';
  source: string;
  content: string;
  extractedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export interface CompanyInfo {
  name: string;
  description: string;
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
  extractedFrom: string[];
}

export const initialTrainingData: BotTrainingData[] = [];

export const defaultCompanyInfo: CompanyInfo = {
  name: '',
  description: '',
  contact: {},
  extractedFrom: [],
};

// Simular extracción de información de una URL
export async function extractWebInfo(url: string): Promise<string> {
  // En producción, esto haría una llamada real a una API
  // Por ahora simulamos la extracción
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Información extraída de ${url}:\n\n` +
        `- Nombre de la empresa: Ejemplo S.A.C.\n` +
        `- Descripción: Empresa dedicada a la venta de productos de calidad\n` +
        `- Contacto: contacto@ejemplo.com\n` +
        `- Teléfono: +51 999 999 999\n` +
        `- Dirección: Av. Principal 123, Lima, Perú\n\n` +
        `Esta información ha sido procesada y el bot ahora puede responder sobre ella.`);
    }, 2000);
  });
}

// Simular extracción de información de un PDF
export async function extractPDFInfo(fileName: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Información extraída del PDF "${fileName}":\n\n` +
        `- Documento procesado exitosamente\n` +
        `- Se encontraron referencias a productos, servicios y políticas\n` +
        `- El bot ahora puede responder preguntas basadas en este documento`);
    }, 2000);
  });
}





