-- Set search_path for clean_old_audit_logs function
alter function public.clean_old_audit_logs()
set search_path = public;

-- Set search_path for update_updated_at_column function
alter function public.update_updated_at_column()
set search_path = public;

-- Set search_path for generate_monthly_settlement function
alter function public.generate_monthly_settlement(month_start date)
set search_path = public;

-- Set search_path for generate_recurring_expenses function
alter function public.generate_recurring_expenses()
set search_path = public;

-- Set search_path for calculate_monthly_settlements function
alter function public.calculate_monthly_settlements(month_start date)
set search_path = public;

-- Set search_path for handle_new_user function
alter function public.handle_new_user()
set search_path = public;

-- Drop pg_net extension if it exists (since it's flagged as a security concern)
-- First check if it exists to avoid errors
do $$
begin
  if exists (
    select 1
    from pg_extension
    where extname = 'pg_net'
  ) then
    drop extension pg_net;
  end if;
end $$;
