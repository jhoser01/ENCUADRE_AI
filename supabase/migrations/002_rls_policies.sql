-- ============================================================================
-- 002_rls_policies.sql
-- Complete Row Level Security (RLS) Policies for ENCUADRE
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_reference_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pairwise_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE preference_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alignment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief_approvals ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 1. profiles
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can view minimal profile for client sessions" ON profiles
  FOR SELECT USING (TRUE);

-- ----------------------------------------------------------------------------
-- 2. clients
-- ----------------------------------------------------------------------------
CREATE POLICY "Photographers can view own clients" ON clients
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Photographers can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Photographers can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Photographers can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- 3. projects
-- ----------------------------------------------------------------------------
CREATE POLICY "Photographers can view own projects" ON projects
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Photographers can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Photographers can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Photographers can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- 4. portfolio_images
-- ----------------------------------------------------------------------------
CREATE POLICY "Photographers can view own portfolio images" ON portfolio_images
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Photographers can insert own portfolio images" ON portfolio_images
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Photographers can update own portfolio images" ON portfolio_images
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Photographers can delete own portfolio images" ON portfolio_images
  FOR DELETE USING (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- 5. image_features
-- ----------------------------------------------------------------------------
CREATE POLICY "Photographers can view features of own images" ON image_features
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM portfolio_images
      WHERE portfolio_images.id = image_features.image_id
        AND portfolio_images.owner_id = auth.uid()
    )
  );

CREATE POLICY "Photographers can manage features of own images" ON image_features
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM portfolio_images
      WHERE portfolio_images.id = image_features.image_id
        AND portfolio_images.owner_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 6. project_reference_images
-- ----------------------------------------------------------------------------
CREATE POLICY "Photographers can manage reference images for own projects" ON project_reference_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_reference_images.project_id
        AND projects.owner_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 7. client_sessions
-- ----------------------------------------------------------------------------
CREATE POLICY "Photographers can view sessions of own projects" ON client_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = client_sessions.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Photographers can insert sessions for own projects" ON client_sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = client_sessions.project_id
        AND projects.owner_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 8. style_profiles
-- ----------------------------------------------------------------------------
CREATE POLICY "Photographers can view own style profile" ON style_profiles
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Photographers can update own style profile" ON style_profiles
  FOR ALL USING (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- 9. alignment_results
-- ----------------------------------------------------------------------------
CREATE POLICY "Photographers can view alignment results of own projects" ON alignment_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = alignment_results.project_id
        AND projects.owner_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------------------
-- 10. briefs & approvals
-- ----------------------------------------------------------------------------
CREATE POLICY "Photographers can manage briefs of own projects" ON briefs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = briefs.project_id
        AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Photographers can view approvals of own briefs" ON brief_approvals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM briefs
      JOIN projects ON projects.id = briefs.project_id
      WHERE briefs.id = brief_approvals.brief_id
        AND projects.owner_id = auth.uid()
    )
  );
