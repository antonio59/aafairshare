/*
 * Database Index Optimization Strategy
 *
 * 1. Foreign Key Indexes
 *    - We maintain indexes on all foreign key columns even if currently unused
 *    - This improves JOIN performance and prevents table locks during FK checks
 *    - As data volume grows, these indexes become crucial for query performance
 *    
 * 2. Index Retention Policy
 *    - Keep indexes that support foreign key constraints
 *    - Remove truly unused indexes that don't back any constraints
 *    - "Unused" status is normal for new tables or small data volumes
 *    
 * 3. Performance Considerations
 *    - Small storage overhead now vs. future performance benefits
 *    - Prevents performance degradation as tables grow
 *    - Follows PostgreSQL best practices for foreign key management
 */

-- Add or recreate indexes for all foreign keys
-- These improve JOIN performance and maintain referential integrity efficiently
create index if not exists "idx_audit_logs_user_id" on public.audit_logs (user_id);
create index if not exists "idx_budget_tags_tag_id" on public.budget_tags (tag_id);
create index if not exists "idx_budgets_category_id" on public.budgets (category_id);
create index if not exists "idx_categories_heading_id" on public.categories (heading_id);
create index if not exists "idx_expense_tags_tag_id" on public.expense_tags (tag_id);
create index if not exists "idx_expenses_category_id" on public.expenses (category_id);
create index if not exists "idx_expenses_paid_by_id" on public.expenses (paid_by_id);
create index if not exists "idx_expenses_recurring_expense_id" on public.expenses (recurring_expense_id);
create index if not exists "idx_expenses_recurring_event_id" on public.expenses (recurring_event_id);
create index if not exists "idx_recurring_expense_tags_tag_id" on public.recurring_expense_tags (tag_id);
create index if not exists "idx_recurring_expenses_category_id" on public.recurring_expenses (category_id);
create index if not exists "idx_recurring_expenses_paid_by_id" on public.recurring_expenses (paid_by_id);
create index if not exists "idx_settlements_paid_by_id" on public.settlements (paid_by_id);
create index if not exists "idx_settlements_paid_to_id" on public.settlements (paid_to_id);

-- Drop truly unused indexes that aren't backing foreign keys
-- These indexes have no foreign key constraints and haven't been used in queries
drop index if exists public.idx_audit_logs_type;
