-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  farmer_name TEXT,
  farmer_phone TEXT,
  farmer_location TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  
  -- Order details
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  items_count INTEGER DEFAULT 0,
  
  -- Delivery information
  delivery_name TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_phone TEXT,
  delivery_email TEXT,
  delivery_date DATE,
  
  -- Additional fields
  notes TEXT,
  invoice_url TEXT,
  tracking_number TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Create order_items table for individual products
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
DROP POLICY IF EXISTS "Clients can view their own orders" ON orders;
CREATE POLICY "Clients can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Farmers can view orders for their products" ON orders;
CREATE POLICY "Farmers can view orders for their products"
  ON orders FOR SELECT
  USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Clients can insert their own orders" ON orders;
CREATE POLICY "Clients can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = client_id);

DROP POLICY IF EXISTS "Farmers can update orders they fulfill" ON orders;
CREATE POLICY "Farmers can update orders they fulfill"
  ON orders FOR UPDATE
  USING (auth.uid() = farmer_id);

-- RLS Policies for order_items
DROP POLICY IF EXISTS "Users can view order items for their orders" ON order_items;
CREATE POLICY "Users can view order items for their orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND (auth.uid() = orders.client_id OR auth.uid() = orders.farmer_id)
    )
  );

DROP POLICY IF EXISTS "Users can insert items for their orders" ON order_items;
CREATE POLICY "Users can insert items for their orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND auth.uid() = orders.client_id
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate order totals
CREATE OR REPLACE FUNCTION calculate_order_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update subtotal and total when items change
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
        UPDATE orders 
        SET 
            subtotal = (
                SELECT COALESCE(SUM(total_price), 0) 
                FROM order_items 
                WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
            ),
            total_amount = (
                SELECT COALESCE(SUM(total_price), 0) + COALESCE(delivery_fee, 0)
                FROM orders 
                WHERE id = COALESCE(NEW.order_id, OLD.order_id)
            ),
            items_count = (
                SELECT COALESCE(SUM(quantity), 0)
                FROM order_items 
                WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
            )
        WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers for order items
CREATE TRIGGER calculate_order_totals_on_insert
    AFTER INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_totals();

CREATE TRIGGER calculate_order_totals_on_update
    AFTER UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_totals();

CREATE TRIGGER calculate_order_totals_on_delete
    AFTER DELETE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_totals();
