create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  business_name text,
  logo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  invoice_number text not null,
  invoice_date date not null default current_date,
  due_date date,
  invoice_type text not null check (invoice_type in ('residential', 'commercial')),
  status text not null default 'unpaid' check (status in ('paid', 'unpaid', 'overdue')),
  tax_rate numeric(8,2) not null default 0,
  discount numeric(12,2) not null default 0,
  notes text,
  terms text,
  public_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unique(user_id, invoice_number)
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  quantity numeric(12,2) not null default 1,
  price numeric(12,2) not null default 0,
  sort_order integer not null default 0
);

create table if not exists public.payment_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_payment_link text,
  paypal_payment_link text,
  preferred_provider text not null default 'stripe' check (preferred_provider in ('stripe', 'paypal')),
  updated_at timestamptz not null default now()
);

create table if not exists public.founder_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  amount integer not null default 4900,
  provider text,
  provider_reference text,
  created_at timestamptz not null default now()
);

create index if not exists customers_user_id_idx on public.customers(user_id);
create index if not exists invoices_user_id_status_idx on public.invoices(user_id, status);
create index if not exists invoice_items_invoice_id_idx on public.invoice_items(invoice_id);
create index if not exists founder_purchases_email_idx on public.founder_purchases(email);

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payment_settings enable row level security;
alter table public.founder_purchases enable row level security;

create policy "profiles are owned by user" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "customers are owned by user" on public.customers for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "invoices are owned by user" on public.invoices for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "invoice items are owned by user" on public.invoice_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "payment settings are owned by user" on public.payment_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "founder purchases visible to owner email" on public.founder_purchases for select using (auth.jwt() ->> 'email' = email);

-- Public invoice view can be added with a SECURITY DEFINER function keyed by invoices.public_token.
-- Future: Stripe Payment Links API can write provider_reference to founder_purchases.
-- Future: PayPal Checkout API can write provider_reference to founder_purchases.
