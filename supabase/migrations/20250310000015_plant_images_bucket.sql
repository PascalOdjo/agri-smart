-- Create storage bucket for plant images

-- Create bucket for plant diagnostic images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'plant-images', 
  'plant-images', 
  true, 
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) on conflict (id) do nothing;

-- Allow public access to plant images
create policy "Public Access" on storage.objects for select using (bucket_id = 'plant-images');

-- Allow authenticated users to upload plant images
create policy "Users can upload plant images" on storage.objects for insert with check (
  bucket_id = 'plant-images' and 
  auth.role() = 'authenticated' and 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own plant images
create policy "Users can update own plant images" on storage.objects for update using (
  bucket_id = 'plant-images' and 
  auth.role() = 'authenticated' and 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own plant images
create policy "Users can delete own plant images" on storage.objects for delete using (
  bucket_id = 'plant-images' and 
  auth.role() = 'authenticated' and 
  (storage.foldername(name))[1] = auth.uid()::text
);
