-- STEP 2: Enable RLS and create policies after tables are created

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE national_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_price_adjustments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (using user_metadata instead of profiles.role)
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for regions (public read, admin write)
CREATE POLICY "Anyone can view regions" ON regions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage regions" ON regions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for national prices
CREATE POLICY "Anyone can view national prices" ON national_prices
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage national prices" ON national_prices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- RLS Policies for regional price adjustments
CREATE POLICY "Anyone can view regional adjustments" ON regional_price_adjustments
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage regional adjustments" ON regional_price_adjustments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
