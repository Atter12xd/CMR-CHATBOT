/** Worker de pdfjs-dist: Vite emite URL absoluta válida en dev y en deploy (Vercel, etc.) */
import pdfjsWorkerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';

export interface BotTrainingData {
  id: string;
  type: 'web' | 'pdf' | 'manual';
  source: string;
  content: string;
  /** URL pública en Storage si se subió el archivo (p. ej. PDF) */
  fileUrl?: string | null;
  extractedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

/** Configuración principal del bot por empresa (formulario fácil para el dueño) */
export interface OrganizationBotConfig {
  id?: string;
  organizationId: string;
  companyName: string;
  companyDescription: string;
  initialGreeting: string;
  botName: string;
  catalogInvite: string;
  companyWebsiteUrl: string;
}

export const defaultOrganizationBotConfig = (
  organizationId: string
): OrganizationBotConfig => ({
  organizationId,
  companyName: '',
  companyDescription: '',
  initialGreeting: '',
  botName: '',
  catalogInvite: '',
  companyWebsiteUrl: '',
});

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

/** Extrae texto de HTML (quita etiquetas y normaliza espacios) */
function stripHtml(html: string): string {
  const doc = typeof document !== 'undefined'
    ? new DOMParser().parseFromString(html, 'text/html')
    : null;
  if (doc?.body?.textContent) {
    return doc.body.textContent.replace(/\s+/g, ' ').trim();
  }
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Extrae información de una URL (fetch + texto del body)
 */
export async function extractWebInfo(url: string): Promise<string> {
  const res = await fetch(url, { mode: 'cors', headers: { 'Accept': 'text/html' } });
  if (!res.ok) {
    throw new Error(`No se pudo acceder a la URL: ${res.status}`);
  }
  const html = await res.text();
  const text = stripHtml(html);
  if (!text || text.length < 50) {
    return `Página: ${url}\n\n(Contenido no extraído o bloqueado por CORS. Puedes agregar contexto manualmente.)`;
  }
  return `Información extraída de ${url}:\n\n${text.slice(0, 15000)}`;
}

/**
 * Extrae texto de un archivo PDF (pdfjs-dist + worker empaquetado por Vite).
 */
export async function extractPDFInfo(file: File): Promise<string> {
  let pdfjsLib: typeof import('pdfjs-dist');
  try {
    pdfjsLib = await import('pdfjs-dist');
  } catch {
    return `Documento PDF: ${file.name}. (No se pudo cargar el lector PDF.)`;
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;

  const arrayBuffer = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = doc.numPages;
  const parts: string[] = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((it) => ('str' in it && typeof (it as { str?: string }).str === 'string' ? (it as { str: string }).str : ''))
      .join(' ');
    if (text.trim()) parts.push(text);
  }

  const full = parts.join('\n\n').trim();
  if (!full) return `PDF "${file.name}" procesado. No se encontró texto seleccionable (puede ser escaneado).`;
  return `Contenido del PDF "${file.name}":\n\n${full.slice(0, 20000)}`;
}









