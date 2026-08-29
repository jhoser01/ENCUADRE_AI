-- ============================================================================
-- 001_initial_schema.sql
-- ENCUADRE MVP Database Schema
-- Version: 1.0.0
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- Custom Enums
-- ----------------------------------------------------------------------------
CREATE TYPE project_status AS ENUM ('draft', 'active', 'waiting', 'aligned', 'archived');
CREATE TYPE session_status AS ENUM ('pending', 'active', 'completed', 'revoked');
CREATE TYPE analysis_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE brief_status AS ENUM ('draft', 'pending_approval', 'approved');
CREATE TYPE actor_type AS ENUM ('photographer', 'client');

-- ----------------------------------------------------------------------------
-- 1. profiles (Photographer Profile linked to auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  studio_name TEXT,
  avatar_path TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/Lima',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, studio_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Fotógrafo'),
    COALESCE(NEW.raw_user_meta_data->>'studio_name', 'Estudio Fotográfico')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. clients (Clients registered by a photographer)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_owner_id ON clients(owner_id);

-- ----------------------------------------------------------------------------
-- 3. projects (Photo session projects)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'portrait',
  event_date TIMESTAMPTZ,
  status project_status NOT NULL DEFAULT 'active',
  alignment_score NUMERIC(5, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);

-- ----------------------------------------------------------------------------
-- 4. portfolio_images (Photographer portfolio images)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolio_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  width INTEGER,
  height INTEGER,
  bytes INTEGER,
  category TEXT,
  is_style_reference BOOLEAN NOT NULL DEFAULT TRUE,
  analysis_status analysis_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portfolio_images_owner_id ON portfolio_images(owner_id);
CREATE INDEX idx_portfolio_images_analysis ON portfolio_images(analysis_status);

-- ----------------------------------------------------------------------------
-- 5. image_features (AI-extracted 14 visual dimensions)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS image_features (
  image_id UUID PRIMARY KEY REFERENCES portfolio_images(id) ON DELETE CASCADE,
  feature_version TEXT NOT NULL,
  features JSONB NOT NULL,
  confidence JSONB,
  embedding NUMERIC[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. project_reference_images (Images selected as reference for a project)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_reference_images (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES portfolio_images(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, image_id)
);

-- ----------------------------------------------------------------------------
-- 7. client_sessions (Secure tokenized sessions for anonymous clients)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  status session_status NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_client_sessions_token_hash ON client_sessions(token_hash);
CREATE INDEX idx_client_sessions_project_id ON client_sessions(project_id);

-- ----------------------------------------------------------------------------
-- 8. pairwise_choices (Client A/B pairwise decisions)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pairwise_choices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES client_sessions(id) ON DELETE CASCADE,
  left_image_id UUID NOT NULL REFERENCES portfolio_images(id) ON DELETE CASCADE,
  right_image_id UUID NOT NULL REFERENCES portfolio_images(id) ON DELETE CASCADE,
  selected_image_id UUID NOT NULL REFERENCES portfolio_images(id) ON DELETE CASCADE,
  response_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pairwise_choices_session ON pairwise_choices(session_id);

-- ----------------------------------------------------------------------------
-- 9. client_answers (Context questions answered by client)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_answers (
  session_id UUID PRIMARY KEY REFERENCES client_sessions(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. preference_profiles (Derived client preference vector)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS preference_profiles (
  session_id UUID PRIMARY KEY REFERENCES client_sessions(id) ON DELETE CASCADE,
  vector JSONB NOT NULL,
  confidence JSONB,
  algorithm_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. style_profiles (Derived photographer Style DNA profile)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS style_profiles (
  owner_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  vector JSONB NOT NULL,
  spread JSONB,
  sample_count INTEGER NOT NULL DEFAULT 0,
  algorithm_version TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 12. alignment_results (Calculated alignment score and mismatches)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alignment_results (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  score NUMERIC(5, 2) NOT NULL,
  dimensions JSONB NOT NULL,
  mismatches JSONB NOT NULL,
  explanation TEXT,
  algorithm_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 13. briefs (Generated Visual Briefs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  content JSONB NOT NULL,
  status brief_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_briefs_project_id ON briefs(project_id);

-- ----------------------------------------------------------------------------
-- 14. brief_approvals (Dual approvals: photographer & client)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brief_approvals (
  brief_id UUID NOT NULL REFERENCES briefs(id) ON DELETE CASCADE,
  actor_type actor_type NOT NULL,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  comment TEXT,
  PRIMARY KEY (brief_id, actor_type)
);
