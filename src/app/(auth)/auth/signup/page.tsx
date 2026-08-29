'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { createBrowserClient } from '@/lib/supabase/browser';

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            studio_name: studioName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message || 'Error al crear la cuenta.');
        setLoading(false);
        return;
      }

      if (data.user) {
        router.push('/app');
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'Error al procesar el registro.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080714] text-[#F7F7FB] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo mode="dark" size="lg" href="/" />
        </div>

        <Card className="border-[#7C3DFF]/30 bg-[#100A2E]">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl">Crear cuenta Studio</CardTitle>
            <CardDescription>Comienza a alinear la visión con tus clientes</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-[#E5484D]/15 border border-[#E5484D]/30 text-xs text-[#E5484D]">
                  {error}
                </div>
              )}

              <Input
                type="text"
                label="Tu nombre"
                placeholder="Ej: Carlos Mendoza"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />

              <Input
                type="text"
                label="Nombre de tu estudio o marca"
                placeholder="Ej: Mendoza Photography"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                required
              />

              <Input
                type="email"
                label="Correo electrónico"
                placeholder="tu@estudio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                label="Contraseña (mínimo 6 caracteres)"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button type="submit" variant="primary" className="w-full" loading={loading}>
                Crear cuenta gratis
              </Button>

              <p className="text-xs text-center text-[#A9A7B7]">
                ¿Ya tienes cuenta?{' '}
                <Link href="/auth/login" className="text-[#45E679] hover:underline font-medium">
                  Inicia sesión
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
