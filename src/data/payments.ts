// Interfaces y gestión de pagos/ventas

export interface Payment {
  id: string;
  customerName: string;
  customerEmail?: string;
  customerId?: string; // ID del chat asociado
  amount: number;
  method: 'yape' | 'plin' | 'bcp' | 'otro';
  receiptImage?: string; // URL o base64 de la imagen del comprobante
  timestamp: Date;
  status: 'pending' | 'verified' | 'rejected';
  notes?: string;
}

// Estado global de pagos (simulado en memoria, luego será base de datos)
let payments: Payment[] = [];

// Funciones para gestionar pagos

export function addPayment(payment: Omit<Payment, 'id' | 'timestamp'>): Payment {
  const newPayment: Payment = {
    ...payment,
    id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
  };
  payments.push(newPayment);
  return newPayment;
}

export function getAllPayments(): Payment[] {
  return [...payments];
}

export function getPaymentsByCustomer(customerName: string): Payment[] {
  return payments.filter(p => 
    p.customerName.toLowerCase() === customerName.toLowerCase()
  );
}

export function getPaymentsByCustomerId(customerId: string): Payment[] {
  return payments.filter(p => p.customerId === customerId);
}

export function getPaymentById(id: string): Payment | undefined {
  return payments.find(p => p.id === id);
}

// Funciones para calcular ventas por período

export function getDailySales(date: Date = new Date()): number {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return payments
    .filter(p => {
      const paymentDate = new Date(p.timestamp);
      return paymentDate >= startOfDay && paymentDate <= endOfDay && p.status !== 'rejected';
    })
    .reduce((total, p) => total + p.amount, 0);
}

export function getWeeklySales(date: Date = new Date()): number {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay()); // Domingo
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return payments
    .filter(p => {
      const paymentDate = new Date(p.timestamp);
      return paymentDate >= startOfWeek && paymentDate <= endOfWeek && p.status !== 'rejected';
    })
    .reduce((total, p) => total + p.amount, 0);
}

export function getMonthlySales(date: Date = new Date()): number {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);
  
  return payments
    .filter(p => {
      const paymentDate = new Date(p.timestamp);
      return paymentDate >= startOfMonth && paymentDate <= endOfMonth && p.status !== 'rejected';
    })
    .reduce((total, p) => total + p.amount, 0);
}

// Función para formatear número como moneda
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);
}

// Función para obtener el método de pago como texto
export function getPaymentMethodText(method: Payment['method']): string {
  const methods: Record<Payment['method'], string> = {
    yape: 'Yape',
    plin: 'Plin',
    bcp: 'BCP',
    otro: 'Otro',
  };
  return methods[method];
}

// Función helper para convertir archivo a base64
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Datos de ejemplo para pruebas (opcional)
export const mockPayments: Payment[] = [];








