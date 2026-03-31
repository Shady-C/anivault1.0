-- AniVault Initial Schema

-- Enums
CREATE TYPE vault_type AS ENUM ('personal', 'shared');
CREATE TYPE anime_status AS ENUM ('watched', 'watching', 'queued', 'dropped');
CREATE TYPE rec_status AS ENUM ('pending', 'accepted', 'dismissed');
CREATE TYPE notification_type AS ENUM ('vault_add', 'vault_invite', 'recommendation');

-- Users (mirrors auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '👤',
  color TEXT DEFAULT '#FF6B35',
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vaults
CREATE TABLE vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '📁',
  type vault_type NOT NULL DEFAULT 'personal',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vault Members
CREATE TABLE vault_members (
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (vault_id, user_id)
);

-- Anime (global source of truth)
CREATE TABLE anime (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mal_id INT UNIQUE,
  title TEXT NOT NULL,
  title_english TEXT,
  cover_image TEXT,
  synopsis TEXT,
  year INT,
  genres TEXT[],
  studio TEXT,
  episode_count INT,
  mal_score NUMERIC,
  airing_status TEXT,
  season TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata_fetched_at TIMESTAMPTZ
);

-- Vault Anime (junction)
CREATE TABLE vault_anime (
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
  anime_id UUID REFERENCES anime(id) ON DELETE CASCADE,
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (vault_id, anime_id)
);

-- User Anime Data (per-user reviews/ratings)
CREATE TABLE user_anime_data (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  anime_id UUID REFERENCES anime(id) ON DELETE CASCADE,
  status anime_status,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  vibes TEXT[],
  hot_take TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, anime_id)
);

-- Anime Watch Sources
CREATE TABLE anime_watch_sources (
  anime_id UUID REFERENCES anime(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  source_name TEXT,
  added_by UUID REFERENCES users(id),
  added_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (anime_id, url)
);

-- Recommendations
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  anime_id UUID REFERENCES anime(id) ON DELETE CASCADE,
  vault_id UUID REFERENCES vaults(id) ON DELETE SET NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  seen_at TIMESTAMPTZ,
  status rec_status DEFAULT 'pending'
);

-- Anime Cache
CREATE TABLE anime_cache (
  mal_id INT PRIMARY KEY,
  data JSONB NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT now()
);

-- Upcoming Anime (for schedule / follow)
CREATE TABLE upcoming_anime (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  season TEXT,
  genres TEXT[],
  studio TEXT,
  episode_count INT,
  current_ep INT,
  air_day TEXT,
  air_time_jst TEXT,
  next_air_date DATE,
  synopsis TEXT,
  url TEXT,
  mal_id INT UNIQUE
);

-- User Follows
CREATE TABLE user_follows (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  upcoming_anime_id UUID REFERENCES upcoming_anime(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, upcoming_anime_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vault Invites (for share links)
CREATE TABLE vault_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id UUID REFERENCES vaults(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days',
  created_at TIMESTAMPTZ DEFAULT now()
);
