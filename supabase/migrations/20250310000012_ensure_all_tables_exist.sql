-- Ensure all required tables exist with correct structure

-- Diagnostics table (for AI diagnostic feature)
create table if not exists public.diagnostics (
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

-- Create indexes
create index if not exists idx_diagnostics_user_id on public.diagnostics(user_id);

-- Enable RLS
alter table public.diagnostics enable row level security;

-- Create policies
create policy "Users can view own diagnostics" on public.diagnostics for select using (auth.uid() = user_id);
create policy "Users can insert own diagnostics" on public.diagnostics for insert with check (auth.uid() = user_id);
create policy "Users can update own diagnostics" on public.diagnostics for update using (auth.uid() = user_id);
create policy "Users can delete own diagnostics" on public.diagnostics for delete using (auth.uid() = user_id);
