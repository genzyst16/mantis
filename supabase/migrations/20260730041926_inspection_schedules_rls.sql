-- RLS Policies for inspection_schedules

CREATE POLICY "Inspection schedules are manageable by authenticated users"
ON inspection_schedules FOR ALL
USING (auth.role() = 'authenticated');
