-- Add name field to addresses table
-- This field will be auto-populated with the user's full name but remain editable

-- Add name field (nullable initially, then populated)
ALTER TABLE public.addresses 
ADD COLUMN name text NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_addresses_name ON public.addresses USING btree (name) TABLESPACE pg_default;

-- Populate existing addresses with user's full name
UPDATE public.addresses 
SET name = profiles.full_name 
FROM public.profiles 
WHERE profiles.id = addresses.user_id 
AND addresses.name IS NULL;

-- Make the name field NOT NULL after populating existing records
ALTER TABLE public.addresses 
ALTER COLUMN name SET NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.addresses.name IS 'Recipient name for delivery - auto-populated from user profile but editable';
