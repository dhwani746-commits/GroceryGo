-- Enhanced Promo Codes Migration
-- Add one_per_user field and create promo_code_usage table

-- Add one_per_user field to promo_codes table
ALTER TABLE public.promo_codes 
ADD COLUMN IF NOT EXISTS one_per_user BOOLEAN DEFAULT false;

-- Create promo_code_usage table to track usage per user and order
CREATE TABLE IF NOT EXISTS public.promo_code_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  discount_amount NUMERIC(10,2) NOT NULL CHECK (discount_amount >= 0),
  used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure unique usage per user per promo code
  CONSTRAINT unique_user_promo_usage UNIQUE (promo_code_id, user_id)
);

-- Enable RLS on promo_code_usage table
ALTER TABLE public.promo_code_usage ENABLE ROW LEVEL SECURITY;

-- Create trigger for updated_at on promo_code_usage
CREATE TRIGGER promo_code_usage_updated_at BEFORE UPDATE ON public.promo_code_usage
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_promo_code_id ON public.promo_code_usage(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_user_id ON public.promo_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_order_id ON public.promo_code_usage(order_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_used_at ON public.promo_code_usage(used_at);

-- RLS Policies for promo_code_usage table
-- Admins can read all usage records
CREATE POLICY "Admins can view all promo code usage" ON public.promo_code_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Users can view their own promo code usage
CREATE POLICY "Users can view own promo code usage" ON public.promo_code_usage
  FOR SELECT USING (user_id = auth.uid());

-- Only admins can insert usage records (handled by system)
CREATE POLICY "Admins can insert promo code usage" ON public.promo_code_usage
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- No one can update usage records (they should be immutable)
CREATE POLICY "No updates on promo code usage" ON public.promo_code_usage
  FOR UPDATE USING (false);

-- Only admins can delete usage records
CREATE POLICY "Admins can delete promo code usage" ON public.promo_code_usage
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Function to check if a user has already used a specific promo code
CREATE OR REPLACE FUNCTION public.has_user_used_promo_code(
  p_user_id UUID,
  p_promo_code_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.promo_code_usage 
    WHERE user_id = p_user_id 
    AND promo_code_id = p_promo_code_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record promo code usage
CREATE OR REPLACE FUNCTION public.record_promo_code_usage(
  p_promo_code_id UUID,
  p_user_id UUID,
  p_order_id UUID,
  p_discount_amount NUMERIC
) RETURNS VOID AS $$
BEGIN
  -- Insert usage record
  INSERT INTO public.promo_code_usage (
    promo_code_id, 
    user_id, 
    order_id, 
    discount_amount
  ) VALUES (
    p_promo_code_id, 
    p_user_id, 
    p_order_id, 
    p_discount_amount
  );
  
  -- Update times_used count on promo_codes table
  UPDATE public.promo_codes 
  SET times_used = times_used + 1 
  WHERE id = p_promo_code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
