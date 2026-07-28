-- Seed default system permissions
INSERT INTO permissions (permission_key, description) VALUES
('properties.view', 'View properties and locations'),
('properties.manage', 'Create, edit, and delete properties'),
('equipment.view', 'View equipment and categories'),
('equipment.manage', 'Create, edit, and delete equipment'),
('templates.view', 'View inspection templates'),
('templates.manage', 'Create and modify dynamic inspection templates'),
('checkpoints.view', 'View inspection checkpoints (NFC/QR)'),
('checkpoints.manage', 'Create and manage checkpoints'),
('reports.view', 'View inspection reports and audit logs'),
('reports.manage', 'Manage or resolve inspection reports'),
('users.view', 'View personnel and roles'),
('users.manage', 'Invite personnel and assign roles')
ON CONFLICT (permission_key) DO NOTHING;

-- Grant standard permissions to authenticated users to interact with tables
-- Assuming role_permissions was read-only
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Role permissions are manageable by authenticated users"
ON role_permissions FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Roles are manageable by authenticated users"
ON roles FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Permissions are viewable by authenticated users"
ON permissions FOR SELECT
USING (auth.role() = 'authenticated');
