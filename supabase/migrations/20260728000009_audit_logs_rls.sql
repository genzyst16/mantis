-- Add SELECT policy for audit_logs so authenticated users can view the data
-- The UI already restricts access to this page using RBAC.
CREATE POLICY "Authenticated users can view audit logs"
    ON audit_logs
    FOR SELECT
    USING (auth.role() = 'authenticated');
