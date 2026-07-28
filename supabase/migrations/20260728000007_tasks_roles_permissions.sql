INSERT INTO permissions (permission_key, description) VALUES
('tasks.view', 'View tasks and queue'),
('tasks.manage', 'Create, edit, delete and assign tasks'),
('roles.view', 'View system roles'),
('roles.manage', 'Create roles and manage permissions')
ON CONFLICT (permission_key) DO NOTHING;
