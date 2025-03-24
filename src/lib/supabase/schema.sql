-- Create a table for user profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a trigger to automatically update the updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row
  execute function update_updated_at_column();

-- Create a table for expenses
create table expenses (
  id uuid default gen_random_uuid() primary key,
  description text not null,
  amount decimal(10,2) not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger update_expenses_updated_at
  before update on expenses
  for each row
  execute function update_updated_at_column();

-- Create a table for expense splits
create table expense_splits (
  id uuid default gen_random_uuid() primary key,
  expense_id uuid references expenses(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  amount decimal(10,2) not null,
  paid boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create trigger update_expense_splits_updated_at
  before update on expense_splits
  for each row
  execute function update_updated_at_column();

-- Create a table for friends/connections
create table connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  friend_id uuid references profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'rejected')) not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, friend_id)
);

create trigger update_connections_updated_at
  before update on connections
  for each row
  execute function update_updated_at_column();

-- Create RLS policies
alter table profiles enable row level security;
alter table expenses enable row level security;
alter table expense_splits enable row level security;
alter table connections enable row level security;

-- Profiles policies
create policy "Users can view their own profile."
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile."
  on profiles for update
  using (auth.uid() = id);

-- Expenses policies
create policy "Users can view expenses they created or are part of."
  on expenses for select
  using (
    auth.uid() = created_by or
    exists (
      select 1 from expense_splits
      where expense_splits.expense_id = expenses.id
      and expense_splits.user_id = auth.uid()
    )
  );

create policy "Users can create expenses."
  on expenses for insert
  with check (auth.uid() = created_by);

create policy "Users can update their own expenses."
  on expenses for update
  using (auth.uid() = created_by);

-- Expense splits policies
create policy "Users can view their own splits and splits of expenses they created."
  on expense_splits for select
  using (
    user_id = auth.uid() or
    exists (
      select 1 from expenses
      where expenses.id = expense_splits.expense_id
      and expenses.created_by = auth.uid()
    )
  );

create policy "Users can create splits."
  on expense_splits for insert
  with check (
    exists (
      select 1 from expenses
      where expenses.id = expense_splits.expense_id
      and expenses.created_by = auth.uid()
    )
  );

-- Connections policies
create policy "Users can view their own connections."
  on connections for select
  using (user_id = auth.uid() or friend_id = auth.uid());

create policy "Users can create connections."
  on connections for insert
  with check (user_id = auth.uid());

create policy "Users can update their own connections."
  on connections for update
  using (user_id = auth.uid() or friend_id = auth.uid());

-- Create categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create locations table
create table locations (
  id uuid default gen_random_uuid() primary key,
  location text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create users table (matches auth.users)
create table users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create expenses table
create table expenses (
  id uuid default gen_random_uuid() primary key,
  amount numeric(10,2) not null,
  date timestamp with time zone not null,
  notes text,
  split_type text not null,
  paid_by uuid references auth.users(id) on delete cascade not null,
  category_id uuid references categories(id) on delete cascade,
  location_id uuid references locations(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create expense_locations junction table
create table expense_locations (
  id uuid default gen_random_uuid() primary key,
  expense_id uuid references expenses(id) on delete cascade not null,
  location_id uuid references locations(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create exports table
create table exports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  data_type text not null,
  format text not null,
  filters jsonb,
  file_name text not null,
  file_data text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reports table
create table reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  report_type text not null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  report_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create settlements table
create table settlements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  month_year text not null,
  amount numeric(10,2) not null,
  is_settled boolean default false,
  settled_date timestamp with time zone,
  paid_by_user_id uuid references auth.users(id) on delete cascade not null,
  owed_by_user_id uuid references auth.users(id) on delete cascade not null,
  status text check (status in ('pending', 'completed')) not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table categories enable row level security;
alter table locations enable row level security;
alter table users enable row level security;
alter table expenses enable row level security;
alter table expense_locations enable row level security;
alter table exports enable row level security;
alter table reports enable row level security;
alter table settlements enable row level security;

-- RLS Policies
create policy "Users can view all categories"
  on categories for select
  to authenticated
  using (true);

create policy "Users can view all locations"
  on locations for select
  to authenticated
  using (true);

create policy "Users can view their own user data"
  on users for select
  using (auth.uid() = id);

create policy "Users can update their own user data"
  on users for update
  using (auth.uid() = id);

create policy "Users can view expenses they paid for or are part of"
  on expenses for select
  using (auth.uid() = paid_by);

create policy "Users can create expenses"
  on expenses for insert
  with check (auth.uid() = paid_by);

create policy "Users can update their own expenses"
  on expenses for update
  using (auth.uid() = paid_by);

create policy "Users can view their own expense locations"
  on expense_locations for select
  using (
    exists (
      select 1 from expenses
      where expenses.id = expense_locations.expense_id
      and expenses.paid_by = auth.uid()
    )
  );

create policy "Users can manage their own exports"
  on exports for all
  using (auth.uid() = user_id);

create policy "Users can manage their own reports"
  on reports for all
  using (auth.uid() = user_id);

create policy "Users can view their own settlements"
  on settlements for select
  using (
    auth.uid() = user_id or
    auth.uid() = paid_by_user_id or
    auth.uid() = owed_by_user_id
  ); 