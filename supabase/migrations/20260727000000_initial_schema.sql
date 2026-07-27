-- Enable PostGIS for GPS calculations (distance in meters)
-- Actually, for simplicity and Supabase compatibility without special extensions if not available, we can use Haversine formula on the client or server, or enable PostGIS.
-- For now, let's just enable uuid-ossp.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. ROLES & PERMISSIONS
-- ==========================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permission_key TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ==========================================
-- 2. USERS / PROFILES
-- ==========================================
-- Assuming integrating with auth.users
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_number TEXT UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role_id UUID REFERENCES roles(id),
    department_id UUID, -- References departments (not explicitly detailed, making optional)
    default_property_id UUID, -- References properties
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ==========================================
-- 3. PROPERTIES & AREAS
-- ==========================================
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_code TEXT UNIQUE NOT NULL,
    property_name TEXT NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Update profile foreign key
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_property FOREIGN KEY (default_property_id) REFERENCES properties(id);

CREATE TABLE maintenance_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    area_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    area_id UUID REFERENCES maintenance_areas(id) ON DELETE SET NULL,
    equipment_code TEXT UNIQUE NOT NULL,
    equipment_name TEXT NOT NULL,
    equipment_category TEXT,
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ==========================================
-- 4. CHECKPOINTS & QR
-- ==========================================
CREATE TABLE checkpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    area_id UUID REFERENCES maintenance_areas(id) ON DELETE SET NULL,
    equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
    checkpoint_code TEXT UNIQUE NOT NULL,
    checkpoint_name TEXT NOT NULL,
    description TEXT,
    qr_token_hash TEXT NOT NULL, -- Hashed secure token
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    allowed_radius_meters DOUBLE PRECISION DEFAULT 35,
    maximum_accuracy_meters DOUBLE PRECISION DEFAULT 25,
    requires_photos BOOLEAN DEFAULT false,
    required_photo_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ==========================================
-- 5. INSPECTION TEMPLATES
-- ==========================================
CREATE TABLE inspection_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name TEXT NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE inspection_template_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES inspection_templates(id) ON DELETE CASCADE,
    field_key TEXT NOT NULL,
    field_label TEXT NOT NULL,
    field_type TEXT NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    validation_rules_json JSONB,
    options_json JSONB,
    conditional_rules_json JSONB,
    alert_rules_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE checkpoint_templates (
    checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE CASCADE,
    template_id UUID REFERENCES inspection_templates(id) ON DELETE CASCADE,
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    effective_until TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (checkpoint_id, template_id)
);

CREATE TABLE inspection_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE CASCADE,
    template_id UUID REFERENCES inspection_templates(id) ON DELETE CASCADE,
    assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_team_id UUID,
    schedule_type TEXT NOT NULL,
    scheduled_date DATE,
    start_time TIME,
    due_time TIME,
    grace_period_minutes INTEGER DEFAULT 0,
    recurrence_rule TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ==========================================
-- 6. INSPECTION SESSIONS & REPORTS
-- ==========================================
CREATE TABLE scan_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES inspection_schedules(id) ON DELETE SET NULL,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    initial_latitude DOUBLE PRECISION,
    initial_longitude DOUBLE PRECISION,
    initial_accuracy DOUBLE PRECISION,
    initial_distance_meters DOUBLE PRECISION,
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, USED, EXPIRED
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE inspection_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_number TEXT UNIQUE NOT NULL,
    scan_session_id UUID REFERENCES scan_sessions(id) ON DELETE SET NULL,
    schedule_id UUID REFERENCES inspection_schedules(id) ON DELETE SET NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    checkpoint_id UUID REFERENCES checkpoints(id) ON DELETE SET NULL,
    template_id UUID REFERENCES inspection_templates(id) ON DELETE SET NULL,
    template_version INTEGER,
    device_captured_at TIMESTAMP WITH TIME ZONE,
    server_received_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    initial_latitude DOUBLE PRECISION,
    initial_longitude DOUBLE PRECISION,
    initial_accuracy DOUBLE PRECISION,
    initial_distance_meters DOUBLE PRECISION,
    final_latitude DOUBLE PRECISION,
    final_longitude DOUBLE PRECISION,
    final_accuracy DOUBLE PRECISION,
    final_distance_meters DOUBLE PRECISION,
    verification_status TEXT NOT NULL,
    finding_severity TEXT,
    remarks TEXT,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE inspection_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES inspection_reports(id) ON DELETE CASCADE,
    field_id UUID REFERENCES inspection_template_fields(id) ON DELETE SET NULL,
    field_key TEXT NOT NULL,
    text_value TEXT,
    numeric_value DOUBLE PRECISION,
    boolean_value BOOLEAN,
    date_value TIMESTAMP WITH TIME ZONE,
    json_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE inspection_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES inspection_reports(id) ON DELETE CASCADE,
    field_id UUID REFERENCES inspection_template_fields(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER,
    captured_at TIMESTAMP WITH TIME ZONE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    is_duplicate BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE corrective_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES inspection_reports(id) ON DELETE CASCADE,
    finding_description TEXT NOT NULL,
    severity TEXT NOT NULL,
    assigned_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    due_date DATE,
    action_required TEXT,
    status TEXT DEFAULT 'Open',
    completion_remarks TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ==========================================
-- 7. AUDIT & SYSTEM
-- ==========================================
CREATE TABLE device_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_identifier TEXT UNIQUE,
    browser TEXT,
    operating_system TEXT,
    device_type TEXT,
    first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    previous_values_json JSONB,
    new_values_json JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- ==========================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoint_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Basic Policies (To be refined with specific role checks via functions in production)

-- Profiles: Users can view their own profile, Admins can view all
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Properties: Everyone authenticated can view active properties
CREATE POLICY "Anyone can view properties" ON properties
    FOR SELECT USING (auth.role() = 'authenticated');

-- Areas/Equipment/Checkpoints: Visible to authenticated
CREATE POLICY "Anyone can view areas" ON maintenance_areas
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can view equipment" ON equipment
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can view checkpoints" ON checkpoints
    FOR SELECT USING (auth.role() = 'authenticated');

-- Inspection Templates: Visible to authenticated
CREATE POLICY "Anyone can view templates" ON inspection_templates
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anyone can view template fields" ON inspection_template_fields
    FOR SELECT USING (auth.role() = 'authenticated');

-- Scan Sessions: Users manage their own scan sessions
CREATE POLICY "Users can manage their own scan sessions" ON scan_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Reports: Users can insert their own reports and view them
CREATE POLICY "Users can view their own reports" ON inspection_reports
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reports" ON inspection_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own values" ON inspection_values
    FOR SELECT USING (EXISTS (SELECT 1 FROM inspection_reports r WHERE r.id = report_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can insert values for their reports" ON inspection_values
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM inspection_reports r WHERE r.id = report_id AND r.user_id = auth.uid()));

CREATE POLICY "Users can view their own photos" ON inspection_photos
    FOR SELECT USING (EXISTS (SELECT 1 FROM inspection_reports r WHERE r.id = report_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can insert photos for their reports" ON inspection_photos
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM inspection_reports r WHERE r.id = report_id AND r.user_id = auth.uid()));

-- Add admin overrides later via auth.jwt() claims or role checking functions.
