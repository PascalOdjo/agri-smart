-- Create orders table for marketplace transactions

create table if not exists public.orders (
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

-- Create indexes for order queries
create index if not exists idx_orders_client_id on public.orders(client_id);
create index if not exists idx_orders_farmer_id on public.orders(farmer_id);
create index if not exists idx_orders_product_id on public.orders(product_id);

-- Enable RLS
alter table public.orders enable row level security;

-- Policies for orders table
create policy "Clients can view own orders" on public.orders for select using (auth.uid() = client_id);
create policy "Farmers can view orders for their products" on public.orders for select using (auth.uid() = farmer_id);
create policy "Clients can create orders" on public.orders for insert with check (auth.uid() = client_id);
create policy "Farmers can update order status" on public.orders for update using (auth.uid() = farmer_id);
