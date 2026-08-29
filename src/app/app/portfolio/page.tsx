import React from 'react';
import { Image as ImageIcon, Sparkles, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { UploadDropzone } from '@/features/portfolio/upload-dropzone';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createServerClient } from '@/lib/supabase/server';
import * as portfolioRepo from '@/server/repositories/portfolio';

export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const images = user ? await portfolioRepo.getPortfolioImagesByOwner(supabase, user.id) : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-poppins text-2xl md:text-3xl font-bold text-white tracking-tight">
          Portafolio representativo
        </h1>
        <p className="text-sm text-[#A9A7B7] mt-1">
          Sube tus mejores fotografías para que el sistema aprenda tu Style DNA y las utilice en los tests de tus clientes.
        </p>
      </div>

      {/* Upload Zone */}
      <UploadDropzone />

      {/* Images Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-poppins text-lg font-bold text-white">
            Tus fotografías ({images.length})
          </h2>
          <span className="text-xs text-[#A9A7B7]">
            {images.filter((i) => i.analysis_status === 'completed').length} analizadas con IA
          </span>
        </div>

        {images.length === 0 ? (
          <div className="p-8 text-center bg-[#100A2E]/40 rounded-card border border-[#7C3DFF]/15 text-[#A9A7B7] text-sm">
            Aún no has subido fotografías. Usa la zona de arriba para comenzar a construir tu portafolio.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((img) => (
              <Card
                key={img.id}
                className="overflow-hidden bg-[#100A2E] border-[#7C3DFF]/20 flex flex-col justify-between"
              >
                <div className="relative aspect-square w-full bg-[#080714] flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-[#7C3DFF]/40" />
                  {/* Status Badge Overlay */}
                  <div className="absolute top-2 right-2">
                    {img.analysis_status === 'completed' ? (
                      <span className="p-1 rounded-full bg-[#16C95A] text-black shadow" title="Analizada">
                        <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" />
                      </span>
                    ) : img.analysis_status === 'processing' ? (
                      <span className="p-1 rounded-full bg-[#F5A524] text-black shadow animate-spin" title="Analizando...">
                        <Clock className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <span className="p-1 rounded-full bg-white/20 text-white shadow" title="Pendiente">
                        <Clock className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2.5 text-xs space-y-1 bg-[#100A2E]">
                  <div className="flex items-center justify-between text-[#A9A7B7]">
                    <span className="truncate">{img.category || 'Fotografía'}</span>
                    <span>{img.width ? `${img.width}px` : ''}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
