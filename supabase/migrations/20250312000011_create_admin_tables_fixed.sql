-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  phone TEXT,
  region TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'farmer', 'client', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create regions table for territorial management
CREATE TABLE IF NOT EXISTS regions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  population INTEGER DEFAULT 0,
  main_products TEXT[], -- Array of main products
  coordinates POINT, -- Geographic coordinates
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create national_prices table for price reference
CREATE TABLE IF NOT EXISTS national_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_category TEXT NOT NULL,
  product_name TEXT NOT NULL,
  reference_price DECIMAL(10,2) NOT NULL CHECK (reference_price >= 0),
  unit TEXT NOT NULL,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create regional_price_adjustments table
CREATE TABLE IF NOT EXISTS regional_price_adjustments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
  national_price_id UUID REFERENCES national_prices(id) ON DELETE CASCADE,
  reference_price DECIMAL(10,2) NOT NULL CHECK (reference_price >= 0),
  adjustment_percentage DECIMAL(5,2) DEFAULT 0 CHECK (adjustment_percentage >= -50 AND adjustment_percentage <= 50),
  adjusted_price DECIMAL(10,2) GENERATED ALWAYS AS (reference_price * (1 + adjustment_percentage / 100)) STORED,
  reason TEXT,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_region ON profiles(region);
CREATE INDEX IF NOT EXISTS idx_regions_name ON regions(name);
CREATE INDEX IF NOT EXISTS idx_national_prices_category ON national_prices(product_category);
CREATE INDEX IF NOT EXISTS idx_national_prices_status ON national_prices(status);
CREATE INDEX IF NOT EXISTS idx_regional_adjustments_region ON regional_price_adjustments(region_id);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE national_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_price_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (simplified)
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for regions (public read, admin write)
CREATE POLICY "Anyone can view regions" ON regions
  FOR SELECT USING (true);

-- RLS Policies for national prices (public read for active prices)
CREATE POLICY "Anyone can view national prices" ON national_prices
  FOR SELECT USING (status = 'active');

-- RLS Policies for regional price adjustments (public read for active adjustments)
CREATE POLICY "Anyone can view regional adjustments" ON regional_price_adjustments
  FOR SELECT USING (status = 'active');

-- Insert default regions for Togo
INSERT INTO regions (name, code, description, population, main_products) VALUES
('Lomé', 'LOM', 'Région maritime, capitale économique', 2000000, ARRAY['tomates', 'poisson', 'légumes', 'produits de mer']),
('Kara', 'KAR', 'Région centrale, zone agricole', 800000, ARRAY['riz', 'igname', 'mil', 'sorgho']),
('Sokodé', 'SOK', 'Région du centre, zone d''élevage', 600000, ARRAY['miel', 'viande', 'lait', 'produits laitiers']),
('Atakpamé', 'ATA', 'Région des plateaux, zone caféière', 500000, ARRAY['café', 'cacao', 'bananes', 'ananas']),
('Mango', 'MAN', 'Région des savanes, zone céréalière', 400000, ARRAY['mil', 'sorgho', 'arachide', 'coton']),
('Dapaong', 'DAP', 'Région la plus au nord, zone pastorale', 300000, ARRAY['bétail', 'viande', 'lait', 'produits pastoraux'])
ON CONFLICT (name) DO NOTHING;

-- Insert national reference prices
INSERT INTO national_prices (product_category, product_name, reference_price, unit, effective_date, created_by) VALUES
('légumes', 'Tomates', 2500, 'kg', CURRENT_DATE, NULL),
('légumes', 'Oignons', 1800, 'kg', CURRENT_DATE, NULL),
('céréales', 'Riz', 600, 'kg', CURRENT_DATE, NULL),
('céréales', 'Maïs', 400, 'kg', CURRENT_DATE, NULL),
('produits laitiers', 'Lait', 1500, 'L', CURRENT_DATE, NULL),
('miel', 'Miel artisanal', 8000, 'pot', CURRENT_DATE, NULL),
('viande', 'Viande de bœuf', 3500, 'kg', CURRENT_DATE, NULL),
('fruits', 'Bananes', 800, 'kg', CURRENT_DATE, NULL)
ON CONFLICT DO NOTHING;

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regions_updated_at 
    BEFORE UPDATE ON regions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_national_prices_updated_at 
    BEFORE UPDATE ON national_prices 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regional_adjustments_updated_at 
    BEFORE UPDATE ON regional_price_adjustments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
