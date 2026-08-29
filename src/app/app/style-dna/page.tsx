import React from 'react';
import Link from 'next/link';
import { Dna, Sparkles, RefreshCw, Upload, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DimensionBars } from '@/components/charts/dimension-bars';
import { EmptyState } from '@/components/feedback/empty-state';
import { FEATURE_DIMENSIONS } from '@/constants';
import { createServerClient } from '@/lib/supabase/server';
import * as alignmentRepo from '@/server/repositories/alignment';
import * as portfolioRepo from '@/server/repositories/portfolio';
import { calculateStyleDNA } from '@/server/services/style-dna';
import type { AlignmentDimension } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function StyleDNAPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  let styleProfile = user ? await alignmentRepo.getStyleProfile(supabase, user.id) : null;
  const completedVectors = user ? await portfolioRepo.getCompletedFeatureVectors(supabase, user.id) : [];

  // If no style profile exists but we have completed images, calculate on the fly
  if (!styleProfile && completedVectors.length > 0 && user) {
    const calculated = calculateStyleDNA(completedVectors);
    styleProfile = await alignmentRepo.saveStyleProfile(supabase, {
      owner_id: user.id,
      vector: calculated.vector,
      spread: calculated.spread,
      sample_count: calculated.sample_count,
      algorithm_version: calculated.algorithm_version,
    });
  }

  // Prepare dimension bars (photographer vs neutral 0.5 center)
  const dimensions: AlignmentDimension[] = styleProfile
    ? (Object.keys(styleProfile.vector) as Array<keyof typeof styleProfile.vector>).map((key) => ({
        key,
        photographerValue: styleProfile.vector[key] ?? 0.5,
        clientValue: 0.5, // neutral baseline
        difference: (styleProfile.vector[key] ?? 0.5) - 0.5,
        weight: 1.0,
      }))
    : [];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7C3DFF]/15 text-[#45E679] text-xs font-semibold mb-2">
            <Dna className="h-3.5 w-3.5" />
            <span>Firma Estética del Fotógrafo</span>
          </div>
          <h1 className="font-poppins text-2xl md:text-3xl font-bold text-white tracking-tight">
            Tu Style DNA
          </h1>
          <p className="text-sm text-[#A9A7B7] mt-1">
            Representación matemática de tu estilo visual basada en tus fotografías analizadas ({completedVectors.length} fotos analizadas).
          </p>
        </div>

        {completedVectors.length > 0 && (
          <Button asChild variant="secondary" size="sm" className="gap-2">
            <Link href="/app/portfolio">
              <Upload className="h-3.5 w-3.5" />
              <span>Añadir más fotos</span>
            </Link>
          </Button>
        )}
      </div>

      {!styleProfile || completedVectors.length === 0 ? (
        <EmptyState
          icon={Dna}
          title="Aún no se ha calculado tu Style DNA"
          description="Sube al menos 3 fotografías a tu portafolio para que el sistema aprenda tus preferencias de luz, color, retoque y espontaneidad."
          actionLabel="Subir fotos al portafolio"
          actionHref="/app/portfolio"
        />
      ) : (
        <div className="space-y-6">
          {/* Main Visual Persona Card */}
          <Card className="bg-[#100A2E] border-[#7C3DFF]/30 p-6 md:p-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#45E679]">
                  Perfil Visual Activo
                </span>
                <span className="text-xs text-[#A9A7B7]">
                  Basado en {styleProfile.sample_count} fotografías
                </span>
              </div>

              <h3 className="font-poppins text-xl font-bold text-white">
                Firma Visual Característica
              </h3>

              {/* Trait Tags */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                {FEATURE_DIMENSIONS.map((dim) => {
                  const val = styleProfile?.vector[dim.key] ?? 0.5;
                  if (val >= 0.65) {
                    return (
                      <span
                        key={dim.key}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#7C3DFF]/20 text-[#45E679] border border-[#7C3DFF]/40 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{dim.highLabel} ({Math.round(val * 100)}%)</span>
                      </span>
                    );
                  }
                  if (val <= 0.35) {
                    return (
                      <span
                        key={dim.key}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#16C95A]/10 text-white border border-[#16C95A]/30 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{dim.lowLabel} ({Math.round(val * 100)}%)</span>
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </Card>

          {/* 14 Dimension Breakdown */}
          <Card className="bg-[#100A2E] border-[#7C3DFF]/20 p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-lg font-bold text-white">
                Dimensiones Visuales de tu Portafolio
              </CardTitle>
              <p className="text-xs text-[#A9A7B7]">
                Nivel porcentual promedio de cada característica en tu trabajo fotográfico.
              </p>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <DimensionBars dimensions={dimensions} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
