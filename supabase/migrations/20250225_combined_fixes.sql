-- Add role to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- Enable RLS on budget_tags with simple partner access
ALTER TABLE public.budget_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Partners can access budget tags" ON public.budget_tags;
CREATE POLICY "Partners can access budget tags" ON public.budget_tags
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (SELECT auth.uid())
            AND role = 'partner'
        )
    );

-- Create and configure database functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, role)
    VALUES (new.id, 'user');
    RETURN new;
END;
$$;

-- Add or recreate indexes for all foreign keys
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON public.audit_logs (user_id);
CREATE INDEX IF NOT EXISTS "idx_budget_tags_tag_id" ON public.budget_tags (tag_id);
CREATE INDEX IF NOT EXISTS "idx_budgets_category_id" ON public.budgets (category_id);
CREATE INDEX IF NOT EXISTS "idx_categories_heading_id" ON public.categories (heading_id);
CREATE INDEX IF NOT EXISTS "idx_expense_tags_tag_id" ON public.expense_tags (tag_id);
CREATE INDEX IF NOT EXISTS "idx_expenses_category_id" ON public.expenses (category_id);
CREATE INDEX IF NOT EXISTS "idx_expenses_paid_by_id" ON public.expenses (paid_by_id);
CREATE INDEX IF NOT EXISTS "idx_expenses_recurring_expense_id" ON public.expenses (recurring_expense_id);
CREATE INDEX IF NOT EXISTS "idx_expenses_recurring_event_id" ON public.expenses (recurring_event_id);
CREATE INDEX IF NOT EXISTS "idx_recurring_expense_tags_tag_id" ON public.recurring_expense_tags (tag_id);
CREATE INDEX IF NOT EXISTS "idx_recurring_expenses_category_id" ON public.recurring_expenses (category_id);
CREATE INDEX IF NOT EXISTS "idx_recurring_expenses_paid_by_id" ON public.recurring_expenses (paid_by_id);
CREATE INDEX IF NOT EXISTS "idx_settlements_paid_by_id" ON public.settlements (paid_by_id);
CREATE INDEX IF NOT EXISTS "idx_settlements_paid_to_id" ON public.settlements (paid_to_id);

-- Drop truly unused indexes that aren't backing foreign keys
DROP INDEX IF EXISTS public.idx_audit_logs_type;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
