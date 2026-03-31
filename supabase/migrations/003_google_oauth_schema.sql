-- Change 22: Replace avatar/color with avatar_url/theme/notification_preferences

ALTER TABLE users DROP COLUMN IF EXISTS avatar;
ALTER TABLE users DROP COLUMN IF EXISTS color;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'theme_mode') THEN
    CREATE TYPE theme_mode AS ENUM ('light', 'dark', 'system');
  END IF;
END
$$;

ALTER TABLE users ADD COLUMN IF NOT EXISTS theme theme_mode DEFAULT 'system';
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB
  DEFAULT '{"vault_add": true, "recommendations": true, "airing": true}'::jsonb;
