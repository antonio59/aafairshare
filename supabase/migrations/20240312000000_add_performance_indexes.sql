-- Add performance indexes to frequently queried fields
-- This migration adds indexes to improve query performance for common operations

-- Indexes for expenses table
-- Index on date for date range queries
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses (date);

-- Index on paid_by for filtering by user
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by ON public.expenses (paid_by);

-- Index on category_id for filtering by category
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON public.expenses (category_id);

-- Index on amount for range queries
CREATE INDEX IF NOT EXISTS idx_expenses_amount ON public.expenses (amount);

-- Composite index for common query pattern: user + date range
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by_date ON public.expenses (paid_by, date);

-- Composite index for common query pattern: user + category
CREATE INDEX IF NOT EXISTS idx_expenses_paid_by_category ON public.expenses (paid_by, category_id);

-- Indexes for settlements table
-- Index on user_id for filtering by user
CREATE INDEX IF NOT EXISTS idx_settlements_user_id ON public.settlements (user_id);

-- Index on settled_at for date range queries
CREATE INDEX IF NOT EXISTS idx_settlements_settled_at ON public.settlements (settled_at);

-- Index on status for filtering by status
CREATE INDEX IF NOT EXISTS idx_settlements_status ON public.settlements (status);

-- Composite index for common query pattern: user + status
CREATE INDEX IF NOT EXISTS idx_settlements_user_id_status ON public.settlements (user_id, status);

-- Composite index for common query pattern: user + date
CREATE INDEX IF NOT EXISTS idx_settlements_user_id_settled_at ON public.settlements (user_id, settled_at);

-- Index for expense_locations junction table
CREATE INDEX IF NOT EXISTS idx_expense_locations_expense_id ON public.expense_locations (expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_locations_location_id ON public.expense_locations (location_id);

-- Add comment to document the purpose of these indexes
COMMENT ON INDEX public.idx_expenses_date IS 'Improves performance of date range queries';
COMMENT ON INDEX public.idx_expenses_paid_by IS 'Improves performance of user-specific expense queries';
COMMENT ON INDEX public.idx_expenses_category_id IS 'Improves performance of category filtering';
COMMENT ON INDEX public.idx_expenses_amount IS 'Improves performance of amount range queries';
COMMENT ON INDEX public.idx_expenses_paid_by_date IS 'Optimizes queries filtering by both user and date range';
COMMENT ON INDEX public.idx_expenses_paid_by_category IS 'Optimizes queries filtering by both user and category';

COMMENT ON INDEX public.idx_settlements_user_id IS 'Improves performance of user-specific settlement queries';
COMMENT ON INDEX public.idx_settlements_settled_at IS 'Improves performance of settlement date range queries';
COMMENT ON INDEX public.idx_settlements_status IS 'Improves performance of settlement status filtering';
COMMENT ON INDEX public.idx_settlements_user_id_status IS 'Optimizes queries filtering by both user and status';
COMMENT ON INDEX public.idx_settlements_user_id_settled_at IS 'Optimizes queries filtering by both user and settlement date';

COMMENT ON INDEX public.idx_expense_locations_expense_id IS 'Improves performance of location lookups by expense';
COMMENT ON INDEX public.idx_expense_locations_location_id IS 'Improves performance of expense lookups by location'; 