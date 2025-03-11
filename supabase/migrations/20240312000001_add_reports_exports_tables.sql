-- Add tables for storing reports and exports
-- These tables are used by the task queue system for long-running operations

-- Reports table for storing generated reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  report_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
  ON public.reports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
  ON public.reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON public.reports
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON public.reports
  FOR DELETE
  USING (auth.uid() = user_id);

-- Exports table for storing exported data
CREATE TABLE IF NOT EXISTS public.exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,
  format TEXT NOT NULL,
  filters JSONB DEFAULT '{}'::jsonb,
  file_name TEXT NOT NULL,
  file_data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies for exports
ALTER TABLE public.exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exports"
  ON public.exports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exports"
  ON public.exports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exports"
  ON public.exports
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exports"
  ON public.exports
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports (user_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_type ON public.reports (report_type);
CREATE INDEX IF NOT EXISTS idx_reports_date_range ON public.reports (start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_exports_user_id ON public.exports (user_id);
CREATE INDEX IF NOT EXISTS idx_exports_data_type ON public.exports (data_type);
CREATE INDEX IF NOT EXISTS idx_exports_created_at ON public.exports (created_at);

-- Add comment to document the purpose of these tables
COMMENT ON TABLE public.reports IS 'Stores generated reports from the task queue system';
COMMENT ON TABLE public.exports IS 'Stores exported data from the task queue system'; 