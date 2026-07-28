-- Allow authenticated users to insert corrective actions (tasks)
ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;

-- Admins, supervisors, team leaders can do everything
CREATE POLICY "Authenticated users can insert tasks"
ON corrective_actions
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can read tasks"
ON corrective_actions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update tasks"
ON corrective_actions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
