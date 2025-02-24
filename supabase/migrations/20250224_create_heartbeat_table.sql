-- Create heartbeat table for keep-alive pings
CREATE TABLE IF NOT EXISTS _heartbeat (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE _heartbeat ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated users
CREATE POLICY "Allow inserts" ON _heartbeat
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create function to clean old heartbeat records
CREATE OR REPLACE FUNCTION clean_old_heartbeats()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Keep only the last 10 records
    DELETE FROM _heartbeat
    WHERE id NOT IN (
        SELECT id
        FROM _heartbeat
        ORDER BY timestamp DESC
        LIMIT 10
    );
END;
$$;

-- Create trigger to clean old records after each insert
CREATE OR REPLACE TRIGGER clean_heartbeats_trigger
    AFTER INSERT ON _heartbeat
    FOR EACH STATEMENT
    EXECUTE FUNCTION clean_old_heartbeats();
