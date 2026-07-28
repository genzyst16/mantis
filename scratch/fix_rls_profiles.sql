-- Allow all authenticated users to view profiles (needed for Personnel directory)
CREATE POLICY "Anyone can view profiles" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');
