# ENCUADRE — Database Schema & RLS Policies

## 1. Relational Model

The database is built on PostgreSQL with Row Level Security (RLS) enabled across all multi-tenant tables.

```
auth.users
  ├── profiles (1:1)
  ├── clients (1:N)
  ├── projects (1:N)
  │     ├── project_reference_images (N:M with portfolio_images)
  │     ├── client_sessions (1:N)
  │     │     ├── pairwise_choices (1:N)
  │     │     ├── client_answers (1:1)
  │     │     └── preference_profiles (1:1)
  │     ├── alignment_results (1:1)
  │     └── briefs (1:N)
  │           └── brief_approvals (1:2)
  ├── portfolio_images (1:N)
  │     └── image_features (1:1)
  └── style_profiles (1:1)
```

---

## 2. Table Specifications

### `profiles`
- `id` UUID PK (references `auth.users.id`)
- `display_name` TEXT
- `studio_name` TEXT
- `avatar_path` TEXT
- `timezone` TEXT (default: 'America/Lima')
- `created_at`, `updated_at` TIMESTAMPTZ

### `projects`
- `id` UUID PK
- `owner_id` UUID FK -> `auth.users.id`
- `client_id` UUID FK -> `clients.id`
- `name` TEXT
- `type` TEXT ('wedding', 'portrait', 'editorial', 'family', etc.)
- `event_date` TIMESTAMPTZ
- `status` project_status ('draft', 'active', 'waiting', 'aligned', 'archived')
- `alignment_score` NUMERIC(5,2)

### `portfolio_images`
- `id` UUID PK
- `owner_id` UUID FK -> `auth.users.id`
- `storage_path` TEXT
- `thumbnail_path` TEXT
- `width`, `height`, `bytes` INTEGER
- `category` TEXT
- `is_style_reference` BOOLEAN
- `analysis_status` analysis_status ('pending', 'processing', 'completed', 'failed')

### `image_features`
- `image_id` UUID PK -> `portfolio_images.id`
- `feature_version` TEXT
- `features` JSONB (14 dimensions in [0, 1])
- `confidence` JSONB

### `client_sessions`
- `id` UUID PK
- `project_id` UUID FK -> `projects.id`
- `token_hash` TEXT UNIQUE (SHA-256 hash of token)
- `expires_at` TIMESTAMPTZ
- `status` session_status ('pending', 'active', 'completed', 'revoked')

### `alignment_results`
- `project_id` UUID PK -> `projects.id`
- `score` NUMERIC(5,2)
- `dimensions` JSONB
- `mismatches` JSONB
- `explanation` TEXT

### `briefs` & `brief_approvals`
- Dual approval model ensuring both photographer and client sign off before the project reaches 'aligned/approved' status.
