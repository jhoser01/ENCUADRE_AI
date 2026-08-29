/**
 * optimizer.ts
 * Server-side image optimization pipeline using sharp.
 * Enforces:
 * 1. Resizing to maximum 1920px on the longest side
 * 2. Converting to WebP (85% quality)
 * 3. Stripping all EXIF and GPS metadata
 * 4. Generating a lightweight thumbnail (400px, 75% quality)
 */

import sharp from 'sharp';

export interface OptimizedImageResult {
  optimized: Buffer;
  thumbnail: Buffer;
  width: number;
  height: number;
  bytes: number;
  thumbnailBytes: number;
  mimeType: string;
}

const MAX_DIMENSION = 1920;
const THUMBNAIL_DIMENSION = 400;

export async function optimizePortfolioImage(inputBuffer: Buffer): Promise<OptimizedImageResult> {
  const metadata = await sharp(inputBuffer).metadata();

  // 1. Process main derived image
  const pipeline = sharp(inputBuffer)
    .rotate() // auto-rotate based on EXIF before stripping
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 85 });

  const optimized = await pipeline.toBuffer();
  const optimizedMeta = await sharp(optimized).metadata();

  // 2. Process thumbnail
  const thumbnail = await sharp(inputBuffer)
    .rotate()
    .resize({
      width: THUMBNAIL_DIMENSION,
      height: THUMBNAIL_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 75 })
    .toBuffer();

  return {
    optimized,
    thumbnail,
    width: optimizedMeta.width || metadata.width || 1200,
    height: optimizedMeta.height || metadata.height || 800,
    bytes: optimized.length,
    thumbnailBytes: thumbnail.length,
    mimeType: 'image/webp',
  };
}
