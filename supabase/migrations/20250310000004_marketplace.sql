-- Migration pour la marketplace (Agriculteurs et Clients)

-- Produits mis en vente (Côté Agriculteur)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  price numeric not null,
  unit text default 'FCFA/kg',
  stock numeric default 0,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Commandes (Côté Client)
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

-- Index
create index if not exists idx_products_farmer_id on public.products(farmer_id);
create index if not exists idx_orders_client_id on public.orders(client_id);
create index if not exists idx_orders_farmer_id on public.orders(farmer_id);

-- RLS: politiques d'accès
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Products: lecture publique (clients + agriculteurs)
create policy "Anyone can view products" on public.products for select using (true);

-- Products: écriture par le propriétaire (agriculteur)
create policy "Farmers can insert products" on public.products for insert with check (auth.uid() = farmer_id);
create policy "Farmers can update own products" on public.products for update using (auth.uid() = farmer_id);
create policy "Farmers can delete own products" on public.products for delete using (auth.uid() = farmer_id);

-- Orders: lecture pour l'agriculteur et le client
create policy "Users can view own orders" on public.orders for select using (auth.uid() = client_id or auth.uid() = farmer_id);

-- Orders: insertion par le client
create policy "Clients can create orders" on public.orders for insert with check (auth.uid() = client_id);

-- Orders: mise à jour
create policy "Users can update own orders" on public.orders for update using (auth.uid() = client_id or auth.uid() = farmer_id);
