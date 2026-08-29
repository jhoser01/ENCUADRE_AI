/**
 * repositories/alignment.ts
 * Database access layer for Alignment Results and Style Profiles.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AlignmentResult,
  AlignmentDimension,
  AlignmentMismatch,
  StyleProfile,
  ImageFeatureVector,
} from '@/types/database';

export async function saveAlignmentResult(
  supabase: SupabaseClient,
  resultData: {
    project_id: string;
    score: number;
    dimensions: AlignmentDimension[];
    mismatches: AlignmentMismatch[];
    explanation?: string | null;
    algorithm_version: string;
  }
): Promise<AlignmentResult> {
  const { data, error } = await supabase
    .from('alignment_results')
    .upsert({
      project_id: resultData.project_id,
      score: resultData.score,
      dimensions: resultData.dimensions,
      mismatches: resultData.mismatches,
      explanation: resultData.explanation || null,
      algorithm_version: resultData.algorithm_version,
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as AlignmentResult;
}

export async function getAlignmentResult(
  supabase: SupabaseClient,
  projectId: string
): Promise<AlignmentResult | null> {
  const { data, error } = await supabase
    .from('alignment_results')
    .select('*')
    .eq('project_id', projectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as unknown as AlignmentResult;
}

export async function saveStyleProfile(
  supabase: SupabaseClient,
  profileData: {
    owner_id: string;
    vector: ImageFeatureVector;
    spread: Record<string, number>;
    sample_count: number;
    algorithm_version: string;
  }
): Promise<StyleProfile> {
  const { data, error } = await supabase
    .from('style_profiles')
    .upsert({
      owner_id: profileData.owner_id,
      vector: profileData.vector,
      spread: profileData.spread,
      sample_count: profileData.sample_count,
      algorithm_version: profileData.algorithm_version,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as StyleProfile;
}

export async function getStyleProfile(
  supabase: SupabaseClient,
  ownerId: string
): Promise<StyleProfile | null> {
  const { data, error } = await supabase
    .from('style_profiles')
    .select('*')
    .eq('owner_id', ownerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as unknown as StyleProfile;
}
