'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { submitClientPreferencesAction } from '@/server/actions/sessions';
import type { ClientAnswers } from '@/types/database';

const LOCATIONS = [
  'Naturaleza / Campo abierto',
  'Urbano / Ciudad',
  'Playa / Atardecer',
  'Estudio cerrado',
  'Casa / Interior íntimo',
];

const MOODS = [
  'Espontáneo, emotivo y natural',
  'Divertido, relajado y alegre',
  'Elegante, artístico y cuidado',
  'Íntimo, romántico y cercano',
];

export default function ClientQuestionsPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;

  const [location, setLocation] = useState(LOCATIONS[0]);
  const [mood, setMood] = useState(MOODS[0]);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Retrieve stored choices from sessionStorage
      let choices: any[] = [];
      if (typeof window !== 'undefined') {
        const stored = sessionStorage.getItem(`encuadre_choices_${token}`);
        if (stored) {
          choices = JSON.parse(stored);
        }
      }

      // If no choices in storage, generate minimal synthetic fallback choice
      if (choices.length === 0) {
        choices = [
          {
            left_image_id: 'a0000000-0000-0000-0000-000000000001',
            right_image_id: 'a0000000-0000-0000-0000-000000000002',
            selected_image_id: 'a0000000-0000-0000-0000-000000000001',
            response_ms: 1200,
          },
        ];
      }

      const answers: ClientAnswers = {
        location,
        mood,
        specialRequests: specialRequests || undefined,
      };

      const res = await submitClientPreferencesAction({
        token,
        choices,
        answers,
      });

      if (res.success) {
        router.push(`/s/${token}/result`);
      } else {
        setError(res.error || 'Error al enviar tus respuestas.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error al procesar tu solicitud.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto my-auto w-full">
      <div className="text-center space-y-1">
        <span className="text-xs font-semibold text-[#7C3DFF] uppercase tracking-wider">
          Paso Final
        </span>
        <h1 className="font-poppins text-2xl font-bold text-[#080714]">
          Cuéntanos un poco más de tu sesión
        </h1>
        <p className="text-xs text-[#626171]">
          Esto ayudará a tu fotógrafo a preparar la locación y los momentos clave.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-[#E5484D]/10 border border-[#E5484D]/30 text-xs text-[#E5484D]">
          {error}
        </div>
      )}

      <Card className="bg-white border-[#EEEEF5] shadow-sm">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 pt-6">
            {/* Locación */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#080714]">
                1. ¿Dónde te imaginas la sesión?
              </label>
              <div className="space-y-1.5">
                {LOCATIONS.map((loc) => (
                  <label
                    key={loc}
                    onClick={() => setLocation(loc)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                      location === loc
                        ? 'border-[#7C3DFF] bg-[#7C3DFF]/10 text-[#080714] font-semibold'
                        : 'border-[#EEEEF5] hover:bg-[#F7F7FB] text-[#626171]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="location"
                      checked={location === loc}
                      onChange={() => setLocation(loc)}
                      className="text-[#7C3DFF]"
                    />
                    <span>{loc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Atmósfera */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#080714]">
                2. ¿Qué vibra o atmósfera buscas?
              </label>
              <div className="space-y-1.5">
                {MOODS.map((m) => (
                  <label
                    key={m}
                    onClick={() => setMood(m)}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                      mood === m
                        ? 'border-[#7C3DFF] bg-[#7C3DFF]/10 text-[#080714] font-semibold'
                        : 'border-[#EEEEF5] hover:bg-[#F7F7FB] text-[#626171]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mood"
                      checked={mood === m}
                      onChange={() => setMood(m)}
                      className="text-[#7C3DFF]"
                    />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Peticiones especiales */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#080714]">
                3. ¿Algún detalle especial que debamos saber? (opcional)
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Ej: Vendrá nuestra mascota, queremos fotos con los abuelos, etc."
                rows={3}
                className="w-full p-3 text-xs rounded-lg border border-[#EEEEF5] bg-white text-[#080714] focus:outline-none focus:ring-2 focus:ring-[#7C3DFF]"
              />
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full text-sm gap-2"
            >
              <span>Enviar mis preferencias</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
