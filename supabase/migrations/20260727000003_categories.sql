-- Phase 4.1 Schema Additions: Equipment Categories

CREATE TABLE equipment_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE equipment_categories ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read categories
CREATE POLICY "Categories are viewable by all authenticated users"
ON equipment_categories FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow only authenticated users to insert/update (in a real app, limit to admins)
CREATE POLICY "Categories are manageable by admins"
ON equipment_categories FOR ALL
USING (auth.role() = 'authenticated');

-- Insert default categories
INSERT INTO equipment_categories (name, description) VALUES
('HVAC', 'Heating, Ventilation, and Air Conditioning systems'),
('Electrical', 'Power distribution, lighting, and generators'),
('Plumbing', 'Water supply, drainage, and pumps'),
('Fire Safety', 'Fire alarms, extinguishers, and sprinklers'),
('Other', 'Miscellaneous equipment');
