-- Create admin user or update existing user to admin role
-- First check if the user exists and update their metadata
-- Note: This needs to be done through Supabase Auth, not directly in SQL

-- Alternative approach: Create a trigger to set admin role for specific users
CREATE OR REPLACE FUNCTION check_admin_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Set admin role for specific email addresses
    IF NEW.email = 'admin@agrismart.com' THEN
        NEW.raw_user_meta_data = COALESCE(NEW.raw_user_meta_data, '{}')::jsonb || '{"role": "admin"}'::jsonb;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set admin role
DROP TRIGGER IF EXISTS set_admin_role ON auth.users;
CREATE TRIGGER set_admin_role
    BEFORE INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION check_admin_role();

-- For existing users, you need to update through Supabase Auth Dashboard
-- Or use the following approach with a separate admin_roles table

-- Create admin_roles table for better role management
CREATE TABLE IF NOT EXISTS admin_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for admin_roles
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Policy for admin roles
CREATE POLICY "Users can view their own role" ON admin_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON admin_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_roles ar2 
            WHERE ar2.user_id = auth.uid() 
            AND ar2.role = 'admin'
        )
    );

-- Insert admin role for a specific user (replace with actual user ID)
-- Uncomment and modify the user_id after creating the user
-- INSERT INTO admin_roles (user_id, role) 
-- VALUES ('YOUR_USER_ID_HERE', 'admin');

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_roles 
        WHERE user_id = user_uuid 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
