-- Create products table for marketplace

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  price numeric not null,
  unit text default 'FCFA/kg',
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create index for farmer queries
create index if not exists idx_products_farmer_id on public.products(farmer_id);

-- Enable RLS
alter table public.products enable row level security;

-- Policies for products table
create policy "Farmers can view own products" on public.products for select using (auth.uid() = farmer_id);
create policy "Farmers can insert own products" on public.products for insert with check (auth.uid() = farmer_id);
create policy "Farmers can update own products" on public.products for update using (auth.uid() = farmer_id);
create policy "Farmers can delete own products" on public.products for delete using (auth.uid() = farmer_id);

-- Clients can view all products
create policy "Anyone can view products" on public.products for select using (true);

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
