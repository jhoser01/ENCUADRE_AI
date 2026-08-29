'use client';

import React, { useState } from 'react';
import { Copy, Check, Link as LinkIcon, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateClientLinkAction } from '@/server/actions/projects';

export function GenerateLinkButton({ projectId }: { projectId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateClientLinkAction({ projectId });
      if (res.success && res.sessionUrl) {
        setLink(res.sessionUrl);
        setQrCode(res.qrCodeDataUrl || null);
        setIsOpen(true);
      } else {
        setError(res.error || 'Error al generar enlace.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          loading={loading}
          className="w-full gap-2 text-xs border-[#7C3DFF]/30 text-white hover:bg-[#7C3DFF]/20"
        >
          {loading ? (
            'Generando...'
          ) : (
            <>
              <LinkIcon className="h-3.5 w-3.5" />
              Generar nuevo enlace seguro
            </>
          )}
        </Button>
        {error && <p className="text-xs text-[#E5484D]">{error}</p>}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#080714] border border-[#7C3DFF]/30 rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-[#A9A7B7] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <div className="mx-auto p-2 rounded-full bg-[#16C95A]/20 text-[#16C95A] w-fit mb-3">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-white">Enlace seguro generado</h2>
                <p className="text-sm text-[#A9A7B7]">
                  Comparte este enlace único con tu cliente para que realice el test visual.
                </p>
              </div>

              {qrCode && (
                <div className="flex justify-center p-3 bg-white rounded-xl w-fit mx-auto shadow-lg my-6">
                  <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                </div>
              )}

              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#100A2E] border border-[#7C3DFF]/30">
                <span className="text-xs text-[#F7F7FB] truncate flex-1 text-left font-mono select-all">
                  {link}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyToClipboard}
                  className="text-xs gap-1.5 flex-shrink-0"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-[#16C95A]" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </Button>
              </div>

              <div className="flex justify-end pt-4 border-t border-[#7C3DFF]/10 mt-4">
                <Button variant="primary" onClick={() => setIsOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
