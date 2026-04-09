-- Asegura correos del equipo en authorized_emails (acceso sin Stripe).
-- Ejecutar en Supabase si alguien del equipo aún ve la pantalla de precios tras registrarse.

INSERT INTO authorized_emails (email) VALUES
  ('attermayerbasiliorengifo@gmail.com'),
  ('victor.minas@unmsm.edu.pe')
ON CONFLICT (email) DO NOTHING;
