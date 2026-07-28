CREATE OR REPLACE FUNCTION log_audit_event() RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    previous_values JSONB := NULL;
    new_values JSONB := NULL;
    extracted_entity_id UUID;
BEGIN
    -- Try to get the user ID from the Supabase auth context
    BEGIN
        current_user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        current_user_id := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        new_values := row_to_json(NEW)::jsonb;
        extracted_entity_id := NEW.id;
    ELSIF TG_OP = 'UPDATE' THEN
        previous_values := row_to_json(OLD)::jsonb;
        new_values := row_to_json(NEW)::jsonb;
        extracted_entity_id := NEW.id;
    ELSIF TG_OP = 'DELETE' THEN
        previous_values := row_to_json(OLD)::jsonb;
        extracted_entity_id := OLD.id;
    END IF;

    -- Avoid logging if no actual data changes in an update
    IF TG_OP = 'UPDATE' AND previous_values = new_values THEN
        RETURN NEW;
    END IF;

    INSERT INTO audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        previous_values_json,
        new_values_json
    ) VALUES (
        current_user_id,
        TG_OP,
        TG_TABLE_NAME,
        extracted_entity_id,
        previous_values,
        new_values
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist to prevent duplicates during re-runs
DROP TRIGGER IF EXISTS audit_properties_trigger ON properties;
DROP TRIGGER IF EXISTS audit_profiles_trigger ON profiles;
DROP TRIGGER IF EXISTS audit_corrective_actions_trigger ON corrective_actions;
DROP TRIGGER IF EXISTS audit_roles_trigger ON roles;

-- Attach triggers to target tables
CREATE TRIGGER audit_properties_trigger
    AFTER INSERT OR UPDATE OR DELETE ON properties
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_profiles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_corrective_actions_trigger
    AFTER INSERT OR UPDATE OR DELETE ON corrective_actions
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_roles_trigger
    AFTER INSERT OR UPDATE OR DELETE ON roles
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();
