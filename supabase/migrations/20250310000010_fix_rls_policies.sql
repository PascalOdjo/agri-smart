-- Fix RLS policies for all tables

-- Drop existing policies if they exist
drop policy if exists "Users can view own farm" on public.farms;
drop policy if exists "Users can insert own farm" on public.farms;
drop policy if exists "Users can update own farm" on public.farms;
drop policy if exists "Users can delete own farm" on public.farms;

drop policy if exists "Farmers can view own products" on public.products;
drop policy if exists "Farmers can insert own products" on public.products;
drop policy if exists "Farmers can update own products" on public.products;
drop policy if exists "Farmers can delete own products" on public.products;
drop policy if exists "Anyone can view products" on public.products;

drop policy if exists "Clients can view own orders" on public.orders;
drop policy if exists "Farmers can view orders for their products" on public.orders;
drop policy if exists "Clients can create orders" on public.orders;
drop policy if exists "Farmers can update order status" on public.orders;

-- Recreate correct policies for farms table
create policy "Users can view own farm" on public.farms for select using (auth.uid() = user_id);
create policy "Users can insert own farm" on public.farms for insert with check (auth.uid() = user_id);
create policy "Users can update own farm" on public.farms for update using (auth.uid() = user_id);
create policy "Users can delete own farm" on public.farms for delete using (auth.uid() = user_id);

-- Recreate correct policies for products table
create policy "Farmers can view own products" on public.products for select using (auth.uid() = farmer_id);
create policy "Farmers can insert own products" on public.products for insert with check (auth.uid() = farmer_id);
create policy "Farmers can update own products" on public.products for update using (auth.uid() = farmer_id);
create policy "Farmers can delete own products" on public.products for delete using (auth.uid() = farmer_id);
create policy "Anyone can view products" on public.products for select using (true);

-- Recreate correct policies for orders table
create policy "Clients can view own orders" on public.orders for select using (auth.uid() = client_id);
create policy "Farmers can view orders for their products" on public.orders for select using (auth.uid() = farmer_id);
create policy "Clients can create orders" on public.orders for insert with check (auth.uid() = client_id);
create policy "Farmers can update order status" on public.orders for update using (auth.uid() = farmer_id);

-- Ensure RLS is enabled on all tables
alter table public.farms enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
