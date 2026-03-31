-- Fix vault creation: INSERT ... RETURNING triggers the SELECT policy,
-- which checks vault_members. But vault_members doesn't exist yet at
-- RETURNING time, so Postgres throws 42501.
--
-- Solution: a SECURITY DEFINER function that inserts vault + member
-- atomically before returning the row, bypassing the RLS timing issue.

CREATE OR REPLACE FUNCTION create_vault_for_user(
  p_name    TEXT,
  p_emoji   TEXT,
  p_type    vault_type
)
RETURNS SETOF vaults
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vault vaults;
BEGIN
  INSERT INTO vaults (name, emoji, type)
  VALUES (p_name, p_emoji, p_type)
  RETURNING * INTO v_vault;

  INSERT INTO vault_members (vault_id, user_id)
  VALUES (v_vault.id, auth.uid());

  RETURN NEXT v_vault;
END;
$$;
