-- ==============================================================================
-- Anviti — Carbon Footprint Monitoring Database Schema
-- Supabase PostgreSQL with Row Level Security (RLS)
-- ==============================================================================

-- 1. PROFILES TABLE
-- Stores optional metadata for authenticated users
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  household_size integer default 1 check (household_size > 0),
  region text default 'India',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Profiles RLS Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger to auto-create profile on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop if exists and recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. FOOTPRINT_RECORDS TABLE
-- Stores calculated emission entries for users
create table if not exists public.footprint_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  period_label text default 'Weekly',
  
  -- Transport
  transport_mode text not null default 'car_petrol',
  transport_km numeric not null default 0 check (transport_km >= 0),
  transport_co2e numeric not null default 0 check (transport_co2e >= 0),
  
  -- Electricity
  electricity_kwh numeric not null default 0 check (electricity_kwh >= 0),
  electricity_co2e numeric not null default 0 check (electricity_co2e >= 0),
  
  -- Food
  diet_type text not null default 'mixed',
  food_co2e numeric not null default 0 check (food_co2e >= 0),
  
  -- Consumption
  shopping_activity text not null default 'none',
  consumption_co2e numeric not null default 0 check (consumption_co2e >= 0),
  
  -- Totals & Hotspot Analytics
  total_co2e numeric not null check (total_co2e >= 0),
  highest_category text not null,
  highest_category_pct numeric not null check (highest_category_pct >= 0 and highest_category_pct <= 100),
  
  -- Metadata
  factors_used jsonb default '{}'::jsonb,
  raw_input jsonb default '{}'::jsonb,
  
  -- Timestamps
  recorded_at timestamptz default now() not null,
  created_at timestamptz default now() not null
);

-- Indexes for efficient querying by user and date
create index if not exists idx_footprint_records_user_date 
  on public.footprint_records (user_id, recorded_at desc);

create index if not exists idx_footprint_records_user_total 
  on public.footprint_records (user_id, total_co2e);

-- Enable RLS for footprint_records
alter table public.footprint_records enable row level security;

-- Footprint Records RLS Policies: strict user isolation
create policy "Users can read own footprint records"
  on public.footprint_records for select
  using (auth.uid() = user_id);

create policy "Users can insert own footprint records"
  on public.footprint_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update own footprint records"
  on public.footprint_records for update
  using (auth.uid() = user_id);

create policy "Users can delete own footprint records"
  on public.footprint_records for delete
  using (auth.uid() = user_id);


-- 3. SUSTAINABILITY_GOALS TABLE
-- Stores weekly / monthly reduction commitments created by users or via the AI Assistant
create table if not exists public.sustainability_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text not null default 'general',
  target_reduction_kg numeric not null default 5.0 check (target_reduction_kg >= 0),
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes for goals
create index if not exists idx_sustainability_goals_user 
  on public.sustainability_goals (user_id, status);

-- Enable RLS for sustainability_goals
alter table public.sustainability_goals enable row level security;

-- Sustainability Goals RLS Policies
create policy "Users can read own sustainability goals"
  on public.sustainability_goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own sustainability goals"
  on public.sustainability_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sustainability goals"
  on public.sustainability_goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own sustainability goals"
  on public.sustainability_goals for delete
  using (auth.uid() = user_id);
