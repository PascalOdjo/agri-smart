-- Create farms table for farm management

create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  farm_name text,
  region text,
  department text,
  commune text,
  gps_lat numeric,
  gps_lng numeric,
  farm_size numeric, -- in hectares
  main_crops text,
  production_goal text,
  equipment text,
  weather_station text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id) -- Each user can have only one farm
);

-- Create index for user queries
create index if not exists idx_farms_user_id on public.farms(user_id);

-- Enable RLS
alter table public.farms enable row level security;

-- Policies for farms table
create policy "Users can view own farm" on public.farms for select using (auth.uid() = user_id);
create policy "Users can insert own farm" on public.farms for insert with check (auth.uid() = user_id);
create policy "Users can update own farm" on public.farms for update using (auth.uid() = user_id);
create policy "Users can delete own farm" on public.farms for delete using (auth.uid() = user_id);
