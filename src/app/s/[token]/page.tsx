import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Camera, Sparkles, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { validateClientTokenAction } from '@/server/actions/sessions';

export default async function ClientWelcomePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const validation = await validateClientTokenAction(token);

  if (!validation.valid) notFound();

  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-center my-auto">
      {/* Studio / Photographer Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EEEEF5] text-xs font-semibold text-[#080714]">
        <Camera className="h-3.5 w-3.5 text-[#7C3DFF]" />
        <span>Sesión con {validation.photographerName || 'tu fotógrafo'}</span>
      </div>

      {/* Main Headline */}
      <div className="space-y-3">
        <h1 className="font-poppins text-3xl sm:text-4xl font-bold text-[#080714] tracking-tight leading-tight">
          Tu sesión fotográfica comienza aquí
        </h1>
        <p className="text-sm text-[#626171] leading-relaxed max-w-sm mx-auto">
          En los próximos 2 minutos, te mostraremos pares de fotografías reales. Simplemente elige las que más se acerquen a lo que imaginas para tu sesión.
        </p>
      </div>

      {/* 3 Step highlights */}
      <div className="w-full space-y-2 text-left bg-white p-4 rounded-xl border border-[#EEEEF5] shadow-sm">
        <div className="flex items-center gap-3 text-xs text-[#080714]">
          <span className="w-5 h-5 rounded-full bg-[#7C3DFF]/15 text-[#7C3DFF] flex items-center justify-center font-bold">1</span>
          <span>Elige entre 8 a 10 pares de fotos</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#080714]">
          <span className="w-5 h-5 rounded-full bg-[#7C3DFF]/15 text-[#7C3DFF] flex items-center justify-center font-bold">2</span>
          <span>Responde 3 preguntas rápidas de contexto</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#080714]">
          <span className="w-5 h-5 rounded-full bg-[#16C95A]/15 text-[#16C95A] flex items-center justify-center font-bold">3</span>
          <span>Revisa y aprueba tu Visual Brief</span>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="w-full space-y-3 pt-2">
        <Button asChild variant="primary" size="lg" className="w-full text-base gap-2 shadow-md">
          <Link href={`/s/${token}/preferences`}>
            <span>Comenzar</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>

        {/* Privacy Note */}
        <p className="text-[11px] text-[#626171] flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#16C95A]" />
          <span>Tus respuestas se comparten exclusivamente con tu fotógrafo.</span>
        </p>
      </div>
    </div>
  );
}
