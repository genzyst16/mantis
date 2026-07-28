-- Create junction table for many-to-many relationship between profiles and properties
CREATE TABLE IF NOT EXISTS personnel_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    UNIQUE(user_id, property_id)
);

-- Enable RLS and add basic policies
ALTER TABLE personnel_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read personnel_properties" ON personnel_properties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert personnel_properties" ON personnel_properties FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can delete personnel_properties" ON personnel_properties FOR DELETE TO authenticated USING (true);

-- Populate personnel_properties from existing default_property_id data
INSERT INTO personnel_properties (user_id, property_id)
SELECT id, default_property_id 
FROM profiles 
WHERE default_property_id IS NOT NULL
ON CONFLICT DO NOTHING;
