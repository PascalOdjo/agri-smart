-- Add image_url column to products table

alter table public.products 
add column if not exists image_url text;

-- Create storage bucket for product images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 
  'product-images', 
  true, 
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) on conflict (id) do nothing;

-- Allow public access to product images
create policy "Public Access" on storage.objects for select using (bucket_id = 'product-images');

-- Allow authenticated users to upload product images
create policy "Users can upload product images" on storage.objects for insert with check (
  bucket_id = 'product-images' and 
  auth.role() = 'authenticated' and 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own product images
create policy "Users can update own product images" on storage.objects for update using (
  bucket_id = 'product-images' and 
  auth.role() = 'authenticated' and 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own product images
create policy "Users can delete own product images" on storage.objects for delete using (
  bucket_id = 'product-images' and 
  auth.role() = 'authenticated' and 
  (storage.foldername(name))[1] = auth.uid()::text
);
