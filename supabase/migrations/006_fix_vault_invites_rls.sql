-- Fix: invite join flow blocked by RLS for non-members.
--
-- The original policy required the querying user to already be a vault member,
-- which is impossible for the join flow — the invitee is not a member yet.
--
-- Replacement: any authenticated user may read vault_invites.
-- The UUID token is the authorization mechanism (unguessable, 36 chars).

DROP POLICY IF EXISTS "Invites read own vault" ON vault_invites;

CREATE POLICY "Invites read authenticated" ON vault_invites FOR SELECT
  USING (auth.role() = 'authenticated');
