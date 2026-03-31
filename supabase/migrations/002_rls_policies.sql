-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_anime ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_anime_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime_watch_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE anime_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE upcoming_anime ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_invites ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "Users read own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users read vault mates" ON users FOR SELECT
  USING (id IN (
    SELECT vm2.user_id FROM vault_members vm1
    JOIN vault_members vm2 ON vm1.vault_id = vm2.vault_id
    WHERE vm1.user_id = auth.uid()
  ));

-- vaults
CREATE POLICY "Vault read if member" ON vaults FOR SELECT
  USING (id IN (SELECT vault_id FROM vault_members WHERE user_id = auth.uid()));
CREATE POLICY "Vault create" ON vaults FOR INSERT WITH CHECK (true);

-- vault_members
CREATE POLICY "Members read" ON vault_members FOR SELECT
  USING (user_id = auth.uid() OR vault_id IN (SELECT vault_id FROM vault_members WHERE user_id = auth.uid()));
CREATE POLICY "Members insert" ON vault_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Members delete own" ON vault_members FOR DELETE USING (user_id = auth.uid());

-- anime
CREATE POLICY "Anime read all" ON anime FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Anime insert" ON anime FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Anime update" ON anime FOR UPDATE USING (auth.role() = 'authenticated');

-- vault_anime
CREATE POLICY "Vault anime read" ON vault_anime FOR SELECT
  USING (vault_id IN (SELECT vault_id FROM vault_members WHERE user_id = auth.uid()));
CREATE POLICY "Vault anime insert" ON vault_anime FOR INSERT
  WITH CHECK (vault_id IN (SELECT vault_id FROM vault_members WHERE user_id = auth.uid()));
CREATE POLICY "Vault anime delete" ON vault_anime FOR DELETE
  USING (vault_id IN (SELECT vault_id FROM vault_members WHERE user_id = auth.uid()));

-- user_anime_data
CREATE POLICY "User anime data read own" ON user_anime_data FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User anime data read vault mates" ON user_anime_data FOR SELECT
  USING (user_id IN (
    SELECT vm2.user_id FROM vault_members vm1
    JOIN vault_members vm2 ON vm1.vault_id = vm2.vault_id
    WHERE vm1.user_id = auth.uid()
  ));
CREATE POLICY "User anime data write own" ON user_anime_data FOR ALL USING (user_id = auth.uid());

-- anime_watch_sources
CREATE POLICY "Watch sources read" ON anime_watch_sources FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Watch sources insert" ON anime_watch_sources FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- recommendations
CREATE POLICY "Recs read" ON recommendations FOR SELECT
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());
CREATE POLICY "Recs insert" ON recommendations FOR INSERT WITH CHECK (from_user_id = auth.uid());
CREATE POLICY "Recs update" ON recommendations FOR UPDATE USING (to_user_id = auth.uid());

-- user_follows
CREATE POLICY "Follows read own" ON user_follows FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Follows write own" ON user_follows FOR ALL USING (user_id = auth.uid());

-- notifications
CREATE POLICY "Notifications read own" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Notifications update own" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- anime_cache
CREATE POLICY "Cache read" ON anime_cache FOR SELECT USING (auth.role() = 'authenticated');

-- upcoming_anime
CREATE POLICY "Upcoming read" ON upcoming_anime FOR SELECT USING (auth.role() = 'authenticated');

-- vault_invites
CREATE POLICY "Invites read own vault" ON vault_invites FOR SELECT
  USING (vault_id IN (SELECT vault_id FROM vault_members WHERE user_id = auth.uid()));
CREATE POLICY "Invites create" ON vault_invites FOR INSERT
  WITH CHECK (vault_id IN (SELECT vault_id FROM vault_members WHERE user_id = auth.uid()));
