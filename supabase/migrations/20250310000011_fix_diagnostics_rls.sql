-- Fix RLS policies for diagnostics table

-- Drop existing policies if they exist
drop policy if exists "Users can view own diagnostics" on public.diagnostics;
drop policy if exists "Users can insert own diagnostics" on public.diagnostics;
drop policy if exists "Users can update own diagnostics" on public.diagnostics;
drop policy if exists "Users can delete own diagnostics" on public.diagnostics;

-- Recreate correct policies for diagnostics table
create policy "Users can view own diagnostics" on public.diagnostics for select using (auth.uid() = user_id);
create policy "Users can insert own diagnostics" on public.diagnostics for insert with check (auth.uid() = user_id);
create policy "Users can update own diagnostics" on public.diagnostics for update using (auth.uid() = user_id);
create policy "Users can delete own diagnostics" on public.diagnostics for delete using (auth.uid() = user_id);

-- Ensure RLS is enabled
alter table public.diagnostics enable row level security;
