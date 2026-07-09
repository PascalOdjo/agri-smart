-- Complete Debug Fix - Reset everything and recreate properly

-- Step 1: Drop all tables and start fresh
drop table if exists public.farms cascade;
drop table if exists public.products cascade;
drop table if exists public.orders cascade;
drop table if exists public.diagnostics cascade;

-- Step 2: Drop all storage buckets
delete from storage.buckets where id = 'product-images';
delete from storage.buckets where id = 'plant-images';

-- Step 3: Recreate tables without RLS first
create table public.farms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  farm_name text,
  region text,
  department text,
  commune text,
  gps_lat numeric,
  gps_lng numeric,
  farm_size numeric,
  main_crops text,
  production_goal text,
  equipment text,
  weather_station text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  price numeric not null,
  unit text default 'FCFA/kg',
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users(id) on delete cascade,
  farmer_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity numeric not null,
  total_price numeric not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected', 'completed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.diagnostics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text,
  disease_name text,
  symptoms text,
  cause text,
  severity text,
  treatment text,
  eco_treatment text,
  prevention text,
  cultural_practices text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Step 4: Create indexes
create index idx_farms_user_id on public.farms(user_id);
create index idx_products_farmer_id on public.products(farmer_id);
create index idx_orders_client_id on public.orders(client_id);
create index idx_orders_farmer_id on public.orders(farmer_id);
create index idx_orders_product_id on public.orders(product_id);
create index idx_diagnostics_user_id on public.diagnostics(user_id);

-- Step 5: Create storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 
  'product-images', 
  true, 
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'plant-images', 
  'plant-images', 
  true, 
  10485760, -- 10MB
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Step 6: Create storage policies
-- Product images policies
create policy "Public Access Product Images" on storage.objects for select using (bucket_id = 'product-images');
create policy "Users can upload product images" on storage.objects for insert with check (
  bucket_id = 'product-images' and 
  auth.role() = 'authenticated' and 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Plant images policies  
create policy "Public Access Plant Images" on storage.objects for select using (bucket_id = 'plant-images');
create policy "Users can upload plant images" on storage.objects for insert with check (
  bucket_id = 'plant-images' and 
  auth.role() = 'authenticated' and 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Step 7: Enable RLS and create table policies
alter table public.farms enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.diagnostics enable row level security;

-- Farms policies
create policy "Users can view own farm" on public.farms for select using (auth.uid() = user_id);
create policy "Users can insert own farm" on public.farms for insert with check (auth.uid() = user_id);
create policy "Users can update own farm" on public.farms for update using (auth.uid() = user_id);
create policy "Users can delete own farm" on public.farms for delete using (auth.uid() = user_id);

-- Products policies
create policy "Farmers can view own products" on public.products for select using (auth.uid() = farmer_id);
create policy "Farmers can insert own products" on public.products for insert with check (auth.uid() = farmer_id);
create policy "Farmers can update own products" on public.products for update using (auth.uid() = farmer_id);
create policy "Farmers can delete own products" on public.products for delete using (auth.uid() = farmer_id);
create policy "Anyone can view products" on public.products for select using (true);

-- Orders policies
create policy "Clients can view own orders" on public.orders for select using (auth.uid() = client_id);
create policy "Farmers can view orders for their products" on public.orders for select using (auth.uid() = farmer_id);
create policy "Clients can create orders" on public.orders for insert with check (auth.uid() = client_id);
create policy "Farmers can update order status" on public.orders for update using (auth.uid() = farmer_id);

-- Diagnostics policies
create policy "Users can view own diagnostics" on public.diagnostics for select using (auth.uid() = user_id);
create policy "Users can insert own diagnostics" on public.diagnostics for insert with check (auth.uid() = user_id);
create policy "Users can update own diagnostics" on public.diagnostics for update using (auth.uid() = user_id);
create policy "Users can delete own diagnostics" on public.diagnostics for delete using (auth.uid() = user_id);
