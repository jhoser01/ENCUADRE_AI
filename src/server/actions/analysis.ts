'use server';

/**
 * actions/analysis.ts
 * Server Action to trigger background image feature extraction with AI
 * and update Style DNA for the photographer.
 */

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { getAIProvider } from '@/lib/ai/provider';
import { getSignedPortfolioUrl } from '@/lib/storage/upload';
import * as portfolioRepo from '@/server/repositories/portfolio';
import * as alignmentRepo from '@/server/repositories/alignment';
import { calculateStyleDNA } from '@/server/services/style-dna';

export async function analyzePortfolioImageAction(
  imageId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'No autorizado.' };
    }

    const image = await portfolioRepo.getPortfolioImageById(supabase, imageId, user.id);
    if (!image) return { success: false, error: 'Imagen no encontrada.' };

    await portfolioRepo.updateImageAnalysisStatus(supabase, imageId, 'processing');

    // Get signed URL for AI provider
    const signedUrl = await getSignedPortfolioUrl(supabase, image.storage_path, 600);

    const ai = getAIProvider();
    const analysisResult = await ai.analyzeImage({
      imageUrl: signedUrl,
      imageId,
    });

    await portfolioRepo.saveImageFeatures(supabase, {
      image_id: imageId,
      feature_version: analysisResult.algorithm_version,
      features: analysisResult.features,
      confidence: analysisResult.confidence,
    });

    // Recompute Style DNA
    await recalculateStyleDNAAction();

    revalidatePath('/app/portfolio');
    revalidatePath('/app/style-dna');
    return { success: true };
  } catch (err: any) {
    console.error('[analyzePortfolioImageAction] error:', err);
    return { success: false, error: err?.message || 'Error al analizar la imagen.' };
  }
}

export async function recalculateStyleDNAAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'No autorizado.' };
    }

    const completedVectors = await portfolioRepo.getCompletedFeatureVectors(supabase, user.id);
    if (completedVectors.length === 0) {
      return { success: false, error: 'No hay imágenes analizadas suficientes.' };
    }

    const dna = calculateStyleDNA(completedVectors);

    await alignmentRepo.saveStyleProfile(supabase, {
      owner_id: user.id,
      vector: dna.vector,
      spread: dna.spread,
      sample_count: dna.sample_count,
      algorithm_version: dna.algorithm_version,
    });

    revalidatePath('/app/style-dna');
    return { success: true };
  } catch (err: any) {
    console.error('[recalculateStyleDNAAction] error:', err);
    return { success: false, error: err?.message || 'Error al recalcular Style DNA.' };
  }
}
