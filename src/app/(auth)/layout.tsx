import React from 'react';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is already logged in, they shouldn't be on auth pages
  if (user) {
    redirect('/app');
  }

  return <>{children}</>;
}
