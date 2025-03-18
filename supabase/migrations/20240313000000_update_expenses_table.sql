-- This migration updates the expenses table to support split types and ensures all required fields exist

-- First, create the expenses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    category_id UUID REFERENCES public.categories(id),
    location_id UUID REFERENCES public.locations(id),
    notes TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_by UUID REFERENCES auth.users(id) NOT NULL,
    split_type TEXT NOT NULL CHECK (split_type IN ('50/50', '100')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indices for performance
CREATE INDEX IF NOT EXISTS idx_expenses_split_type ON public.expenses(split_type);
CREATE INDEX IF NOT EXISTS idx_expenses_month_year ON public.expenses(date_trunc('month', date));

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for better documentation
COMMENT ON TABLE public.expenses IS 'Stores expense records between two users';
COMMENT ON COLUMN public.expenses.split_type IS 'Indicates how the expense is split: 50/50 or 100 (fully owed by other user)';
COMMENT ON COLUMN public.expenses.amount IS 'The total amount of the expense';
COMMENT ON COLUMN public.expenses.category_id IS 'Reference to the expense category';
COMMENT ON COLUMN public.expenses.location_id IS 'Reference to the location where expense occurred';
COMMENT ON COLUMN public.expenses.notes IS 'Additional notes about the expense';
COMMENT ON COLUMN public.expenses.date IS 'When the expense occurred';
COMMENT ON COLUMN public.expenses.paid_by IS 'User who paid for the expense';