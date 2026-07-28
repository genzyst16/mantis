ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Set the initial super admin
UPDATE profiles SET is_super_admin = true WHERE email = 'geray@hhgroup.ph';
