-- Create production_journal table for tracking farm activities

-- Create table
create table public.production_journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  type text not null check (type in ('intervention', 'observation', 'harvest')),
  title text not null,
  description text,
  crop_type text not null check (crop_type in ('maize', 'cassava', 'other')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes
create index if not exists idx_production_journal_user_id on public.production_journal(user_id);
create index if not exists idx_production_journal_date on public.production_journal(date);
create index if not exists idx_production_journal_crop_type on public.production_journal(crop_type);

-- Enable RLS
alter table public.production_journal enable row level security;

-- Create policies
create policy "Users can view own journal entries" on public.production_journal for select using (auth.uid() = user_id);
create policy "Users can insert own journal entries" on public.production_journal for insert with check (auth.uid() = user_id);
create policy "Users can update own journal entries" on public.production_journal for update using (auth.uid() = user_id);
create policy "Users can delete own journal entries" on public.production_journal for delete using (auth.uid() = user_id);
