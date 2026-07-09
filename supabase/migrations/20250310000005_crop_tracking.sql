-- Extend the crops table for tracking

alter table public.crops 
add column if not exists planting_date date,
add column if not exists expected_harvest_date date,
add column if not exists status text default 'planté' check (status in ('planifié', 'planté', 'en croissance', 'récolté')),
add column if not exists surface_area numeric,
add column if not exists notes text;
