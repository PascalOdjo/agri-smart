-- Re-enable proper RLS (for future use when ready to fix RLS properly)

-- Drop bypass policies
drop policy if exists "Bypass All Farms" on public.farms;
drop policy if exists "Bypass All Products" on public.products;
drop policy if exists "Bypass All Orders" on public.orders;
drop policy if exists "Bypass All Diagnostics" on public.diagnostics;

-- Re-enable RLS
alter table public.farms enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.diagnostics enable row level security;

-- Recreate proper policies
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
