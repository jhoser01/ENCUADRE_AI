'use server';

/**
 * actions/portfolio.ts
 * Server Action for portfolio image upload and optimization.
 */

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { optimizePortfolioImage } from '@/lib/image/optimizer';
import { uploadPortfolioImageToStorage } from '@/lib/storage/upload';
import * as portfolioRepo from '@/server/repositories/portfolio';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export async function uploadPortfolioImageAction(
  formData: FormData
): Promise<{ success: boolean; imageId?: string; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'No autorizado. Inicia sesión.' };
    }

    const file = formData.get('file') as File | null;
    if (!file) {
      return { success: false, error: 'No se ha proporcionado ninguna imagen.' };
    }

    if (!ALLOWED_MIMES.includes(file.type)) {
      return { success: false, error: 'Formato no soportado. Usa JPEG, PNG o WebP.' };
    }

    if (file.size > MAX_BYTES) {
      return { success: false, error: 'La imagen excede el límite de 25 MB.' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optimize and strip EXIF
    const { optimized, thumbnail, width, height, bytes } = await optimizePortfolioImage(buffer);

    // Create DB placeholder
    const category = (formData.get('category') as string) || null;
    const isStyleRef = formData.get('is_style_reference') !== 'false';

    const imageRecord = await portfolioRepo.createPortfolioImage(supabase, {
      owner_id: user.id,
      storage_path: 'pending',
      width,
      height,
      bytes,
      category,
      is_style_reference: isStyleRef,
      analysis_status: 'pending',
    });

    // Upload optimized files to Supabase Storage
    const { storagePath, thumbnailPath } = await uploadPortfolioImageToStorage(
      supabase,
      user.id,
      imageRecord.id,
      optimized,
      thumbnail
    );

    // Update storage paths
    await (supabase.from('portfolio_images') as any)
      .update({ storage_path: storagePath, thumbnail_path: thumbnailPath })
      .eq('id', imageRecord.id);

    revalidatePath('/app/portfolio');
    revalidatePath('/app/style-dna');

    return { success: true, imageId: imageRecord.id };
  } catch (err: any) {
    console.error('[uploadPortfolioImageAction] error:', err);
    return { success: false, error: err?.message || 'Error al subir y optimizar la imagen.' };
  }
}
