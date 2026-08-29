'use server';

/**
 * actions/briefs.ts
 * Server Actions for AI Brief Generation, retrieval, and dual approvals.
 */

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { approveBriefSchema } from '@/schemas';
import * as briefRepo from '@/server/repositories/briefs';
import * as alignmentRepo from '@/server/repositories/alignment';
import * as projectRepo from '@/server/repositories/projects';
import * as sessionRepo from '@/server/repositories/sessions';
import { getAIProvider } from '@/lib/ai/provider';
import type { Brief, ActorType } from '@/types/database';

export async function generateVisualBriefAction(
  projectId: string
): Promise<{ success: boolean; brief?: Brief; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'No autorizado.' };
    }

    const project = await projectRepo.getProjectById(supabase, projectId, user.id);
    if (!project) return { success: false, error: 'Proyecto no encontrado.' };

    const alignment = await alignmentRepo.getAlignmentResult(supabase, projectId);
    if (!alignment) {
      return { success: false, error: 'Alineación no calculada aún. Espera las respuestas del cliente.' };
    }

    const styleProfile = await alignmentRepo.getStyleProfile(supabase, user.id);
    const refImageIds = await projectRepo.getProjectReferenceImages(supabase, projectId);

    // Get client session answers if available
    const { data: sessions } = await supabase
      .from('client_sessions')
      .select('id, client_answers(answers), preference_profiles(vector)')
      .eq('project_id', projectId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1);

    const latestSession = sessions?.[0];
    const clientAnswers = (latestSession as any)?.client_answers?.[0]?.answers || {};
    const clientVector = (latestSession as any)?.preference_profiles?.[0]?.vector || {};

    // Call AI provider to generate structured brief
    const ai = getAIProvider();
    const briefResult = await ai.generateBrief({
      styleVector: styleProfile?.vector || ({} as any),
      clientVector,
      alignmentScore: alignment.score,
      mismatches: alignment.mismatches,
      clientAnswers,
      referenceImageIds: refImageIds,
    });

    // Check version
    const existingBrief = await briefRepo.getLatestBrief(supabase, projectId);
    const version = existingBrief ? existingBrief.version + 1 : 1;

    const brief = await briefRepo.createBrief(supabase, {
      project_id: projectId,
      version,
      content: briefResult.content,
      status: 'pending_approval',
    });

    revalidatePath(`/app/projects/${projectId}`);
    revalidatePath(`/app/projects/${projectId}/brief`);
    return { success: true, brief };
  } catch (err: any) {
    console.error('[generateVisualBriefAction] error:', err);
    return { success: false, error: err?.message || 'Error al generar el Visual Brief.' };
  }
}

export async function approveBriefAction(input: {
  briefId: string;
  actorType: ActorType;
  comment?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerClient();
    const validated = approveBriefSchema.parse(input);

    await briefRepo.recordApproval(supabase, {
      brief_id: validated.briefId,
      actor_type: validated.actorType,
      comment: validated.comment,
    });

    return { success: true };
  } catch (err: any) {
    console.error('[approveBriefAction] error:', err);
    return { success: false, error: err?.message || 'Error al registrar la aprobación.' };
  }
}
