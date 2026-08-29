'use server';

/**
 * actions/sessions.ts
 * Server Actions for anonymous client session verification, preferences submission,
 * and automatic pipeline triggering (preference vector + alignment score).
 */

import { createServerClient } from '@/lib/supabase/server';
import { hashToken } from '@/lib/security/token';
import { submitPreferencesSchema } from '@/schemas';
import * as sessionRepo from '@/server/repositories/sessions';
import * as portfolioRepo from '@/server/repositories/portfolio';
import * as projectRepo from '@/server/repositories/projects';
import * as alignmentRepo from '@/server/repositories/alignment';
import { calculatePreferenceVector } from '@/server/services/preference-vector';
import { calculateAlignmentScore } from '@/server/services/alignment';
import type { PairwiseChoiceData } from '@/server/services/preference-vector';
import type { ClientAnswers, ImageFeatureVector } from '@/types/database';

export async function validateClientTokenAction(token: string): Promise<{
  valid: boolean;
  sessionId?: string;
  projectId?: string;
  projectName?: string;
  photographerName?: string;
  studioName?: string;
  status?: string;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    const tokenHash = await hashToken(token);
    const session = await sessionRepo.getSessionByTokenHash(supabase, tokenHash);

    if (!session) {
      return { valid: false, error: 'Enlace inválido o expirado.' };
    }

    if (new Date(session.expires_at) < new Date()) {
      return { valid: false, error: 'Este enlace de sesión ha expirado.' };
    }

    if (session.status === 'revoked') {
      return { valid: false, error: 'Este enlace ha sido revocado por el fotógrafo.' };
    }

    const project = session.projects;
    const profile = project?.profiles;

    return {
      valid: true,
      sessionId: session.id,
      projectId: session.project_id,
      projectName: project?.name,
      photographerName: profile?.display_name || 'Tu fotógrafo',
      studioName: profile?.studio_name || 'Estudio',
      status: session.status,
    };
  } catch (err: any) {
    console.error('[validateClientTokenAction] error:', err);
    return { valid: false, error: 'Error al validar el enlace.' };
  }
}

export async function submitClientPreferencesAction(input: {
  token: string;
  choices: Array<{
    left_image_id: string;
    right_image_id: string;
    selected_image_id: string;
    response_ms?: number;
  }>;
  answers: ClientAnswers;
}): Promise<{
  success: boolean;
  score?: number;
  level?: string;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    const validated = submitPreferencesSchema.parse(input);

    const tokenHash = await hashToken(validated.token);
    const session = await sessionRepo.getSessionByTokenHash(supabase, tokenHash);

    if (!session || session.status === 'revoked') {
      return { success: false, error: 'Sesión no válida o expirada.' };
    }

    const projectId = session.project_id;
    const project = await projectRepo.getProjectById(supabase, projectId);
    if (!project) {
      return { success: false, error: 'Proyecto no encontrado.' };
    }

    // 1. Save choices and answers
    await sessionRepo.savePairwiseChoices(supabase, session.id, validated.choices);
    await sessionRepo.saveClientAnswers(supabase, session.id, validated.answers);

    // 2. Fetch image feature vectors to compute preference vector
    const imageIds = new Set<string>();
    validated.choices.forEach((c) => {
      imageIds.add(c.selected_image_id);
      const rejected = c.selected_image_id === c.left_image_id ? c.right_image_id : c.left_image_id;
      imageIds.add(rejected);
    });

    const choicesData: PairwiseChoiceData[] = [];
    for (const c of validated.choices) {
      const rejectedId = c.selected_image_id === c.left_image_id ? c.right_image_id : c.left_image_id;
      const selImg = await portfolioRepo.getPortfolioImageById(supabase, c.selected_image_id);
      const rejImg = await portfolioRepo.getPortfolioImageById(supabase, rejectedId);

      if (selImg?.features && rejImg?.features) {
        choicesData.push({
          selectedFeatures: selImg.features,
          rejectedFeatures: rejImg.features,
          responseMs: c.response_ms,
        });
      }
    }

    // 3. Compute Client Preference Vector
    const prefResult = calculatePreferenceVector(choicesData);
    await sessionRepo.savePreferenceProfile(supabase, {
      session_id: session.id,
      vector: prefResult.vector,
      confidence: prefResult.confidence,
      algorithm_version: prefResult.algorithm_version,
    });

    // 4. Fetch photographer style DNA or fallback
    let styleVector: ImageFeatureVector = {
      warmth: 0.5, brightness: 0.5, contrast: 0.5, saturation: 0.5,
      naturalLight: 0.7, candidness: 0.6, posedness: 0.4, editorialness: 0.5,
      documentaryness: 0.5, intimacy: 0.5, wideComposition: 0.5,
      retouchLevel: 0.3, emotionalIntensity: 0.5, minimalism: 0.5,
    };

    const styleProfile = await alignmentRepo.getStyleProfile(supabase, project.owner_id);
    if (styleProfile?.vector) {
      styleVector = styleProfile.vector;
    } else {
      // Aggregate completed portfolio vectors if profile not cached
      const completedVectors = await portfolioRepo.getCompletedFeatureVectors(supabase, project.owner_id);
      if (completedVectors.length > 0) {
        const { calculateStyleDNA } = await import('@/server/services/style-dna');
        const dna = calculateStyleDNA(completedVectors);
        styleVector = dna.vector;
      }
    }

    // 5. Calculate Deterministic Alignment Score
    const alignment = calculateAlignmentScore(styleVector, prefResult.vector);

    await alignmentRepo.saveAlignmentResult(supabase, {
      project_id: projectId,
      score: alignment.score,
      dimensions: alignment.dimensions,
      mismatches: alignment.mismatches,
      explanation: alignment.explanation,
      algorithm_version: alignment.algorithm_version,
    });

    // 6. Update Project status and mark session completed
    await projectRepo.updateProjectStatus(supabase, projectId, project.owner_id, 'aligned', alignment.score);
    await sessionRepo.updateSessionStatus(supabase, session.id, 'completed', new Date().toISOString());

    return {
      success: true,
      score: alignment.score,
      level: alignment.level,
    };
  } catch (err: any) {
    console.error('[submitClientPreferencesAction] error:', err);
    return { success: false, error: err?.message || 'Error al procesar las preferencias.' };
  }
}
