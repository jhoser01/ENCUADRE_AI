import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { ClientLayout } from '@/components/layout/client-layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { validateClientTokenAction } from '@/server/actions/sessions';

export default async function ClientSessionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const validation = await validateClientTokenAction(token);

  if (!validation.valid) {
    return (
      <ClientLayout>
        <Card className="bg-white border-[#EEEEF5] shadow-sm text-center p-6 space-y-4">
          <div className="mx-auto p-3 rounded-full bg-[#E5484D]/10 text-[#E5484D] w-fit">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="font-poppins text-lg font-bold text-[#080714]">
              Enlace no disponible
            </h2>
            <p className="text-xs text-[#626171] leading-relaxed">
              {validation.error || 'Este enlace de sesión es inválido, ya fue completado o ha expirado. Por favor solicita uno nuevo a tu fotógrafo.'}
            </p>
          </div>
        </Card>
      </ClientLayout>
    );
  }

  return <ClientLayout>{children}</ClientLayout>;
}
