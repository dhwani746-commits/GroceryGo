-- Ensure updated_at trigger function exists (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Singleton store settings (one logical row; singleton column enforces single row)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton       BOOLEAN NOT NULL DEFAULT true UNIQUE,
  store_name      TEXT NOT NULL,
  support_email   TEXT,
  support_phone   TEXT,
  address_line1   TEXT,
  address_line2   TEXT,
  city            TEXT,
  state           TEXT,
  pincode         TEXT,
  gst_number      TEXT,
  logo_url        TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT store_settings_singleton_only CHECK (singleton = true)
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read store settings"
  ON public.store_settings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update store settings"
  ON public.store_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert store settings"
  ON public.store_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'store_settings_updated_at'
  ) THEN
    CREATE TRIGGER store_settings_updated_at
      BEFORE UPDATE ON public.store_settings
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

INSERT INTO public.store_settings (singleton, store_name)
SELECT true, 'Krishna Plastics'
WHERE NOT EXISTS (SELECT 1 FROM public.store_settings);
