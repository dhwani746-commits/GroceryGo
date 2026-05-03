-- Migration: Add idempotency_key to orders table
-- Run in Supabase SQL Editor if not already present

-- Add idempotency_key column (unique, for preventing duplicate order submissions)
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

-- Index for fast lookup during duplicate detection
CREATE UNIQUE INDEX IF NOT EXISTS orders_idempotency_key_idx ON public.orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Backfill existing rows with a generated key (required since column must be NOT NULL going forward)
UPDATE public.orders
  SET idempotency_key = gen_random_uuid()::TEXT
  WHERE idempotency_key IS NULL;

-- Enforce NOT NULL after backfill
ALTER TABLE public.orders
  ALTER COLUMN idempotency_key SET NOT NULL;
