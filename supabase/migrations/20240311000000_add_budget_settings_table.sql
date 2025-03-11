-- Add budget_settings table
CREATE TABLE IF NOT EXISTS public.budget_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    monthly_target NUMERIC NOT NULL DEFAULT 2000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT budget_settings_user_id_key UNIQUE (user_id)
);

-- Add open policies that allow all authenticated users to access all budget settings
CREATE POLICY "Authenticated users can view all budget settings"
    ON public.budget_settings
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert budget settings for any user"
    ON public.budget_settings
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update any budget settings"
    ON public.budget_settings
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete any budget settings"
    ON public.budget_settings
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Enable RLS on the budget_settings table
ALTER TABLE public.budget_settings ENABLE ROW LEVEL SECURITY;

-- Create the set_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update the updated_at timestamp
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.budget_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budget_settings TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE public.budget_settings IS 'Stores user budget settings for expense tracking with open access policies'; 