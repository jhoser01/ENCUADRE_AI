/**
 * upload.ts
 * Supabase Storage integration with private buckets, signed URLs, and ownership isolation.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

const PORTFOLIO_BUCKET = 'portfolio';
const DEFAULT_SIGNED_URL_EXPIRY = 3600; // 1 hour

export async function uploadPortfolioImageToStorage(
  supabase: SupabaseClient,
  ownerId: string,
  imageId: string,
  imageBuffer: Buffer,
  thumbnailBuffer: Buffer
): Promise<{ storagePath: string; thumbnailPath: string }> {
  const basePath = `${ownerId}/${imageId}`;
  const storagePath = `${basePath}/main.webp`;
  const thumbnailPath = `${basePath}/thumb.webp`;

  // Upload main image to private bucket
  const { error: mainError } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .upload(storagePath, imageBuffer, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: true,
    });

  if (mainError) {
    throw new Error(`Failed to upload main image to storage: ${mainError.message}`);
  }

  // Upload thumbnail
  const { error: thumbError } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .upload(thumbnailPath, thumbnailBuffer, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: true,
    });

  if (thumbError) {
    console.warn(`[Storage] Failed to upload thumbnail: ${thumbError.message}`);
  }

  return { storagePath, thumbnailPath };
}

/**
 * Generates a temporary signed URL for viewing private portfolio images.
 */
export async function getSignedPortfolioUrl(
  supabase: SupabaseClient,
  storagePath: string,
  expiresInSeconds = DEFAULT_SIGNED_URL_EXPIRY
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL for path ${storagePath}: ${error?.message}`);
  }

  return data.signedUrl;
}

/**
 * Deletes an image and its thumbnail from storage.
 */
export async function deletePortfolioImageFromStorage(
  supabase: SupabaseClient,
  ownerId: string,
  imageId: string
): Promise<void> {
  const basePath = `${ownerId}/${imageId}`;
  const { error } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .remove([`${basePath}/main.webp`, `${basePath}/thumb.webp`]);

  if (error) {
    console.warn(`[Storage] Failed to delete image files for ${imageId}: ${error.message}`);
  }
}
