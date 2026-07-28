-- Seed Users / Profiles (Requires manually matching with auth.users if you want them to log in)
-- Or you can create users via the Supabase Auth UI, then update their roles here.

INSERT INTO roles (name, description) VALUES 
('Super Administrator', 'Full system access'),
('Property Administrator', 'Access to assigned properties'),
('Maintenance Supervisor', 'Can review and manage personnel in property'),
('Maintenance Personnel', 'Can perform inspections');

-- Example Property
INSERT INTO properties (property_code, property_name, address, latitude, longitude)
VALUES 
('SR', 'S Resort', '123 Beachfront Ave, Island', 14.5995, 120.9842),
('HH', 'H Hotel', '456 Downtown Blvd, City', 14.6000, 120.9800);

-- Example Maintenance Area
INSERT INTO maintenance_areas (property_id, area_name, description)
SELECT id, 'Generator Area', 'Main power generation facility' FROM properties WHERE property_code = 'SR';

-- Example Equipment
INSERT INTO equipment (property_id, area_id, equipment_code, equipment_name, equipment_category)
SELECT p.id, a.id, 'GEN-001', 'Main Generator No. 1', 'Generator' 
FROM properties p
JOIN maintenance_areas a ON a.property_id = p.id
WHERE p.property_code = 'SR' AND a.area_name = 'Generator Area';

-- Example Checkpoint
INSERT INTO checkpoints (property_id, area_id, equipment_id, checkpoint_code, checkpoint_name, qr_token_hash, latitude, longitude, allowed_radius_meters, maximum_accuracy_meters, requires_photos, required_photo_count)
SELECT p.id, a.id, e.id, 'CHK-GEN-01', 'Main Generator No. 1', 'MCT-CHK-SEED-7f9c1e83', 14.5995, 120.9842, 35, 25, true, 2
FROM properties p
JOIN maintenance_areas a ON a.property_id = p.id
JOIN equipment e ON e.property_id = p.id
WHERE p.property_code = 'SR' AND a.area_name = 'Generator Area' AND e.equipment_code = 'GEN-001';
