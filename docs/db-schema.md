# AniVault — Database Schema Reference

> Generated from `supabase/migrations/001–007`.
> All tables have Row Level Security (RLS) enabled.

---

## Enums

| Type | Values |
|------|--------|
| `vault_type` | `personal`, `shared` |
| `anime_status` | `watched`, `watching`, `queued`, `dropped` |
| `rec_status` | `pending`, `accepted`, `dismissed` |
| `notification_type` | `vault_add`, `vault_invite`, `recommendation` |
| `theme_mode` | `light`, `dark`, `system` |

---

## Tables

### `users`
Mirrors `auth.users`. Created on first Google OAuth sign-in.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Must match `auth.uid()` |
| `name` | TEXT | Display name |
| `email` | TEXT UNIQUE | |
| `avatar_url` | TEXT | OAuth profile picture URL |
| `theme` | `theme_mode` | Default `system` |
| `notification_preferences` | JSONB | `{ vault_add, recommendations, airing }` — all default `true` |
| `created_at` | TIMESTAMPTZ | |

**RLS:** Users can read/write their own row. Any authenticated user can read any user row (for search). Vault mates can also read each other via shared membership.

---

### `vaults`
A collection of anime — either personal or shared between friends.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `name` | TEXT | |
| `emoji` | TEXT | Default `📁` |
| `type` | `vault_type` | `personal` or `shared` |
| `description` | TEXT | Optional |
| `created_at` | TIMESTAMPTZ | |

> No `owner` field — all members are equal. Vault creation is handled by the `create_vault_for_user()` RPC (see Functions).

**RLS:** Readable only by vault members. Any authenticated user can insert (creation handled atomically via RPC).

---

### `vault_members`
Junction between vaults and users. Membership = access.

| Column | Type | Notes |
|--------|------|-------|
| `vault_id` | UUID FK → `vaults.id` | CASCADE delete |
| `user_id` | UUID FK → `users.id` | CASCADE delete |
| `joined_at` | TIMESTAMPTZ | |

**PK:** `(vault_id, user_id)`

**RLS:** Readable by the member themselves or any other member of the same vault (via `get_user_vault_ids()` helper to avoid recursive policy).

---

### `anime`
Global anime metadata — source of truth, keyed on MAL ID.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | Internal ID |
| `mal_id` | INT UNIQUE | MyAnimeList ID |
| `title` | TEXT | Japanese/romaji title |
| `title_english` | TEXT | |
| `cover_image` | TEXT | URL |
| `synopsis` | TEXT | |
| `year` | INT | |
| `genres` | TEXT[] | Array of genre strings |
| `studio` | TEXT | |
| `episode_count` | INT | |
| `mal_score` | NUMERIC | MAL community score |
| `airing_status` | TEXT | |
| `season` | TEXT | e.g. `Winter 2024` |
| `created_at` | TIMESTAMPTZ | |
| `metadata_fetched_at` | TIMESTAMPTZ | For 24h cache invalidation |

**RLS:** Any authenticated user can read, insert, or update. (Jikan API data only — users cannot edit.)

---

### `vault_anime`
Junction linking anime to a vault. Tracks who added it.

| Column | Type | Notes |
|--------|------|-------|
| `vault_id` | UUID FK → `vaults.id` | CASCADE delete |
| `anime_id` | UUID FK → `anime.id` | CASCADE delete |
| `added_by` | UUID FK → `users.id` | Nullable on user delete |
| `added_at` | TIMESTAMPTZ | |

**PK:** `(vault_id, anime_id)`

**RLS:** Read/insert/delete for vault members only.

---

### `user_anime_data`
Per-user review and tracking data for an anime. One row per user per anime globally (not vault-scoped).

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | UUID FK → `users.id` | CASCADE delete |
| `anime_id` | UUID FK → `anime.id` | CASCADE delete |
| `status` | `anime_status` | `watched`, `watching`, `queued`, `dropped` |
| `rating` | INT | 1–5 |
| `vibes` | TEXT[] | User-applied vibe tags |
| `hot_take` | TEXT | Short review/opinion |
| `updated_at` | TIMESTAMPTZ | |

**PK:** `(user_id, anime_id)`

**RLS:** Users read/write own rows. Vault mates can read each other's rows.

---

### `anime_watch_sources`
Community-submitted links for where to watch an anime.

| Column | Type | Notes |
|--------|------|-------|
| `anime_id` | UUID FK → `anime.id` | CASCADE delete |
| `url` | TEXT | |
| `source_name` | TEXT | e.g. `Crunchyroll` |
| `added_by` | UUID FK → `users.id` | |
| `added_at` | TIMESTAMPTZ | |

**PK:** `(anime_id, url)`

**RLS:** Any authenticated user can read or insert.

---

