-- Debug script to check current state
-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'products'
) AS products_exists;

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Check if policies exist
SELECT policyname, tablename
FROM pg_policies 
WHERE tablename = 'products';

-- Simple trigger check
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'update_products_updated_at';
