export interface PaymentMethod {
  id: string;
  type: 'yape' | 'plin' | 'bcp';
  name: string;
  accountName: string;
  accountNumber?: string;
  accountType?: string;
  active: boolean;
}

export const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'yape',
    name: 'Yape',
    accountName: '',
    active: false,
  },
  {
    id: '2',
    type: 'plin',
    name: 'Plin',
    accountName: '',
    active: false,
  },
  {
    id: '3',
    type: 'bcp',
    name: 'BCP',
    accountName: '',
    accountNumber: '',
    accountType: 'Ahorros',
    active: false,
  },
];

export function getPaymentMethodsText(methods: PaymentMethod[]): string {
  const activeMethods = methods.filter(m => m.active);
  
  if (activeMethods.length === 0) {
    return 'No hay métodos de pago configurados. Por favor contacta con el administrador.';
  }

  let text = 'Métodos de pago disponibles:\n\n';
  
  activeMethods.forEach(method => {
    if (method.type === 'yape') {
      text += `📱 Yape: ${method.accountName}\n`;
    } else if (method.type === 'plin') {
      text += `📱 Plin: ${method.accountName}\n`;
    } else if (method.type === 'bcp') {
      text += `🏦 BCP ${method.accountType || 'Cuenta'}: ${method.accountNumber || 'N/A'}\n`;
      text += `   A nombre de: ${method.accountName}\n`;
    }
    text += '\n';
  });

  return text.trim();
}









