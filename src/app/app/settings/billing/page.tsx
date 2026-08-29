import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function BillingPage() {
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-poppins text-2xl md:text-3xl font-bold text-white tracking-tight">
          Suscripción y Plan
        </h1>
        <p className="text-sm text-[#A9A7B7] mt-1">
          Estado actual de tu membresía en ENCUADRE.
        </p>
      </div>

      <Card className="bg-[#100A2E] border-[#7C3DFF]/30 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-[#7C3DFF]/15 text-[#45E679]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-poppins text-base font-bold text-white">Plan Hackathon MVP</h3>
            <p className="text-xs text-[#16C95A] font-semibold">Acceso Ilimitado Gratuito</p>
          </div>
        </div>

        <p className="text-xs text-[#A9A7B7] leading-relaxed">
          Durante la fase de presentación y validación MVP, todas las funcionalidades de análisis de IA, Style DNA, comparaciones visuales ilimitadas y generación de Visual Briefs están 100% habilitadas.
        </p>
      </Card>
    </div>
  );
}
