-- Add post_office column to addresses table
ALTER TABLE public.addresses 
ADD COLUMN post_office text NULL;

-- Add comment to describe the column
COMMENT ON COLUMN public.addresses.post_office IS 'Post office name from India Post API validation';
