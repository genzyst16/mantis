-- Add user_type to distinguish personnel (field workers) from system users (admins, managers, etc.)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'personnel' 
    CHECK (user_type IN ('personnel', 'system'));

-- Add access_level to control which parts of the app the user can access
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'dashboard'
    CHECK (access_level IN ('dashboard', 'admin', 'both'));

-- Set existing users that are already using the admin panel to 'both'
-- (We don't know which ones, so we default safely to 'dashboard' and let admin correct as needed)
-- Admins can manually update their own profiles after migration.
