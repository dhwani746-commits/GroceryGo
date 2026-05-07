-- Add Indian phone number constraints to profiles table
-- Ensures phone numbers follow Indian format: +91 followed by 10 digits

-- Drop existing unique constraint to recreate with format validation
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_phone_key;

-- Add check constraint for Indian phone number format
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_phone_format 
CHECK (
  phone IS NULL OR 
  phone = '' OR
  (phone ~ '^\+91[6-9]\d{9}$' OR phone ~ '^[6-9]\d{9}$')
);

-- Add unique constraint for phone numbers (excluding empty/null values)
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_phone_key 
UNIQUE (phone) 
DEFERRABLE INITIALLY DEFERRED;

-- Create a function to normalize Indian phone numbers
CREATE OR REPLACE FUNCTION public.normalize_indian_phone(phone_input text)
RETURNS text AS $$
BEGIN
  -- Return null if input is null or empty
  IF phone_input IS NULL OR phone_input = '' THEN
    RETURN NULL;
  END IF;
  
  -- Remove any non-digit characters
  phone_input := regexp_replace(phone_input, '[^0-9]', '', 'g');
  
  -- Check if it's a valid 10-digit Indian mobile number
  IF phone_input ~ '^[6-9]\d{9}$' THEN
    RETURN '+91' || phone_input;
  END IF;
  
  -- Check if it starts with 91 followed by 10 digits
  IF phone_input ~ '^91[6-9]\d{9}$' THEN
    RETURN '+91' || substr(phone_input, 3);
  END IF;
  
  -- Check if it starts with 0 followed by 10 digits (Indian format)
  IF phone_input ~ '^0[6-9]\d{9}$' THEN
    RETURN '+91' || substr(phone_input, 2);
  END IF;
  
  -- If no valid format, return the original input (will be caught by check constraint)
  RETURN phone_input;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically normalize phone numbers
CREATE OR REPLACE FUNCTION public.normalize_phone_before_insert()
RETURNS TRIGGER AS $$
BEGIN
  NEW.phone := public.normalize_indian_phone(NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for phone normalization
DROP TRIGGER IF EXISTS normalize_phone_trigger ON public.profiles;
CREATE TRIGGER normalize_phone_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.normalize_phone_before_insert();

-- Add comment for documentation
COMMENT ON CONSTRAINT profiles_phone_format ON public.profiles IS 'Ensures phone numbers follow Indian format: +91 followed by 10 digits starting with 6-9, or just 10 digits starting with 6-9';
COMMENT ON FUNCTION public.normalize_indian_phone IS 'Normalizes Indian phone numbers to +91XXXXXXXXXX format';
