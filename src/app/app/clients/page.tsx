import React from 'react';
import { Users, Mail, Phone, FolderKanban } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/feedback/empty-state';
import { createServerClient } from '@/lib/supabase/server';
import * as clientRepo from '@/server/repositories/clients';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const clients = user ? await clientRepo.getClientsByOwner(supabase, user.id) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-poppins text-2xl md:text-3xl font-bold text-white tracking-tight">
          Tus Clientes
        </h1>
        <p className="text-sm text-[#A9A7B7] mt-1">
          Directorio de clientes y proyectos fotográficos asociados.
        </p>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No hay clientes registrados"
          description="Al crear un proyecto nuevo podrás registrar clientes automáticamente."
          actionLabel="Crear nuevo proyecto"
          actionHref="/app/projects/new"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((client) => {
            const projectCount = (client as any).projects?.length || 0;
            return (
              <Card key={client.id} className="bg-[#100A2E] border-[#7C3DFF]/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-white">
                      {client.name}
                    </CardTitle>
                    <span className="text-xs text-[#45E679] bg-[#45E679]/10 px-2 py-0.5 rounded-full">
                      {projectCount} sesión(es)
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2 text-xs text-[#A9A7B7]">
                  {client.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-[#7C3DFF]" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-[#7C3DFF]" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
