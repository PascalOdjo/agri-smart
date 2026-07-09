-- RLS Bypass - Temporarily disable RLS for testing

-- Disable RLS completely for debugging
alter table public.farms disable row level security;
alter table public.products disable row level security;
alter table public.orders disable row level security;
alter table public.diagnostics disable row level security;

-- Create simple bypass policies (allow everything temporarily)
create policy "Bypass - Allow all on farms" on public.farms for all using (true);
create policy "Bypass - Allow all on products" on public.products for all using (true);
create policy "Bypass - Allow all on orders" on public.orders for all using (true);
create policy "Bypass - Allow all on diagnostics" on public.diagnostics for all using (true);

-- Note: This is temporary for testing. Replace with proper RLS later.
