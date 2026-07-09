-- RLS: politiques d'accès

alter table public.profiles enable row level security;
alter table public.crops enable row level security;
alter table public.diagnostics enable row level security;
alter table public.market_prices enable row level security;
alter table public.formations enable row level security;

-- profiles: lecture/écriture pour le propriétaire
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = user_id);

-- crops: lecture/écriture pour le propriétaire
create policy "Users can view own crops" on public.crops for select using (auth.uid() = user_id);
create policy "Users can insert own crops" on public.crops for insert with check (auth.uid() = user_id);
create policy "Users can update own crops" on public.crops for update using (auth.uid() = user_id);
create policy "Users can delete own crops" on public.crops for delete using (auth.uid() = user_id);

-- diagnostics: lecture/écriture pour le propriétaire
create policy "Users can view own diagnostics" on public.diagnostics for select using (auth.uid() = user_id);
create policy "Users can insert own diagnostics" on public.diagnostics for insert with check (auth.uid() = user_id);
create policy "Users can update own diagnostics" on public.diagnostics for update using (auth.uid() = user_id);
create policy "Users can delete own diagnostics" on public.diagnostics for delete using (auth.uid() = user_id);

-- market_prices: lecture publique uniquement
create policy "Anyone can view market prices" on public.market_prices for select using (true);

-- formations: lecture publique uniquement
create policy "Anyone can view formations" on public.formations for select using (true);
