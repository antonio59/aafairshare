-- Create security_alerts table
CREATE TABLE IF NOT EXISTS security_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}',
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_security_alerts_type ON security_alerts(type);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_timestamp ON security_alerts(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_alerts_resolved ON security_alerts(resolved);

-- Add RLS policies
ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;

-- Only allow insert for authenticated users
CREATE POLICY "Allow insert for authenticated users" ON security_alerts
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Only allow read for admins
CREATE POLICY "Allow read for admins" ON security_alerts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND email IN ('andypamo@gmail.com') -- Add admin emails here
        )
    );

-- Function to clean old resolved alerts (older than 90 days)
CREATE OR REPLACE FUNCTION clean_old_security_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM security_alerts
    WHERE resolved = true
    AND resolved_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Create a scheduled job to clean old alerts (runs weekly)
SELECT cron.schedule(
    'clean-old-security-alerts',
    '0 0 * * 0', -- At midnight on Sunday
    $$
    SELECT clean_old_security_alerts();
    $$
);
