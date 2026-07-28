-- Phase 4.2 Fix: Add Admin Write Access to Phase 1 Tables

-- Properties
CREATE POLICY "Properties are manageable by authenticated users"
ON properties FOR ALL
USING (auth.role() = 'authenticated');

-- Maintenance Areas
CREATE POLICY "Areas are manageable by authenticated users"
ON maintenance_areas FOR ALL
USING (auth.role() = 'authenticated');

-- Equipment
CREATE POLICY "Equipment is manageable by authenticated users"
ON equipment FOR ALL
USING (auth.role() = 'authenticated');

-- Checkpoints
CREATE POLICY "Checkpoints are manageable by authenticated users"
ON checkpoints FOR ALL
USING (auth.role() = 'authenticated');

-- Inspection Templates
CREATE POLICY "Templates are manageable by authenticated users"
ON inspection_templates FOR ALL
USING (auth.role() = 'authenticated');

CREATE POLICY "Template Fields are manageable by authenticated users"
ON inspection_template_fields FOR ALL
USING (auth.role() = 'authenticated');
