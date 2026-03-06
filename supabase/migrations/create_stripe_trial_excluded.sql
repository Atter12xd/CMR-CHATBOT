-- Emails/customers que ya usaron el trial (cancelaron). Si vuelven a suscribirse no tienen 14 días gratis.
CREATE TABLE IF NOT EXISTS stripe_trial_excluded (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_customer_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_trial_excluded_customer ON stripe_trial_excluded(stripe_customer_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_stripe_trial_excluded_email ON stripe_trial_excluded(LOWER(customer_email));

COMMENT ON TABLE stripe_trial_excluded IS 'Quien ya usó el trial (ej. canceló). No vuelven a tener 14 días gratis.';