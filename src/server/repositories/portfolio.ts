/**
 * repositories/portfolio.ts
 * Database access layer for portfolio images and their AI-extracted features.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  PortfolioImage,
  ImageFeatures,
  ImageFeatureVector,
  AnalysisStatus,
} from '@/types/database';

export async function getPortfolioImagesByOwner(
  supabase: SupabaseClient,
  ownerId: string
): Promise<Array<PortfolioImage & { features?: ImageFeatureVector | null }>> {
  const { data, error } = await supabase
    .from('portfolio_images')
    .select('*, image_features(features, confidence)')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((img: any) => ({
    ...img,
    features: img.image_features?.[0]?.features || img.image_features?.features || null,
  }));
}

export async function getPortfolioImageById(
  supabase: SupabaseClient,
  imageId: string,
  ownerId?: string
): Promise<(PortfolioImage & { features?: ImageFeatureVector | null }) | null> {
  let query = supabase
    .from('portfolio_images')
    .select('*, image_features(features, confidence)')
    .eq('id', imageId);

  if (ownerId) query = query.eq('owner_id', ownerId);

  const { data, error } = await query.single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    ...data,
    features: data.image_features?.[0]?.features || data.image_features?.features || null,
  };
}

export async function createPortfolioImage(
  supabase: SupabaseClient,
  imageData: {
    id?: string;
    owner_id: string;
    storage_path: string;
    thumbnail_path?: string | null;
    width?: number | null;
    height?: number | null;
    bytes?: number | null;
    category?: string | null;
    is_style_reference?: boolean;
    analysis_status?: AnalysisStatus;
  }
): Promise<PortfolioImage> {
  const { data, error } = await supabase
    .from('portfolio_images')
    .insert({
      id: imageData.id,
      owner_id: imageData.owner_id,
      storage_path: imageData.storage_path,
      thumbnail_path: imageData.thumbnail_path || null,
      width: imageData.width || null,
      height: imageData.height || null,
      bytes: imageData.bytes || null,
      category: imageData.category || null,
      is_style_reference: imageData.is_style_reference ?? true,
      analysis_status: imageData.analysis_status || 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as PortfolioImage;
}

export async function updateImageAnalysisStatus(
  supabase: SupabaseClient,
  imageId: string,
  status: AnalysisStatus
): Promise<void> {
  const { error } = await supabase
    .from('portfolio_images')
    .update({ analysis_status: status, updated_at: new Date().toISOString() })
    .eq('id', imageId);

  if (error) throw error;
}

export async function saveImageFeatures(
  supabase: SupabaseClient,
  featuresData: {
    image_id: string;
    feature_version: string;
    features: ImageFeatureVector;
    confidence?: Record<string, number>;
  }
): Promise<ImageFeatures> {
  const { data, error } = await supabase
    .from('image_features')
    .upsert({
      image_id: featuresData.image_id,
      feature_version: featuresData.feature_version,
      features: featuresData.features,
      confidence: featuresData.confidence || {},
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  // Mark image analysis as completed
  await updateImageAnalysisStatus(supabase, featuresData.image_id, 'completed');

  return data as unknown as ImageFeatures;
}

export async function getCompletedFeatureVectors(
  supabase: SupabaseClient,
  ownerId: string
): Promise<ImageFeatureVector[]> {
  const { data, error } = await supabase
    .from('portfolio_images')
    .select('image_features(features)')
    .eq('owner_id', ownerId)
    .eq('is_style_reference', true)
    .eq('analysis_status', 'completed');

  if (error) throw error;

  const vectors: ImageFeatureVector[] = [];
  for (const row of data || []) {
    const f = (row as any).image_features?.features || (row as any).image_features?.[0]?.features;
    if (f) vectors.push(f);
  }

  return vectors;
}
