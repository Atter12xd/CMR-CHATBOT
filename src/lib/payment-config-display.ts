/** Fila de `payment_methods_config` para textos al cliente / prompts */
export type PaymentConfigRow = {
  method: string;
  account_name?: string | null;
  account_number?: string | null;
  account_number_corriente?: string | null;
  account_type?: string | null;
};

/**
 * Líneas de texto para Yape/Plin/BCP/Interbank (BCP e Interbank pueden tener ahorros y/o corriente).
 */
export function linesFromPaymentConfigRow(p: PaymentConfigRow, style: 'bullet' | 'dash' = 'dash'): string[] {
  const prefix = style === 'bullet' ? '•' : '-';
  const name = (p.account_name || 'N/A').trim() || 'N/A';

  if (p.method === 'yape' || p.method === 'plin') {
    const num = p.account_number?.trim();
    const numText = num ? ` al número ${num}` : '';
    const label = p.method === 'yape' ? 'Yape' : 'Plin';
    return [`${prefix} ${label}${numText}: A nombre de ${name}`];
  }

  if (p.method === 'bcp' || p.method === 'interbank') {
    const label = p.method === 'bcp' ? 'BCP' : 'Interbank';
    let ah = (p.account_number || '').trim();
    let cc = (p.account_number_corriente || '').trim();
    const tipo = (p.account_type || '').trim();
    if (!cc && ah && (tipo === 'Corriente' || tipo.toLowerCase().includes('corriente'))) {
      cc = ah;
      ah = '';
    }
    const out: string[] = [];
    if (ah) out.push(`${prefix} ${label} (cuenta de ahorros): ${ah} — A nombre de ${name}`);
    if (cc) out.push(`${prefix} ${label} (cuenta corriente): ${cc} — A nombre de ${name}`);
    if (!out.length) out.push(`${prefix} ${label}: (sin número de cuenta configurado) — A nombre de ${name}`);
    return out;
  }

  return [];
}

export function joinPaymentConfigLines(
  rows: PaymentConfigRow[],
  style: 'bullet' | 'dash' = 'dash',
): string {
  return rows.flatMap((r) => linesFromPaymentConfigRow(r, style)).join('\n');
}
