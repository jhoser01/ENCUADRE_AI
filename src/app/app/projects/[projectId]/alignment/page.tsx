import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlignmentGauge } from '@/components/charts/alignment-gauge';
import { DimensionBars } from '@/components/charts/dimension-bars';
import { MismatchCard } from '@/features/alignment/mismatch-card';
import { createServerClient } from '@/lib/supabase/server';
import * as projectRepo from '@/server/repositories/projects';
import * as alignmentRepo from '@/server/repositories/alignment';
import * as briefRepo from '@/server/repositories/briefs';

export const dynamic = 'force-dynamic';

export default async function ProjectAlignmentPage({
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

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#7C3DFF]/15 pb-5">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#7C3DFF] font-semibold">
            Análisis de Compatibilidad
          </span>
          <h1 className="font-poppins text-2xl md:text-3xl font-bold text-white tracking-tight">
            Alineación: {project.name}
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-[#100A2E] p-1 rounded-lg border border-[#7C3DFF]/20">
          <Link
            href={`/app/projects/${projectId}`}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-[#A9A7B7] hover:text-white hover:bg-white/5"
          >
            Resumen
          </Link>
          <Link
            href={`/app/projects/${projectId}/alignment`}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#7C3DFF] text-white"
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

      {!alignment ? (
        <Card className="p-8 text-center bg-[#100A2E] border-[#7C3DFF]/20">
          <p className="text-sm text-[#A9A7B7]">
            Aún no se ha calculado el Alignment Score porque el cliente no ha completado el test visual.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Main Score Hero Card */}
          <Card className="bg-[#100A2E] border-[#7C3DFF]/30 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div data-testid="alignment-score">
                <AlignmentGauge
                  score={alignment.score}
                  confidence={0.95}
                  size="lg"
                />
              </div>

              <div className="flex-1 space-y-4 max-w-xl text-center md:text-left">
                <h3 className="font-poppins text-xl font-bold text-white">
                  Diagnóstico visual de la sesión
                </h3>
                <p className="text-sm text-[#F7F7FB]/90 leading-relaxed">
                  {alignment.explanation}
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <form action={`/app/projects/${projectId}/brief`}>
                    <Button variant="primary" className="gap-2 shadow-glow-purple">
                      <FileText className="h-4 w-4" />
                      <span>{brief ? 'Ver Visual Brief' : 'Generar Visual Brief con IA'}</span>
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </Card>

          {/* Key Mismatches and Coincidences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Divergencias */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#F5A524] uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4" />
                <span>Divergencias principales (a comentar)</span>
              </div>

              {alignment.mismatches && alignment.mismatches.length > 0 ? (
                <div className="space-y-3">
                  {alignment.mismatches.map((mismatch, i) => (
                    <MismatchCard key={i} mismatch={mismatch} type="mismatch" />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#A9A7B7]">No se detectaron divergencias significativas.</p>
              )}
            </div>

            {/* Coincidencias */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#16C95A] uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" />
                <span>Coincidencias clave (puntos fuertes)</span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border bg-[#16C95A]/10 border-[#16C95A]/30 space-y-1">
                  <h4 className="text-sm font-semibold text-white">Espontaneidad y momento</h4>
                  <p className="text-xs text-[#F7F7FB]/85">
                    Existe plena sintonía en capturar tomas genuinas sin posados artificiales.
                  </p>
                </div>
                <div className="p-4 rounded-xl border bg-[#16C95A]/10 border-[#16C95A]/30 space-y-1">
                  <h4 className="text-sm font-semibold text-white">Luz natural</h4>
                  <p className="text-xs text-[#F7F7FB]/85">
                    Ambos coinciden en priorizar la atmósfera orgánica de la luz ambiental.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 14 Dimension Breakdown Chart */}
          <Card className="bg-[#100A2E] border-[#7C3DFF]/20 p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg font-bold text-white">
                Desglose por 14 Dimensiones Visuales
              </CardTitle>
              <p className="text-xs text-[#A9A7B7]">
                Comparación directa entre el Style DNA de tu portafolio y el vector de preferencias del cliente.
              </p>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <DimensionBars dimensions={alignment.dimensions || []} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
