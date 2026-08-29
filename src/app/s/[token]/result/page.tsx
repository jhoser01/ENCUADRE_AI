import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Sparkles, CheckCircle2, ArrowRight, HeartHandshake, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { AlignmentGauge } from '@/components/charts/alignment-gauge';
import { validateClientTokenAction } from '@/server/actions/sessions';
import { createServerClient } from '@/lib/supabase/server';
import * as alignmentRepo from '@/server/repositories/alignment';

export const dynamic = 'force-dynamic';

export default async function ClientResultPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const validation = await validateClientTokenAction(token);

  if (!validation.valid || !validation.projectId) notFound();

  const supabase = await createServerClient();
  const alignment = await alignmentRepo.getAlignmentResult(supabase, validation.projectId);

  const score = alignment?.score || 85;

  return (
    <div className="space-y-6 max-w-md mx-auto my-auto w-full text-center">
      {/* Top Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16C95A]/15 text-[#16C95A] text-xs font-semibold">
          <HeartHandshake className="h-4 w-4" />
          <span>¡Preferencias registradas con éxito!</span>
        </div>
        <h1 className="font-poppins text-2xl md:text-3xl font-bold text-[#080714]">
          Tu compatibilidad visual con {validation.photographerName}
        </h1>
        <p className="text-xs text-[#626171]">
          Hemos cruzado tus elecciones visuales con el portafolio del fotógrafo.
        </p>
      </div>

      {/* Alignment Gauge in Dark Card */}
      <Card className="bg-[#100A2E] border-[#7C3DFF]/30 shadow-lg p-6 space-y-4">
        <div data-testid="client-score">
          <AlignmentGauge score={score} size="md" />
        </div>

        <div className="space-y-2 text-xs text-[#F7F7FB] text-left pt-2 border-t border-[#7C3DFF]/20 mt-4">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#7C3DFF]">
            Puntos destacados de tu visión:
          </h4>
          <ul className="space-y-1 text-[#A9A7B7]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#16C95A] flex-shrink-0" />
              <span>Gusto por tomas naturales y luz orgánica</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#16C95A] flex-shrink-0" />
              <span>Preferencia por momentos espontáneos</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#16C95A] flex-shrink-0" />
              <span>Armonía con la paleta de color del estudio</span>
            </li>
          </ul>
        </div>
      </Card>

      {/* Action to View & Approve Brief */}
      <div className="space-y-2 pt-2">
        <Button asChild variant="primary" size="lg" className="w-full text-sm gap-2">
          <Link href={`/s/${token}/brief`}>
            <span>Ver y aprobar mi Visual Brief</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>

        <p className="text-[11px] text-[#626171]">
          Tu fotógrafo revisará estas preferencias antes de iniciar la sesión.
        </p>
      </div>
    </div>
  );
}
