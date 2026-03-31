-- Fix infinite recursion in vault_members SELECT policy.
--
-- The original policy:
--   USING (user_id = auth.uid() OR vault_id IN (SELECT vault_id FROM vault_members WHERE user_id = auth.uid()))
--
-- ...causes infinite recursion because the subquery references vault_members,
-- which re-triggers the same policy.
--
-- Fix: use a SECURITY DEFINER function that queries vault_members without RLS,
-- breaking the recursive cycle.

CREATE OR REPLACE FUNCTION get_user_vault_ids(uid UUID)
RETURNS SETOF UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT vault_id FROM vault_members WHERE user_id = uid;
$$;

DROP POLICY IF EXISTS "Members read" ON vault_members;

CREATE POLICY "Members read" ON vault_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR vault_id IN (SELECT get_user_vault_ids(auth.uid()))
  );
