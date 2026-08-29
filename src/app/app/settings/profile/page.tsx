'use client';

import React, { useState, useEffect } from 'react';
import { User, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { createBrowserClient } from '@/lib/supabase/browser';

export default function ProfileSettingsPage() {
  const [displayName, setDisplayName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [timezone, setTimezone] = useState('America/Lima');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = (await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()) as any;

      if (profile) {
        setDisplayName(profile.display_name || '');
        setStudioName(profile.studio_name || '');
        setTimezone(profile.timezone || 'America/Lima');
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: displayName,
          studio_name: studioName,
          timezone,
          updated_at: new Date().toISOString(),
        } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-poppins text-2xl md:text-3xl font-bold text-white tracking-tight">
          Ajustes de Perfil
        </h1>
        <p className="text-sm text-[#A9A7B7] mt-1">
          Configura tu información de estudio y datos de contacto visibles para tus clientes.
        </p>
      </div>

      <Card className="bg-[#100A2E] border-[#7C3DFF]/30">
        <form onSubmit={handleSave}>
          <CardHeader>
            <CardTitle className="text-lg">Información de Estudio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {saved && (
              <div className="p-3 rounded-lg bg-[#16C95A]/15 border border-[#16C95A]/30 text-xs text-[#16C95A] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Perfil actualizado correctamente.</span>
              </div>
            )}

            <Input
              label="Tu nombre"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <Input
              label="Nombre del estudio"
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              required
            />
            <Input
              label="Zona horaria"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" variant="primary" loading={loading}>
              Guardar cambios
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
