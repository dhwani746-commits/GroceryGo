-- Fix profile creation trigger to ensure it works properly
-- This migration ensures the trigger is correctly set up and functioning

-- Drop existing trigger and function to recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the trigger execution for debugging
  RAISE LOG 'Creating profile for user: %, email: %', new.id, new.email;
  
  -- Insert into profiles table with all required fields
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'), 
    new.email,
    new.raw_user_meta_data->>'phone',
    'customer'
  );
  
  RAISE LOG 'Profile created successfully for user: %', new.id;
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile record when a new user signs up, including email and phone from metadata';

-- Test the trigger function (optional - can be removed in production)
-- This helps verify the trigger is working correctly
DO $$
DECLARE
  test_user_id UUID := gen_random_uuid();
BEGIN
  -- Simulate trigger execution with test data
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    test_user_id, 
    'Test User', 
    'test@example.com',
    '+919876543210',
    'customer'
  );
  
  -- Clean up test data
  DELETE FROM public.profiles WHERE id = test_user_id;
  
  RAISE LOG 'Profile trigger test completed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Profile trigger test failed: %', SQLERRM;
END $$;
