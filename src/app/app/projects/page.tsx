import React from 'react';
import Link from 'next/link';
import { Plus, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/features/projects/project-card';
import { EmptyState } from '@/components/feedback/empty-state';
import { createServerClient } from '@/lib/supabase/server';
import * as projectRepo from '@/server/repositories/projects';

export const dynamic = 'force-dynamic';

export default async function ProjectsListPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const projects = user ? await projectRepo.getProjectsByOwner(supabase, user.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-poppins text-2xl md:text-3xl font-bold text-white tracking-tight">
            Proyectos fotográficos
          </h1>
          <p className="text-sm text-[#A9A7B7] mt-1">
            Gestiona y monitorea la alineación estética de cada una de tus sesiones.
          </p>
        </div>

        <Button asChild variant="primary" className="gap-2 shadow-glow-purple">
          <Link href="/app/projects/new">
            <Plus className="h-4 w-4" />
            <span>Nuevo proyecto</span>
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No hay proyectos registrados"
          description="Crea tu primer proyecto para enviar el test de preferencias visuales a tu cliente."
          actionLabel="Crear nuevo proyecto"
          actionHref="/app/projects/new"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project as any} />
          ))}
        </div>
      )}
    </div>
  );
}
