import React from 'react';
import { StudioLayout } from '@/components/layout/studio-layout';

export const metadata = {
  title: 'ENCUADRE Studio | Dashboard de Fotógrafo',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <StudioLayout>{children}</StudioLayout>;
}
