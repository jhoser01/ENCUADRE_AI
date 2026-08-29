'use client';

import React, { useState } from 'react';
import { Copy, Check, QrCode, Link as LinkIcon, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateClientLinkAction } from '@/server/actions/projects';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-[#080714] border-[#7C3DFF]/30 text-[#F7F7FB]">
          <DialogHeader>
            <DialogTitle className="text-xl">Enlace seguro generado</DialogTitle>
            <DialogDescription className="text-[#A9A7B7]">
              Comparte este enlace único con tu cliente para que realice el test visual.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {qrCode && (
              <div className="flex justify-center p-3 bg-white rounded-xl w-fit mx-auto shadow-lg">
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
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={() => setIsOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
