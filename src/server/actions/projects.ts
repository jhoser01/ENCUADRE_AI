'use server';

/**
 * actions/projects.ts
 * Server Actions for project management, client links, and QR generation.
 */

import { revalidatePath } from 'next/cache';
import QRCode from 'qrcode';
import { createServerClient } from '@/lib/supabase/server';
import { createProjectSchema, generateClientLinkSchema } from '@/schemas';
import * as projectRepo from '@/server/repositories/projects';
import * as sessionRepo from '@/server/repositories/sessions';
import { generateClientToken, hashToken, buildSessionUrl } from '@/lib/security/token';
import type { Project } from '@/types/database';

export async function createProjectAction(formData: {
  name: string;
  type: string;
  client_id?: string;
  event_date?: string;
  reference_image_ids?: string[];
}): Promise<{ success: boolean; project?: Project; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'No autorizado. Inicia sesión.' };
    }

    const validated = createProjectSchema.parse(formData);
    const project = await projectRepo.createProject(supabase, user.id, {
      name: validated.name,
      type: validated.type,
      client_id: validated.client_id,
      event_date: validated.event_date,
    });

    if (formData.reference_image_ids && formData.reference_image_ids.length > 0) {
      await projectRepo.setProjectReferences(supabase, project.id, formData.reference_image_ids);
    }

    revalidatePath('/app');
    revalidatePath('/app/projects');
    return { success: true, project };
  } catch (err: any) {
    console.error('[createProjectAction] error:', err);
    return { success: false, error: err?.message || 'Error al crear el proyecto.' };
  }
}

export async function generateClientLinkAction(input: {
  projectId: string;
  expiresInDays?: number;
}): Promise<{
  success: boolean;
  token?: string;
  sessionUrl?: string;
  qrCodeDataUrl?: string;
  expiresAt?: string;
  error?: string;
}> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'No autorizado.' };
    }

    generateClientLinkSchema.parse({ projectId: input.projectId });

    // Verify project belongs to user
    const project = await projectRepo.getProjectById(supabase, input.projectId, user.id);
    if (!project) {
      return { success: false, error: 'Proyecto no encontrado.' };
    }

    const token = generateClientToken();
    const tokenHash = await hashToken(token);

    const days = input.expiresInDays || 14;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    await sessionRepo.createClientSession(supabase, input.projectId, tokenHash, expiresAt);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const sessionUrl = buildSessionUrl(baseUrl, token);

    // Generate QR code data URL
    const qrCodeDataUrl = await QRCode.toDataURL(sessionUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#080714',
        light: '#FFFFFF',
      },
    });

    return {
      success: true,
      token,
      sessionUrl,
      qrCodeDataUrl,
      expiresAt,
    };
  } catch (err: any) {
    console.error('[generateClientLinkAction] error:', err);
    return { success: false, error: err?.message || 'Error al generar enlace seguro.' };
  }
}
