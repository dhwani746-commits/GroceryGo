-- Add customer_name field to addresses table
-- This allows users to specify a different recipient name when ordering for someone else

-- Add customer_name field (nullable)
ALTER TABLE public.addresses 
ADD COLUMN customer_name text NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_addresses_customer_name ON public.addresses USING btree (customer_name) TABLESPACE pg_default;

-- Add comment for documentation
COMMENT ON COLUMN public.addresses.customer_name IS 'Customer name for delivery - can be different from the address owner name when ordering for someone else';

-- Update existing addresses to use the profile name as customer_name if not set
UPDATE public.addresses 
SET customer_name = profiles.full_name 
FROM public.profiles 
WHERE profiles.id = addresses.user_id 
AND addresses.customer_name IS NULL;
