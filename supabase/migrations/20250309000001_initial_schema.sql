-- AgriSmart Togo - Schéma initial
-- Exécuter dans l'éditeur SQL Supabase ou via supabase db push

-- Profiles (optionnel: nom, région)
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  region text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Cultures par agriculteur
create table if not exists public.crops (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- Diagnostics plante (image + résultat IA)
create table if not exists public.diagnostics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text,
  disease_name text,
  severity text,
  solution text,
  eco_alternative text,
  created_at timestamptz default now()
);

-- Prix marché (lecture publique)
create table if not exists public.market_prices (
  id uuid primary key default gen_random_uuid(),
  product text not null,
  region text not null,
  price_per_kg numeric,
  unit text default 'FCFA',
  updated_at timestamptz default now()
);

-- Mini-formations (vidéos, fiches)
create table if not exists public.formations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('video', 'fiche')),
  url text,
  description text,
  order_index int default 0,
  created_at timestamptz default now()
);

-- Index pour les requêtes courantes
create index if not exists idx_diagnostics_user_id on public.diagnostics(user_id);
create index if not exists idx_crops_user_id on public.crops(user_id);
create index if not exists idx_market_prices_region on public.market_prices(region);
create index if not exists idx_formations_order on public.formations(order_index);
