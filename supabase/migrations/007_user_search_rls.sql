-- Allow any authenticated user to read user rows for search
-- (API layer controls which columns are returned)
CREATE POLICY "Users read any authenticated" ON users
  FOR SELECT USING (auth.role() = 'authenticated');
