-- Migration: Add missing RLS policies for the addresses table
-- The addresses table had RLS enabled but no policies, blocking all queries.
-- Run this in the Supabase SQL Editor.

-- Users can view their own addresses
CREATE POLICY "Users can view own addresses"
  ON public.addresses FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own addresses
CREATE POLICY "Users can insert own addresses"
  ON public.addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own addresses
CREATE POLICY "Users can update own addresses"
  ON public.addresses FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own addresses
CREATE POLICY "Users can delete own addresses"
  ON public.addresses FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all addresses
CREATE POLICY "Admins can view all addresses"
  ON public.addresses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
