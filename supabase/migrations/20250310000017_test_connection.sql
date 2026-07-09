-- Test script to verify everything works

-- Test 1: Check if tables exist
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('farms', 'products', 'orders', 'diagnostics')
ORDER BY table_name;

-- Test 2: Check if storage buckets exist
SELECT * FROM storage.buckets WHERE name IN ('product-images', 'plant-images');

-- Test 3: Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerlspolicy
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('farms', 'products', 'orders', 'diagnostics');

-- Test 4: Check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test 5: Simple insert test (this will help identify RLS issues)
-- Uncomment to test:
-- INSERT INTO public.farms (user_id, farm_name) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Test Farm');

-- Test 6: Check current user
SELECT current_user, auth.uid() as user_id;
