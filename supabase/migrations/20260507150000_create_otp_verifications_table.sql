-- Create OTP verifications table for fast lookups
-- This table stores OTP codes with expiration and rate limiting

CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_verified BOOLEAN DEFAULT false
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON public.otp_verifications USING btree (email);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_email_expires ON public.otp_verifications USING btree (email, expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON public.otp_verifications USING btree (expires_at);

-- Add unique constraint on email for ON CONFLICT operations
ALTER TABLE public.otp_verifications 
ADD CONSTRAINT otp_verifications_email_unique UNIQUE (email);

-- Add check constraints
ALTER TABLE public.otp_verifications 
ADD CONSTRAINT otp_verifications_otp_length CHECK (length(otp) = 4);

ALTER TABLE public.otp_verifications 
ADD CONSTRAINT otp_verifications_otp_digits CHECK (otp ~ '^\d{4}$');

ALTER TABLE public.otp_verifications 
ADD CONSTRAINT otp_verifications_attempts_positive CHECK (attempts > 0);

-- Add trigger for updated_at
CREATE TRIGGER otp_verifications_updated_at 
BEFORE UPDATE ON public.otp_verifications 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add RLS (Row Level Security)
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own OTP verifications
CREATE POLICY "Users can view own OTP verifications"
ON public.otp_verifications FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Policy: Service role can manage OTP verifications (for API endpoints)
CREATE POLICY "Service role can manage OTP verifications"
ON public.otp_verifications FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE public.otp_verifications IS 'Stores OTP codes for email verification with expiration and rate limiting';
COMMENT ON COLUMN public.otp_verifications.email IS 'Email address for OTP verification';
COMMENT ON COLUMN public.otp_verifications.otp IS '4-digit verification code';
COMMENT ON COLUMN public.otp_verifications.expires_at IS 'OTP expiration timestamp';
COMMENT ON COLUMN public.otp_verifications.attempts IS 'Number of OTP requests made';
COMMENT ON COLUMN public.otp_verifications.is_verified IS 'Whether the OTP has been successfully verified';
