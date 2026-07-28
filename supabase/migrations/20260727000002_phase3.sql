-- Phase 3 Schema Additions

-- 1. Push Subscriptions
CREATE TABLE push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE (user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push subscriptions"
ON push_subscriptions FOR ALL 
USING (auth.uid() = user_id);

-- Optional: Ensure audit_logs is easily viewable by admins
-- Add index on audit logs for faster admin sorting
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
