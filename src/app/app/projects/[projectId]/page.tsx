import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { User, Calendar, QrCode, Sparkles, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlignmentGauge } from '@/components/charts/alignment-gauge';
import { PROJECT_STATUS_LABELS } from '@/constants';
import { formatDate } from '@/lib/utils/format';
import { createServerClient } from '@/lib/supabase/server';
import * as projectRepo from '@/server/repositories/projects';
import * as alignmentRepo from '@/server/repositories/alignment';
import * as briefRepo from '@/server/repositories/briefs';
import { GenerateLinkButton } from '@/features/projects/generate-link-button';

export const dynamic = 'force-dynamic';

export default async function ProjectSummaryPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const project = await projectRepo.getProjectById(supabase, projectId, user?.id);
  if (!project) notFound();

  const alignment = await alignmentRepo.getAlignmentResult(supabase, projectId);
  const brief = await briefRepo.getLatestBrief(supabase, projectId);

  const statusMeta = PROJECT_STATUS_LABELS[project.status] || {
    label: project.status,
    variant: 'active' as const,
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#7C3DFF]/15 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-[#7C3DFF] font-semibold">
              {project.type}
            </span>
            <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
          </div>
          <h1 className="font-poppins text-2xl md:text-3xl font-bold text-white tracking-tight">
            {project.name}
          </h1>
        </div>

        {/* Tab Navigation Header */}
        <div className="flex items-center gap-2 bg-[#100A2E] p-1 rounded-lg border border-[#7C3DFF]/20">
          <Link
            href={`/app/projects/${projectId}`}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#7C3DFF] text-white"
          >
            Resumen
          </Link>
          <Link
            href={`/app/projects/${projectId}/alignment`}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-[#A9A7B7] hover:text-white hover:bg-white/5"
          >
            Alineación
          </Link>
          <Link
            href={`/app/projects/${projectId}/brief`}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-[#A9A7B7] hover:text-white hover:bg-white/5"
          >
            Visual Brief
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metadata & Client Info */}
        <div className="space-y-6">
          <Card className="bg-[#100A2E] border-[#7C3DFF]/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Detalles de la sesión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {(project as any).clients && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-[#7C3DFF] mt-0.5" />
                  <div>
                    <p className="text-xs text-[#A9A7B7]">Cliente asignado</p>
                    <p className="font-medium text-white">{(project as any).clients.name}</p>
                    {(project as any).clients.email && (
                      <p className="text-xs text-[#A9A7B7]">{(project as any).clients.email}</p>
                    )}
                  </div>
                </div>
              )}

              {project.event_date && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-[#7C3DFF] mt-0.5" />
                  <div>
                    <p className="text-xs text-[#A9A7B7]">Fecha del evento</p>
                    <p className="font-medium text-white">{formatDate(project.event_date)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-[#7C3DFF] mt-0.5" />
                <div>
                  <p className="text-xs text-[#A9A7B7]">Estado</p>
                  <p className="font-medium text-white">{statusMeta.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle & Right: Alignment & Brief Status */}
        <div className="lg:col-span-2 space-y-6">
          {alignment ? (
            <Card className="bg-[#100A2E] border-[#16C95A]/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                  <CheckCircle2 className="h-5 w-5 text-[#16C95A]" />
                  Alineación estética completada
                </CardTitle>
                <Button asChild variant="primary" size="sm">
                  <Link href={`/app/projects/${projectId}/alignment`}>
                    Ver análisis completo →
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <AlignmentGauge
                  score={alignment.score}
                  confidence={0.95}
                  size="md"
                  showLabels={false}
                />
                <div className="space-y-2 text-sm text-[#A9A7B7]">
                  <p className="text-white font-medium">{alignment.explanation}</p>
                  <p className="text-xs">
                    Se han identificado {alignment.mismatches?.length || 0} puntos a comentar antes de la sesión.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#100A2E] border-[#F5A524]/30">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-[#F5A524] flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Esperando respuestas del cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-[#A9A7B7]">
                <p>
                  El cliente aún no ha completado su test visual. En cuanto responda las comparaciones, se calculará el Alignment Score automáticamente.
                </p>
                <div className="pt-2 border-t border-[#F5A524]/20">
                  <p className="mb-3 text-xs">Si perdiste el enlace seguro, puedes generar uno nuevo aquí:</p>
                  <GenerateLinkButton projectId={projectId} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Visual Brief Card */}
          <Card className="bg-[#100A2E] border-[#7C3DFF]/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-white">Visual Brief</CardTitle>
              {brief && (
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/app/projects/${projectId}/brief`}>
                    Ver brief ({brief.status === 'approved' ? 'Aprobado ✓' : 'Pendiente'}) →
                  </Link>
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {brief ? (
                <div className="space-y-3">
                  <p className="text-sm text-white font-medium">{brief.content.summary}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {brief.content.visualDirection.map((dir, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full text-xs bg-[#7C3DFF]/15 text-[#45E679] border border-[#7C3DFF]/30"
                      >
                        {dir}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-[#A9A7B7] space-y-3">
                  <p>El Visual Brief se genera una vez calculada la alineación estética.</p>
                  {alignment && (
                    <Button asChild variant="primary" size="sm">
                      <Link href={`/app/projects/${projectId}/alignment`}>
                        Generar Visual Brief ahora
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
