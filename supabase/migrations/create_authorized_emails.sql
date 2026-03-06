-- Correos con acceso al dashboard sin suscripción activa (gerentes, admins).
-- Quien inicie sesión con uno de estos correos pasa la verificación de suscripción.

CREATE TABLE IF NOT EXISTS authorized_emails (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda case-insensitive (LOWER(email))
CREATE INDEX IF NOT EXISTS idx_authorized_emails_lower ON authorized_emails(LOWER(email));

COMMENT ON TABLE authorized_emails IS 'Emails que pueden acceder al dashboard sin suscripción Stripe activa.';

-- Insertar los 2 correos autorizados
INSERT INTO authorized_emails (email) VALUES
  ('ferbasiliorengifo@gmail.com'),
  ('victor.minas@unmsm.edu.pe')
ON CONFLICT (email) DO NOTHING;
