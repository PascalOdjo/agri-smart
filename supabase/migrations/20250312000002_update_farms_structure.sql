-- Migration pour supporter plusieurs fermes et parcelles

-- 1. Supprimer la contrainte unique pour permettre plusieurs fermes par utilisateur
alter table public.farms drop constraint if exists farms_user_id_key;

-- 2. Créer la table des parcelles
create table if not exists public.parcels (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  name text not null,
  surface_area numeric, -- en hectares
  crop_id uuid references public.crops(id) on delete set null,
  gps_coordinates jsonb, -- {lat: number, lng: number} ou polygon pour délimitation
  soil_type text,
  irrigation_type text,
  planting_date date,
  expected_harvest_date date,
  status text default 'active' check (status in ('active', 'inactive', 'preparing', 'harvested')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Mettre à jour la table crops pour la lier aux fermes
alter table public.crops 
add column if not exists farm_id uuid references public.farms(id) on delete cascade,
add column if not exists parcel_id uuid references public.parcels(id) on delete cascade;

-- 4. Mettre à jour les cultures existantes pour les lier à la première ferme de l'utilisateur
update public.crops 
set farm_id = (
  select id from public.farms 
  where farms.user_id = crops.user_id 
  limit 1
)
where farm_id is null;

-- 5. Index pour les performances
create index if not exists idx_parcels_farm_id on public.parcels(farm_id);
create index if not exists idx_parcels_crop_id on public.parcels(crop_id);
create index if not exists idx_crops_farm_id on public.crops(farm_id);
create index if not exists idx_crops_parcel_id on public.crops(parcel_id);

-- 6. Activer RLS sur les parcelles
alter table public.parcels enable row level security;

-- 7. Politiques pour les parcelles
create policy "Users can view own parcels" on public.parcels for select using (
  exists (
    select 1 from public.farms 
    where farms.id = parcels.farm_id and farms.user_id = auth.uid()
  )
);

create policy "Users can insert own parcels" on public.parcels for insert with check (
  exists (
    select 1 from public.farms 
    where farms.id = parcels.farm_id and farms.user_id = auth.uid()
  )
);

create policy "Users can update own parcels" on public.parcels for update using (
  exists (
    select 1 from public.farms 
    where farms.id = parcels.farm_id and farms.user_id = auth.uid()
  )
);

create policy "Users can delete own parcels" on public.parcels for delete using (
  exists (
    select 1 from public.farms 
    where farms.id = parcels.farm_id and farms.user_id = auth.uid()
  )
);

-- 8. Mettre à jour les politiques des cultures pour supporter les fermes
drop policy if exists "Users can view own crops" on public.crops;
drop policy if exists "Users can insert own crops" on public.crops;
drop policy if exists "Users can update own crops" on public.crops;
drop policy if exists "Users can delete own crops" on public.crops;

create policy "Users can view own crops" on public.crops for select using (
  exists (
    select 1 from public.farms 
    where farms.id = crops.farm_id and farms.user_id = auth.uid()
  )
);

create policy "Users can insert own crops" on public.crops for insert with check (
  exists (
    select 1 from public.farms 
    where farms.id = crops.farm_id and farms.user_id = auth.uid()
  )
);

create policy "Users can update own crops" on public.crops for update using (
  exists (
    select 1 from public.farms 
    where farms.id = crops.farm_id and farms.user_id = auth.uid()
  )
);

create policy "Users can delete own crops" on public.crops for delete using (
  exists (
    select 1 from public.farms 
    where farms.id = crops.farm_id and farms.user_id = auth.uid()
  )
);