### `recommendations`
Directed anime recommendations between users, optionally tied to a vault.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `from_user_id` | UUID FK → `users.id` | CASCADE delete |
| `to_user_id` | UUID FK → `users.id` | CASCADE delete |
| `anime_id` | UUID FK → `anime.id` | CASCADE delete |
| `vault_id` | UUID FK → `vaults.id` | SET NULL on vault delete |
| `message` | TEXT | Optional note |
| `status` | `rec_status` | Default `pending` |
| `created_at` | TIMESTAMPTZ | |
| `seen_at` | TIMESTAMPTZ | Set when recipient views it |

**RLS:** Sender or recipient can read. Only sender can insert. Only recipient can update (accept/dismiss).

---

### `anime_cache`
Raw Jikan API response cache keyed on MAL ID.

| Column | Type | Notes |
|--------|------|-------|
| `mal_id` | INT PK | |
| `data` | JSONB | Full Jikan response |
| `fetched_at` | TIMESTAMPTZ | Cache invalidation timestamp |

**RLS:** Any authenticated user can read. (No insert policy exposed — populated server-side.)

---

### `upcoming_anime`
Upcoming/airing anime for the Schedule screen. Populated by a background sync job.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `mal_id` | INT UNIQUE | |
| `title` | TEXT | |
| `season` | TEXT | |
| `genres` | TEXT[] | |
| `studio` | TEXT | |
| `episode_count` | INT | |
| `current_ep` | INT | Latest aired episode |
| `air_day` | TEXT | e.g. `Saturday` |
| `air_time_jst` | TEXT | JST broadcast time |
| `next_air_date` | DATE | |
| `synopsis` | TEXT | |
| `url` | TEXT | MAL or official link |

**RLS:** Any authenticated user can read.

---

### `user_follows`
Tracks which upcoming anime a user is following (for Schedule screen notifications).

| Column | Type | Notes |
|--------|------|-------|
| `user_id` | UUID FK → `users.id` | CASCADE delete |
| `upcoming_anime_id` | UUID FK → `upcoming_anime.id` | CASCADE delete |
| `created_at` | TIMESTAMPTZ | |

**PK:** `(user_id, upcoming_anime_id)`

**RLS:** Users can only read and write their own follows.

---

### `notifications`
In-app notification inbox per user.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `user_id` | UUID FK → `users.id` | CASCADE delete |
| `type` | `notification_type` | `vault_add`, `vault_invite`, `recommendation` |
| `title` | TEXT | |
| `body` | TEXT | |
| `data` | JSONB | Arbitrary context payload |
| `read` | BOOLEAN | Default `false` |
| `created_at` | TIMESTAMPTZ | |

**RLS:** Users can read and update (mark-read) only their own rows.

---

### `vault_invites`
Shareable invite tokens for joining a vault.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `vault_id` | UUID FK → `vaults.id` | CASCADE delete |
| `created_by` | UUID FK → `users.id` | CASCADE delete |
| `token` | TEXT UNIQUE | UUID-derived, unguessable — the auth mechanism |
| `expires_at` | TIMESTAMPTZ | Default `now() + 7 days` |
| `created_at` | TIMESTAMPTZ | |

**RLS:** Any authenticated user can read (token is the security boundary). Vault members can insert.

---

## Entity Relationship Overview

```
auth.users
    │
    └─▶ users ◀──────────────────────────────────────────────────┐
            │                                                     │
            ├─▶ vault_members ◀──────── vaults ◀── vault_invites │
            │        │                    │                       │
            │        │                    └─▶ vault_anime         │
            │        │                             │              │
            ├─▶ user_anime_data                    ▼              │
            │                                   anime ────────── │
            ├─▶ anime_watch_sources ◀──────────────┘             │
            │                                                     │
            ├─▶ recommendations (from/to users + anime + vault)  │
            │                                                     │
            ├─▶ user_follows ◀── upcoming_anime                  │
            │                                                     │
            └─▶ notifications                                     │
                                                                  │
            anime_cache (standalone, keyed on mal_id)            │
```

---

## Database Functions

### `get_user_vault_ids(uid UUID) → SETOF UUID`
**Security Definer.** Returns all vault IDs the given user belongs to. Used inside RLS policies to avoid infinite recursion when `vault_members` policies query `vault_members`.

### `create_vault_for_user(p_name, p_emoji, p_type) → SETOF vaults`
**Security Definer.** Atomically inserts a vault row and a corresponding `vault_members` row for `auth.uid()`, then returns the vault. Required because `INSERT ... RETURNING` on `vaults` triggers the SELECT RLS policy before the membership row exists.

---

## Key Design Notes

- **No vault owner** — all vault members are equal. The creator is just the first member.
- **`user_anime_data` is global** — one review/rating per user per anime, not per vault.
- **`anime` is immutable by users** — only Jikan API data; no user edits to MAL metadata.
- **Invite token = auth mechanism** — `vault_invites.token` is a UUID and acts as the authorization gate; any authenticated user can read invite rows.
- **`anime_cache` is server-side only** — no RLS insert policy; populated by the API layer.
- **Cascade deletes** — removing a user or vault cleans up all dependent rows automatically.
