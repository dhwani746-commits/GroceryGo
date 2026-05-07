-- Add separate email and phone fields to profiles table
-- This migration adds proper email and phone fields to the profiles table
-- while maintaining backward compatibility with existing data

-- Add email field (nullable, with unique constraint)
ALTER TABLE public.profiles 
ADD COLUMN email text NULL;

-- Add phone_new field (nullable, with unique constraint) 
-- We'll use phone_new temporarily to avoid conflicts with existing phone field
ALTER TABLE public.profiles 
ADD COLUMN phone_new text NULL;

-- Add unique constraints for the new fields
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_key UNIQUE (email);

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_phone_new_key UNIQUE (phone_new);

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles USING btree (email) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_profiles_phone_new ON public.profiles USING btree (phone_new) TABLESPACE pg_default;

-- Migrate data from old phone field to new phone_new field
UPDATE public.profiles 
SET phone_new = phone 
WHERE phone IS NOT NULL;

-- Populate email field from auth.users if not already set
UPDATE public.profiles 
SET email = auth_users.email 
FROM auth.users auth_users 
WHERE auth_users.id = profiles.id 
AND profiles.email IS NULL;

-- Drop the old phone field and unique constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_phone_key;

ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS phone;

-- Rename phone_new to phone
ALTER TABLE public.profiles 
RENAME COLUMN phone_new TO phone;

-- Add back the unique constraint for phone (now using the new field)
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_phone_key UNIQUE (phone);

-- Update the index name to match the renamed column
DROP INDEX IF EXISTS idx_profiles_phone_new;
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles USING btree (phone) TABLESPACE pg_default;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.email IS 'User email address - unique identifier, populated from auth.users';
COMMENT ON COLUMN public.profiles.phone IS 'User phone number - unique identifier for contact';
