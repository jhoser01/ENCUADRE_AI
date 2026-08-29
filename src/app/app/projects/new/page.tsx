'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Check, Copy, QrCode, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { createProjectAction, generateClientLinkAction } from '@/server/actions/projects';
import { createClientAction } from '@/server/actions/clients';
import { createBrowserClient } from '@/lib/supabase/browser';
import { cn } from '@/lib/utils/cn';

const SESSION_TYPES = [
  { value: 'wedding', label: 'Boda / Matrimonio' },
  { value: 'portrait', label: 'Retrato individual / Personal branding' },
  { value: 'editorial', label: 'Editorial / Moda' },
  { value: 'family', label: 'Familia / Pareja / Maternidad' },
  { value: 'corporate', label: 'Corporativo / Empresa' },
  { value: 'event', label: 'Evento / Celebración' },
];

export default function NewProjectWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Project info
  const [projectName, setProjectName] = useState('');
  const [sessionType, setSessionType] = useState('wedding');
  const [eventDate, setEventDate] = useState('');

  // Step 2: Client
  const [clients, setClients] = useState<Array<{ id: string; name: string; email?: string }>>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isCreatingNewClient, setIsCreatingNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  // Step 3: Reference images from portfolio
  const [portfolioImages, setPortfolioImages] = useState<Array<{ id: string; storage_path: string; thumbnail_path?: string }>>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);

  // Step 4: Output & Link Generation
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [sessionLink, setSessionLink] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial clients and portfolio images on mount
  useEffect(() => {
    async function loadData() {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name, email')
        .eq('owner_id', user.id);
      if (clientsData) setClients(clientsData);

      const { data: imagesData } = await supabase
        .from('portfolio_images')
        .select('id, storage_path, thumbnail_path')
        .eq('owner_id', user.id);
      if (imagesData) setPortfolioImages(imagesData);
    }
    loadData();
  }, []);

  const handleCreateProjectAndGenerateLink = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      let finalClientId = selectedClientId;

      // Create new client if selected
      if (isCreatingNewClient && newClientName.trim()) {
        const clientRes = await createClientAction({
          name: newClientName,
          email: newClientEmail || undefined,
          phone: newClientPhone || undefined,
        });
        if (clientRes.success && clientRes.client) {
          finalClientId = clientRes.client.id;
        } else {
          setError(clientRes.error || 'Error al registrar el nuevo cliente.');
          setIsSubmitting(false);
          return;
        }
      }

      // Create project
      const projRes = await createProjectAction({
        name: projectName,
        type: sessionType,
        client_id: finalClientId || undefined,
        event_date: eventDate ? new Date(eventDate).toISOString() : undefined,
        reference_image_ids: selectedImageIds,
      });

      if (!projRes.success || !projRes.project) {
        setError(projRes.error || 'Error al crear el proyecto.');
        setIsSubmitting(false);
        return;
      }

      const projId = projRes.project.id;
      setCreatedProjectId(projId);

      // Generate client link & QR
      const linkRes = await generateClientLinkAction({ projectId: projId });
      if (linkRes.success && linkRes.sessionUrl) {
        setSessionLink(linkRes.sessionUrl);
        setQrCodeUrl(linkRes.qrCodeDataUrl || null);
        setStep(4);
      } else {
        setError(linkRes.error || 'Error al generar enlace seguro.');
      }
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleImageSelection = (id: string) => {
    setSelectedImageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const copyToClipboard = () => {
    if (sessionLink) {
      navigator.clipboard.writeText(sessionLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Back and Step Indicator */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (step > 1 && step < 4) setStep((step - 1) as any);
            else router.push('/app/projects');
          }}
          className="inline-flex items-center gap-1.5 text-xs text-[#A9A7B7] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{step === 1 ? 'Cancelar' : 'Paso anterior'}</span>
        </button>

        {step < 4 && (
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={cn(
                  'w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center transition-colors',
                  step === s
                    ? 'bg-[#7C3DFF] text-white'
                    : step > s
                    ? 'bg-[#16C95A] text-white'
                    : 'bg-[#100A2E] text-[#A9A7B7] border border-[#7C3DFF]/20'
                )}
              >
                {step > s ? '✓' : s}
              </span>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-[#E5484D]/15 border border-[#E5484D]/30 text-xs text-[#E5484D]">
          {error}
        </div>
      )}

      {/* ─── STEP 1: General Project Info ─────────────────────────────────── */}
      {step === 1 && (
        <Card className="bg-[#100A2E] border-[#7C3DFF]/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Paso 1: Información de la sesión</CardTitle>
            <p className="text-xs text-[#A9A7B7]">
              Define el nombre y tipo de sesión fotográfica que vas a realizar.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nombre del proyecto"
              placeholder="Ej: Boda Ana & Carlos o Retrato Profesional"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#A9A7B7]">Tipo de sesión</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="flex h-11 w-full rounded-md px-3.5 py-2 text-sm bg-[#100A2E] border border-[#7C3DFF]/30 text-[#F7F7FB] focus:outline-none focus:ring-2 focus:ring-[#7C3DFF]"
              >
                {SESSION_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-[#100A2E] text-white">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              type="date"
              label="Fecha tentativa del evento (opcional)"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              variant="primary"
              disabled={!projectName.trim()}
              onClick={() => setStep(2)}
            >
              Siguiente: Seleccionar cliente →
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ─── STEP 2: Client Selection ─────────────────────────────────────── */}
      {step === 2 && (
        <Card className="bg-[#100A2E] border-[#7C3DFF]/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Paso 2: ¿Quién es tu cliente?</CardTitle>
            <p className="text-xs text-[#A9A7B7]">
              Selecciona un cliente existente o añade uno nuevo para asignarlo al proyecto.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isCreatingNewClient ? (
              <div className="space-y-3">
                {clients.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                    {clients.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedClientId(c.id)}
                        className={cn(
                          'p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors',
                          selectedClientId === c.id
                            ? 'border-[#7C3DFF] bg-[#7C3DFF]/15 text-white'
                            : 'border-[#7C3DFF]/15 bg-[#080714]/40 hover:border-[#7C3DFF]/40 text-[#A9A7B7]'
                        )}
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">{c.name}</p>
                          {c.email && <p className="text-xs text-[#A9A7B7]">{c.email}</p>}
                        </div>
                        {selectedClientId === c.id && <Check className="h-4 w-4 text-[#45E679]" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#A9A7B7] py-2">No tienes clientes registrados aún.</p>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setIsCreatingNewClient(true);
                    setSelectedClientId('');
                  }}
                >
                  + Registrar un cliente nuevo
                </Button>
              </div>
            ) : (
              <div className="space-y-3 p-4 rounded-lg bg-[#080714]/60 border border-[#7C3DFF]/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#45E679] uppercase tracking-wider">
                    Nuevo Cliente
                  </span>
                  {clients.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsCreatingNewClient(false)}
                      className="text-xs text-[#A9A7B7] hover:underline"
                    >
                      Elegir existente
                    </button>
                  )}
                </div>

                <Input
                  label="Nombre del cliente"
                  placeholder="Ej: Ana García"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  label="Correo electrónico (opcional)"
                  placeholder="ana@gmail.com"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                />
                <Input
                  type="tel"
                  label="Teléfono / WhatsApp (opcional)"
                  placeholder="+51 987 654 321"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button
              variant="primary"
              disabled={!selectedClientId && !newClientName.trim()}
              onClick={() => setStep(3)}
            >
              Siguiente: Fotos de referencia →
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ─── STEP 3: Reference Portfolio Images ───────────────────────────── */}
      {step === 3 && (
        <Card className="bg-[#100A2E] border-[#7C3DFF]/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Paso 3: Fotos de referencia para la prueba</CardTitle>
            <p className="text-xs text-[#A9A7B7]">
              Selecciona las fotos de tu portafolio que usará el cliente en su test visual (o deja todas por defecto).
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {portfolioImages.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#A9A7B7]">
                  <span>{selectedImageIds.length} seleccionadas</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImageIds(
                        selectedImageIds.length === portfolioImages.length
                          ? []
                          : portfolioImages.map((i) => i.id)
                      )
                    }
                    className="text-[#7C3DFF] hover:underline"
                  >
                    {selectedImageIds.length === portfolioImages.length
                      ? 'Deseleccionar todas'
                      : 'Seleccionar todas'}
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-1">
                  {portfolioImages.map((img) => {
                    const isSelected = selectedImageIds.includes(img.id);
                    return (
                      <div
                        key={img.id}
                        data-testid="portfolio-image"
                        onClick={() => toggleImageSelection(img.id)}
                        className={cn(
                          'relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all',
                          isSelected
                            ? 'border-[#45E679] ring-2 ring-[#45E679]/30 scale-[0.98]'
                            : 'border-[#7C3DFF]/20 opacity-70 hover:opacity-100'
                        )}
                      >
                        <div className="w-full h-full bg-[#100A2E] flex items-center justify-center text-xs text-[#A9A7B7]">
                          Foto
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 p-1 rounded-full bg-[#45E679] text-black">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#A9A7B7]">
                Aún no has subido fotografías a tu portafolio. Podrás agregarlas luego desde la sección Portafolio.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              variant="primary"
              loading={isSubmitting}
              onClick={handleCreateProjectAndGenerateLink}
            >
              Crear proyecto y generar enlace seguro →
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* ─── STEP 4: Generated Link & QR ──────────────────────────────────── */}
      {step === 4 && sessionLink && (
        <Card className="bg-[#100A2E] border-[#16C95A]/40 text-center">
          <CardHeader className="space-y-2">
            <div className="mx-auto p-3 rounded-full bg-[#16C95A]/20 text-[#16C95A] w-fit">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              ¡Proyecto creado y enlace listo!
            </CardTitle>
            <p className="text-xs text-[#A9A7B7] max-w-md mx-auto">
              Comparte este enlace seguro o el código QR con tu cliente por WhatsApp o correo. No necesita registrarse ni descargar nada.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* QR Code */}
            {qrCodeUrl && (
              <div className="flex justify-center p-3 bg-white rounded-xl w-fit mx-auto shadow-lg">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
            )}

            {/* Copyable Link */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#080714] border border-[#7C3DFF]/30">
                <span
                  data-testid="session-url"
                  className="text-xs text-[#F7F7FB] truncate flex-1 text-left font-mono select-all"
                >
                  {sessionLink}
                </span>
                <Button variant="secondary" size="sm" onClick={copyToClipboard} className="text-xs gap-1.5 flex-shrink-0">
                  {copied ? <Check className="h-3.5 w-3.5 text-[#16C95A]" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center gap-4">
            <Button
              variant="primary"
              onClick={() => router.push(`/app/projects/${createdProjectId}`)}
            >
              Ir al resumen del proyecto
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
