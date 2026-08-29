'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadPortfolioImageAction } from '@/server/actions/portfolio';
import { analyzePortfolioImageAction } from '@/server/actions/analysis';
import { cn } from '@/lib/utils/cn';

export function UploadDropzone({ onUploadComplete }: { onUploadComplete?: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setError(null);

    const total = files.length;
    let completed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      setUploadStatus(`Subiendo y optimizando ${i + 1} de ${total}: ${file.name}`);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('is_style_reference', 'true');

      const res = await uploadPortfolioImageAction(formData);

      if (!res.success) {
        setError(res.error || `Error al subir ${file.name}`);
      } else if (res.imageId) {
        completed++;
        // Trigger background AI analysis
        analyzePortfolioImageAction(res.imageId).catch((err) =>
          console.warn('Background analysis error:', err)
        );
      }
    }

    setIsUploading(false);
    setUploadStatus(`¡${completed} fotografía(s) subidas y en análisis!`);

    if (onUploadComplete) {
      onUploadComplete();
    }

    setTimeout(() => {
      setUploadStatus(null);
    }, 4000);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        'relative rounded-card border-2 border-dashed p-8 md:p-12 text-center transition-all duration-200 cursor-pointer',
        isDragging
          ? 'border-[#7C3DFF] bg-[#7C3DFF]/10 scale-[1.01]'
          : 'border-[#7C3DFF]/30 bg-[#100A2E]/40 hover:border-[#7C3DFF]/60 hover:bg-[#100A2E]/60'
      )}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={isUploading}
      />

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 rounded-full bg-[#7C3DFF]/15 text-[#7C3DFF] ring-8 ring-[#7C3DFF]/5">
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <UploadCloud className="h-8 w-8" />
          )}
        </div>

        <div className="space-y-1 max-w-md">
          <p className="font-poppins text-base font-semibold text-white">
            {isUploading ? 'Procesando imágenes...' : 'Arrastra tus fotografías aquí o haz clic para explorar'}
          </p>
          <p className="text-xs text-[#A9A7B7]">
            Formatos JPEG, PNG o WebP. Se optimizan automáticamente a 1920px y se elimina metadata GPS.
          </p>
        </div>

        {uploadStatus && (
          <div className="flex items-center gap-2 text-xs font-medium text-[#16C95A] bg-[#16C95A]/10 px-3 py-1.5 rounded-full border border-[#16C95A]/30">
            <CheckCircle2 className="h-4 w-4" />
            <span>{uploadStatus}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs font-medium text-[#E5484D] bg-[#E5484D]/10 px-3 py-1.5 rounded-full border border-[#E5484D]/30">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {!isUploading && (
          <Button variant="secondary" size="sm" type="button">
            Seleccionar archivos
          </Button>
        )}
      </div>
    </div>
  );
}
