-- 20260727000006_password_policies.sql

ALTER TABLE profiles
ADD COLUMN password_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN prevent_password_change BOOLEAN DEFAULT false,
ADD COLUMN force_password_change BOOLEAN DEFAULT false;
