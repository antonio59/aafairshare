-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(255) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_type ON audit_logs(type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Add RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only allow insert for authenticated users
CREATE POLICY "Allow insert for authenticated users" ON audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Only allow read for admins and users viewing their own logs
CREATE POLICY "Allow read for admins and own logs" ON audit_logs
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND email IN ('andypamo@gmail.com') -- Add admin emails here
        )
    );

-- Function to clean old audit logs (older than 1 year)
CREATE OR REPLACE FUNCTION clean_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM audit_logs
    WHERE timestamp < NOW() - INTERVAL '1 year';
END;
$$;

-- Create a scheduled job to clean old logs (runs monthly)
SELECT cron.schedule(
    'clean-old-audit-logs',
    '0 0 1 * *', -- At midnight on the first day of every month
    $$
    SELECT clean_old_audit_logs();
    $$
);
