-- Add discount fields to products table
-- original_price: The original/strikethrough price (must be higher than price)
-- discount_percentage: Auto-calculated discount percentage

ALTER TABLE products
ADD COLUMN IF NOT EXISTS original_price NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER;

-- Add constraint: original_price must be greater than price if set
ALTER TABLE products
ADD CONSTRAINT check_original_price_higher 
CHECK (original_price IS NULL OR original_price > price);

-- Add constraint: discount_percentage must be between 1 and 99 if set
ALTER TABLE products
ADD CONSTRAINT check_discount_percentage_range 
CHECK (discount_percentage IS NULL OR (discount_percentage >= 1 AND discount_percentage <= 99));

-- Create function to auto-calculate discount percentage
CREATE OR REPLACE FUNCTION calculate_discount_percentage()
RETURNS TRIGGER AS $$
BEGIN
    -- If original_price is set and greater than price, calculate percentage
    IF NEW.original_price IS NOT NULL AND NEW.original_price > NEW.price THEN
        NEW.discount_percentage := ROUND(((NEW.original_price - NEW.price) / NEW.original_price) * 100);
    ELSE
        NEW.discount_percentage := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate discount on insert/update
DROP TRIGGER IF EXISTS calculate_discount_trigger ON products;
CREATE TRIGGER calculate_discount_trigger
    BEFORE INSERT OR UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION calculate_discount_percentage();

-- Update comment for documentation
COMMENT ON COLUMN products.original_price IS 'Original price for display with strikethrough (must be higher than price)';
COMMENT ON COLUMN products.discount_percentage IS 'Auto-calculated discount percentage based on original_price and price';
