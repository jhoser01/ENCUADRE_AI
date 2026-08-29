'use server';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Por favor ingresa tu correo y contraseña.' };
  }

  const supabase = await createServerClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[loginAction] Supabase error:', error.message);
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        return {
          success: false,
          error: 'Correo o contraseña incorrectos. Verifica tus datos o crea una cuenta si es nueva.',
        };
      }
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'No se pudo iniciar sesión. Intenta nuevamente.' };
    }
  } catch (err: any) {
    console.error('[loginAction] Unexpected error:', err);
    return { success: false, error: err?.message || 'Error de conexión con el servidor.' };
  }

  // Redirect to studio on success
  redirect('/app');
}

export async function signupAction(formData: FormData): Promise<AuthActionResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const displayName = (formData.get('displayName') as string)?.trim() || 'Fotógrafo';
  const studioName = (formData.get('studioName') as string)?.trim() || 'Estudio Fotográfico';

  if (!email || !password) {
    return { success: false, error: 'Por favor completa todos los campos requeridos.' };
  }

  if (password.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  const supabase = await createServerClient();

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          studio_name: studioName,
        },
      },
    });

    if (error) {
      console.error('[signupAction] Supabase error:', error.message);
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'No se pudo completar el registro.' };
    }
  } catch (err: any) {
    console.error('[signupAction] Unexpected error:', err);
    return { success: false, error: err?.message || 'Error de conexión al registrar cuenta.' };
  }

  redirect('/app');
}

export async function logoutAction() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect('/auth/login');
}
