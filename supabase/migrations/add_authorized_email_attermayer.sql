-- Añadir correo autorizado (si ya ejecutaste create_authorized_emails antes)
INSERT INTO authorized_emails (email) VALUES
  ('attermayerbasiliorengifo@gmail.com')
ON CONFLICT (email) DO NOTHING;
