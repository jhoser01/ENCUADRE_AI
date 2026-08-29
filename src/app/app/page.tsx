import React from 'react';
import Link from 'next/link';
import { Plus, FolderKanban, Clock, FileCheck, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ProjectCard } from '@/features/projects/project-card';
import { EmptyState } from '@/components/feedback/empty-state';
import { createServerClient } from '@/lib/supabase/server';
import * as projectRepo from '@/server/repositories/projects';
import type { Project } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let projects: Project[] = [];
  let profileName = 'Fotógrafo';

  if (user) {
    projects = await projectRepo.getProjectsByOwner(supabase, user.id);
    const { data: profile } = (await supabase.from('profiles').select('display_name').eq('id', user.id).single()) as any;
    if (profile?.display_name) profileName = profile.display_name;
  }

  // Calculate dashboard stats
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const waitingCount = projects.filter((p) => p.status === 'waiting').length;
  const alignedCount = projects.filter((p) => p.status === 'aligned').length;

  const scoredProjects = projects.filter((p) => p.alignment_score !== null);
  const avgScore =
    scoredProjects.length > 0
      ? Math.round(scoredProjects.reduce((sum, p) => sum + (p.alignment_score || 0), 0) / scoredProjects.length)
      : null;

  return (
    <div className="space-y-8">
      {/* Header with Greeting & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-poppins text-2xl md:text-3xl font-bold text-white tracking-tight">
            Hola, {profileName}
          </h1>
          <p className="text-sm text-[#A9A7B7] mt-1">
            Aquí está el estado visual de tus proyectos y sesiones activas.
          </p>
        </div>

        <Button asChild variant="primary" className="gap-2 shadow-glow-purple">
          <Link href="/app/projects/new">
            <Plus className="h-4 w-4" />
            <span>Nuevo proyecto</span>
          </Link>
        </Button>
      </div>

      {/* Actionable Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#100A2E]/80 border-[#7C3DFF]/20">
          <CardHeader className="pb-2">
            <span className="text-xs text-[#A9A7B7] font-medium uppercase tracking-wider flex items-center gap-1.5">
              <FolderKanban className="h-3.5 w-3.5 text-[#7C3DFF]" />
              Proyectos activos
            </span>
          </CardHeader>
          <CardContent>
            <span className="font-poppins text-3xl font-bold text-white">{activeCount}</span>
          </CardContent>
        </Card>

        <Card className="bg-[#100A2E]/80 border-[#7C3DFF]/20">
          <CardHeader className="pb-2">
            <span className="text-xs text-[#A9A7B7] font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#F5A524]" />
              Esperando cliente
            </span>
          </CardHeader>
          <CardContent>
            <span className="font-poppins text-3xl font-bold text-[#F5A524]">{waitingCount}</span>
          </CardContent>
        </Card>

        <Card className="bg-[#100A2E]/80 border-[#7C3DFF]/20">
          <CardHeader className="pb-2">
            <span className="text-xs text-[#A9A7B7] font-medium uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="h-3.5 w-3.5 text-[#16C95A]" />
              Briefs acordados
            </span>
          </CardHeader>
          <CardContent>
            <span className="font-poppins text-3xl font-bold text-[#16C95A]">{alignedCount}</span>
          </CardContent>
        </Card>

        <Card className="bg-[#100A2E]/80 border-[#7C3DFF]/20">
          <CardHeader className="pb-2">
            <span className="text-xs text-[#A9A7B7] font-medium uppercase tracking-wider flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-[#45E679]" />
              Score promedio
            </span>
          </CardHeader>
          <CardContent>
            <span className="font-poppins text-3xl font-bold text-white">
              {avgScore !== null ? `${avgScore}%` : '--'}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-poppins text-xl font-bold text-white">Proyectos recientes</h2>
          {projects.length > 0 && (
            <Link href="/app/projects" className="text-xs text-[#7C3DFF] hover:text-[#45E679] font-medium">
              Ver todos →
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Aún no tienes proyectos creados"
            description="Crea tu primer proyecto para generar un enlace visual y alinearte con tu cliente antes de la sesión."
            actionLabel="Crear mi primer proyecto"
            actionHref="/app/projects/new"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.slice(0, 6).map((project) => (
              <ProjectCard key={project.id} project={project as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
