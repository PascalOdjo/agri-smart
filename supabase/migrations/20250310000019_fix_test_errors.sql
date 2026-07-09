-- Fix Test Errors - Clean up existing data and fix missing column

-- Step 1: Clean up existing test data
delete from public.farms where farm_name = 'Ferme de test' and notes = 'Test de connexion';
delete from public.diagnostics where disease_name = 'Test maladie';

-- Step 2: Check and add missing columns to diagnostics table
do $$
begin
    -- Add cause column if it doesn't exist
    if not exists (
        select 1 from information_schema.columns 
        where table_name = 'diagnostics' 
        and column_name = 'cause'
        and table_schema = 'public'
    ) then
        alter table public.diagnostics add column cause text;
    end if;
    
    -- Add other potentially missing columns
    if not exists (
        select 1 from information_schema.columns 
        where table_name = 'diagnostics' 
        and column_name = 'symptoms'
        and table_schema = 'public'
    ) then
        alter table public.diagnostics add column symptoms text;
    end if;
    
    if not exists (
        select 1 from information_schema.columns 
        where table_name = 'diagnostics' 
        and column_name = 'treatment'
        and table_schema = 'public'
    ) then
        alter table public.diagnostics add column treatment text;
    end if;
    
    if not exists (
        select 1 from information_schema.columns 
        where table_name = 'diagnostics' 
        and column_name = 'eco_treatment'
        and table_schema = 'public'
    ) then
        alter table public.diagnostics add column eco_treatment text;
    end if;
    
    if not exists (
        select 1 from information_schema.columns 
        where table_name = 'diagnostics' 
        and column_name = 'prevention'
        and table_schema = 'public'
    ) then
        alter table public.diagnostics add column prevention text;
    end if;
    
    if not exists (
        select 1 from information_schema.columns 
        where table_name = 'diagnostics' 
        and column_name = 'cultural_practices'
        and table_schema = 'public'
    ) then
        alter table public.diagnostics add column cultural_practices text;
    end if;
end $$;

-- Step 3: Verify table structure
select 
    column_name, 
    data_type, 
    is_nullable
from information_schema.columns 
where table_name = 'diagnostics' 
and table_schema = 'public'
order by ordinal_position;
