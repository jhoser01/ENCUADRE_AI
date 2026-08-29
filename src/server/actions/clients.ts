'use server';

/**
 * actions/clients.ts
 * Server Actions for client management.
 */

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import { createClientSchema } from '@/schemas';
import * as clientRepo from '@/server/repositories/clients';
import type { Client } from '@/types/database';

export async function createClientAction(formData: {
  name: string;
  email?: string;
  phone?: string;
}): Promise<{ success: boolean; client?: Client; error?: string }> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: 'No autorizado. Inicia sesión.' };
    }

    const validated = createClientSchema.parse(formData);
    const client = await clientRepo.createClient(supabase, user.id, validated);

    revalidatePath('/app/clients');
    revalidatePath('/app/projects/new');
    return { success: true, client };
  } catch (err: any) {
    console.error('[createClientAction] error:', err);
    return { success: false, error: err?.message || 'Error al crear el cliente.' };
  }
}
