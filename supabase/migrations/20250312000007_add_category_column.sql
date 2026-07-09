-- Add category column to products table if it doesn't exist
-- First check if the column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE products ADD COLUMN category TEXT;
    END IF;
END $$;

-- Update existing products with default category if null
UPDATE products 
SET category = 'légumes' 
WHERE category IS NULL;

-- Create index for category if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
