export type PaymentMethodType = 'yape' | 'plin' | 'bcp' | 'interbank';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  name: string;
  accountName: string;
  /** Cuenta de ahorros (BCP / Interbank) */
  accountNumber?: string;
  /** Cuenta corriente (BCP / Interbank) */
  accountNumberCorriente?: string;
  /** @deprecated Legado (un solo tipo); usar dos números arriba */
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
    accountNumberCorriente: '',
    active: false,
  },
  {
    id: '4',
    type: 'interbank',
    name: 'Interbank',
    accountName: '',
    accountNumber: '',
    accountNumberCorriente: '',
    active: false,
  },
];

export function getPaymentMethodsText(methods: PaymentMethod[]): string {
  const activeMethods = methods.filter((m) => m.active);

  if (activeMethods.length === 0) {
    return 'No hay métodos de pago configurados. Por favor contacta con el administrador.';
  }

  let text = 'Métodos de pago disponibles:\n\n';

  activeMethods.forEach((method) => {
    if (method.type === 'yape') {
      text += `📱 Yape: ${method.accountName}\n`;
    } else if (method.type === 'plin') {
      text += `📱 Plin: ${method.accountName}\n`;
    } else if (method.type === 'bcp' || method.type === 'interbank') {
      const label = method.type === 'bcp' ? 'BCP' : 'Interbank';
      const ah = method.accountNumber?.trim();
      const cc = method.accountNumberCorriente?.trim();
      if (ah) text += `🏦 ${label} (ahorros): ${ah}\n`;
      if (cc) text += `🏦 ${label} (corriente): ${cc}\n`;
      text += `   A nombre de: ${method.accountName}\n`;
    }
    text += '\n';
  });

  return text.trim();
}
