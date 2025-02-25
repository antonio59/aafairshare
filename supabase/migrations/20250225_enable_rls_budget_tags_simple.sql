-- Enable RLS on budget_tags table
alter table public.budget_tags enable row level security;

-- Single policy to allow only partner1 and partner2 to do everything
create policy "Allow partners full access"
on public.budget_tags
for all
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and (profiles.role = 'partner1' or profiles.role = 'partner2')
  )
);
