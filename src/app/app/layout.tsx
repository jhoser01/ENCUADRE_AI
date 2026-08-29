import React from 'react';
import { redirect } from 'next/navigation';
import { StudioLayout } from '@/components/layout/studio-layout';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'ENCUADRE Studio | Dashboard de Fotógrafo',
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return <StudioLayout>{children}</StudioLayout>;
}
