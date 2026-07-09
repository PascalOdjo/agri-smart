-- Complete products table setup with RLS policies and triggers

-- Enable RLS if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Farmers can insert their own products" ON products;
CREATE POLICY "Farmers can insert their own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can update their own products" ON products;
CREATE POLICY "Farmers can update their own products"
  ON products FOR UPDATE
  USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can delete their own products" ON products;
CREATE POLICY "Farmers can delete their own products"
  ON products FOR DELETE
  USING (auth.uid() = farmer_id);

-- Create function for updated_at timestamp if it doesn't exist
CREATE OR REPLACE FUNCTION update_products_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_products_updated_at_column();
