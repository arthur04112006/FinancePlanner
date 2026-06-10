-- MotoLife - Supabase schema
-- Use este script no SQL Editor do Supabase.
-- Versao demo sem autenticacao: todas as linhas usam user_id = 'demo'.
-- Para publicar em producao, troque as policies por auth.uid().

create extension if not exists pgcrypto;

create table if not exists public.monthly_settings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'demo',
  month_ref date not null default date_trunc('month', current_date)::date,
  salary numeric(12,2) not null default 3900,
  extra_income numeric(12,2) not null default 350,
  savings_goal numeric(12,2) not null default 500,
  daily_food_cut numeric(12,2) not null default 4,
  currency text not null default 'BRL',
  theme text not null default 'dark',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month_ref)
);

create table if not exists public.moto_profile (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'demo',
  model text not null,
  year integer not null,
  average_km_l numeric(8,2) not null,
  tank_liters numeric(8,2) not null,
  fuel_price numeric(8,2) not null,
  odometer integer not null default 0,
  next_oil_change_km integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'demo',
  category text not null,
  budget_limit numeric(12,2) not null,
  spent numeric(12,2) not null default 0,
  color text not null default '#7C3AED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'demo',
  name text not null,
  amount numeric(12,2) not null,
  due_day integer not null check (due_day between 1 and 31),
  status text not null check (status in ('Pago','Proximo','Atrasado')),
  category text not null default 'Contas',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'demo',
  description text not null,
  category text not null,
  amount numeric(12,2) not null,
  type text not null check (type in ('income','expense')),
  occurred_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'demo',
  name text not null,
  current_amount numeric(12,2) not null default 0,
  target_amount numeric(12,2) not null,
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fuel_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'demo',
  filled_at date not null default current_date,
  station text not null,
  liters numeric(8,2) not null,
  amount numeric(12,2) not null,
  odometer integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.rides (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'demo',
  destination text not null,
  ride_date date not null default current_date,
  distance_km numeric(10,2) not null,
  cost numeric(12,2) not null,
  city text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'demo',
  title text not null,
  event_date date not null,
  event_type text not null default 'Conta',
  color text not null default '#7C3AED',
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'demo',
  title text not null,
  description text not null default '',
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_monthly_settings_updated_at on public.monthly_settings;
create trigger set_monthly_settings_updated_at before update on public.monthly_settings
for each row execute function public.set_updated_at();

drop trigger if exists set_moto_profile_updated_at on public.moto_profile;
create trigger set_moto_profile_updated_at before update on public.moto_profile
for each row execute function public.set_updated_at();

drop trigger if exists set_budgets_updated_at on public.budgets;
create trigger set_budgets_updated_at before update on public.budgets
for each row execute function public.set_updated_at();

drop trigger if exists set_bills_updated_at on public.bills;
create trigger set_bills_updated_at before update on public.bills
for each row execute function public.set_updated_at();

drop trigger if exists set_goals_updated_at on public.goals;
create trigger set_goals_updated_at before update on public.goals
for each row execute function public.set_updated_at();

drop trigger if exists set_achievements_updated_at on public.achievements;
create trigger set_achievements_updated_at before update on public.achievements
for each row execute function public.set_updated_at();

alter table public.monthly_settings enable row level security;
alter table public.moto_profile enable row level security;
alter table public.budgets enable row level security;
alter table public.bills enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.fuel_logs enable row level security;
alter table public.rides enable row level security;
alter table public.calendar_events enable row level security;
alter table public.achievements enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'monthly_settings','moto_profile','budgets','bills','transactions',
    'goals','fuel_logs','rides','calendar_events','achievements'
  ]
  loop
    execute format('drop policy if exists "demo_select_%1$s" on public.%1$I', table_name);
    execute format('drop policy if exists "demo_insert_%1$s" on public.%1$I', table_name);
    execute format('drop policy if exists "demo_update_%1$s" on public.%1$I', table_name);
    execute format('drop policy if exists "demo_delete_%1$s" on public.%1$I', table_name);
    execute format('create policy "demo_select_%1$s" on public.%1$I for select using (user_id = ''demo'')', table_name);
    execute format('create policy "demo_insert_%1$s" on public.%1$I for insert with check (user_id = ''demo'')', table_name);
    execute format('create policy "demo_update_%1$s" on public.%1$I for update using (user_id = ''demo'') with check (user_id = ''demo'')', table_name);
    execute format('create policy "demo_delete_%1$s" on public.%1$I for delete using (user_id = ''demo'')', table_name);
  end loop;
end $$;

insert into public.monthly_settings (user_id, salary, extra_income, savings_goal, daily_food_cut, currency, theme)
values ('demo', 3900, 350, 500, 4, 'BRL', 'dark')
on conflict (user_id, month_ref) do nothing;

insert into public.moto_profile (user_id, model, year, average_km_l, tank_liters, fuel_price, odometer, next_oil_change_km)
values ('demo', 'Yamaha Fazer FZ25', 2023, 31, 14, 5.79, 28440, 29160)
on conflict (user_id) do nothing;

insert into public.budgets (user_id, category, budget_limit, spent, color) values
('demo','Moradia',1400,980,'#7C3AED'),
('demo','Mercado',800,580,'#3B82F6'),
('demo','Alimentacao',910,760,'#EF4444'),
('demo','Moto',738,458,'#22C55E'),
('demo','Lazer',300,210,'#F59E0B'),
('demo','Saude',300,140,'#14B8A6'),
('demo','Estudos',180,70,'#A855F7'),
('demo','Assinaturas',180,138,'#94A3B8')
on conflict do nothing;

insert into public.bills (user_id, name, amount, due_day, status, category) values
('demo','Luz',120,12,'Proximo','Energia'),
('demo','Internet',99,15,'Pago','Internet'),
('demo','Condominio',350,18,'Proximo','Moradia'),
('demo','Seguro da moto',120,7,'Atrasado','Moto')
on conflict do nothing;

insert into public.transactions (user_id, description, category, amount, type, occurred_at) values
('demo','Salario','Receita',3900,'income',current_date - 9),
('demo','Renda extra','Receita',350,'income',current_date - 4),
('demo','Posto Shell','Moto',95,'expense',current_date - 1),
('demo','Mercado Dia','Mercado',184.20,'expense',current_date - 2),
('demo','Cinema','Lazer',54,'expense',current_date - 3)
on conflict do nothing;

insert into public.goals (user_id, name, current_amount, target_amount, deadline) values
('demo','Capacete novo',480,1000,current_date + 150),
('demo','Jaqueta',270,1000,current_date + 240),
('demo','Reserva de emergencia',1830,3000,current_date + 120),
('demo','Viagem para Foz',920,2400,current_date + 210)
on conflict do nothing;

insert into public.fuel_logs (user_id, filled_at, station, liters, amount, odometer) values
('demo',current_date - 1,'Shell Centro',12.4,71.8,28440),
('demo',current_date - 9,'Ipiranga Norte',10.8,62.5,28108),
('demo',current_date - 18,'BR Via Sul',11.1,65.3,27762)
on conflict do nothing;

insert into public.rides (user_id, destination, ride_date, distance_km, cost, city) values
('demo','Morretes',current_date - 2,178,34,'Morretes'),
('demo','Lapa',current_date - 16,132,25,'Lapa'),
('demo','Antonina',current_date - 29,205,39,'Antonina')
on conflict do nothing;

insert into public.calendar_events (user_id, title, event_date, event_type, color) values
('demo','Seguro da moto',date_trunc('month', current_date)::date + interval '6 days','Conta','#EF4444'),
('demo','Luz',date_trunc('month', current_date)::date + interval '11 days','Conta','#F59E0B'),
('demo','Internet',date_trunc('month', current_date)::date + interval '14 days','Conta','#3B82F6'),
('demo','Condominio',date_trunc('month', current_date)::date + interval '17 days','Conta','#7C3AED'),
('demo','Troca de oleo',date_trunc('month', current_date)::date + interval '23 days','Moto','#22C55E')
on conflict do nothing;

insert into public.achievements (user_id, title, description, completed) values
('demo','1000 km rodados','Voce registrou mais de 1000 km.',true),
('demo','Primeira meta','Uma meta financeira foi iniciada.',true),
('demo','30 dias no orcamento','Fechar um mes sem ultrapassar o orcamento.',false),
('demo','Reserva criada','Criar e manter uma reserva de emergencia.',false)
on conflict do nothing;
