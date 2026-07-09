-- Fix admin role for specific user

-- Update the admin user's role from 'client' to 'admin'
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{}'::jsonb || '{"role": "admin"}'::jsonb
WHERE email = 'admin@agrismart.com';

-- Also update the profiles table to match
UPDATE profiles 
SET role = 'admin',
    updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@agrismart.com'
);

-- Verify the update
SELECT 
  u.email,
  u.raw_user_meta_data->>'role' as current_role,
  p.role as profile_role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.email = 'admin@agrismart.com';
