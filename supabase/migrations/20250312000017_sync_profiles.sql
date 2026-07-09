-- Synchronize users from auth.users to profiles table

-- Insert existing users from auth.users into profiles table
INSERT INTO profiles (user_id, full_name, role, status, created_at, updated_at)
SELECT 
  id as user_id,
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
  COALESCE(raw_user_meta_data->>'role', 'user') as role,
  'active' as status,
  created_at,
  created_at as updated_at
FROM auth.users 
WHERE id NOT IN (
  SELECT user_id FROM profiles
);

-- Update existing profiles with missing metadata
UPDATE profiles 
SET 
  role = COALESCE(
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE auth.users.id = profiles.user_id),
    'user'
  ),
  full_name = COALESCE(
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE auth.users.id = profiles.user_id),
    (SELECT email FROM auth.users WHERE auth.users.id = profiles.user_id)
  ),
  updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE raw_user_meta_data->>'role' IS NOT NULL
) AND user_id IN (
  SELECT user_id FROM profiles
);

-- Create profiles for users that don't exist and have role in metadata
INSERT INTO profiles (user_id, full_name, role, status, created_at, updated_at)
SELECT 
  id as user_id,
  COALESCE(raw_user_meta_data->>'full_name', email) as full_name,
  COALESCE(raw_user_meta_data->>'role', 'user') as role,
  'active' as status,
  created_at,
  created_at as updated_at
FROM auth.users 
WHERE raw_user_meta_data->>'role' IS NOT NULL
AND id NOT IN (
  SELECT user_id FROM profiles
);
