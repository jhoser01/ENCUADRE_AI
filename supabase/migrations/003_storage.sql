-- ============================================================================
-- 003_storage.sql
-- Supabase Storage Buckets and Private Access Policies
-- ============================================================================

-- Create private portfolio bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio',
  'portfolio',
  false,
  26214400, -- 25MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 26214400;

-- Create public brand bucket for non-sensitive public assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-public',
  'brand-public',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ----------------------------------------------------------------------------
-- Storage Policies for 'portfolio' (Private)
-- ----------------------------------------------------------------------------

-- 1. Photographers can upload to their own folder: portfolio/{userId}/*
CREATE POLICY "Photographer upload own images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 2. Photographers can view/read their own images
CREATE POLICY "Photographer read own images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. Photographers can delete their own images
CREATE POLICY "Photographer delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. Public access for brand assets
CREATE POLICY "Public read brand assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-public');
