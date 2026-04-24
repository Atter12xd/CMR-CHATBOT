-- Interbank como método; BCP/Interbank: cuenta ahorros + cuenta corriente (ambas opcionales salvo al menos una si está activo, validado en app).

ALTER TABLE payment_methods_config
  ADD COLUMN IF NOT EXISTS account_number_corriente TEXT;

-- Ampliar métodos permitidos (nombre de restricción por defecto en PG)
ALTER TABLE payment_methods_config DROP CONSTRAINT IF EXISTS payment_methods_config_method_check;
ALTER TABLE payment_methods_config
  ADD CONSTRAINT payment_methods_config_method_check
  CHECK (method IN ('yape', 'plin', 'bcp', 'interbank'));

-- Pagos registrados: permitir interbank
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
ALTER TABLE payments
  ADD CONSTRAINT payments_method_check
  CHECK (method IN ('yape', 'plin', 'bcp', 'interbank', 'otro'));

-- Datos legacy: si solo había "corriente" en account_number, mover a account_number_corriente
UPDATE payment_methods_config
SET
  account_number_corriente = NULLIF(TRIM(account_number), ''),
  account_number = NULL,
  account_type = NULL
WHERE method = 'bcp'
  AND (account_type ILIKE '%corriente%' OR account_type = 'Corriente')
  AND account_number IS NOT NULL
  AND TRIM(account_number) <> ''
  AND (account_number_corriente IS NULL OR TRIM(account_number_corriente) = '');

COMMENT ON COLUMN payment_methods_config.account_number IS 'Cuenta de ahorros (BCP / Interbank)';
COMMENT ON COLUMN payment_methods_config.account_number_corriente IS 'Cuenta corriente (BCP / Interbank)';
COMMENT ON COLUMN payment_methods_config.account_type IS 'Legado; preferir account_number + account_number_corriente';
