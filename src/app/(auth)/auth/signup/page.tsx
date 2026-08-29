'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { signupAction } from '@/server/actions/auth';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await signupAction(formData);

      if (result && !result.success) {
        setError(result.error || 'Error al crear la cuenta.');
        setLoading(false);
      }
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT')) {
        return; // Redirecting successfully
      }
      setError(err?.message || 'Error al conectar con el servidor.');
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
                name="displayName"
                type="text"
                label="Tu nombre"
                placeholder="Ej: Carlos Mendoza"
                required
              />

              <Input
                name="studioName"
                type="text"
                label="Nombre de tu estudio o marca"
                placeholder="Ej: Mendoza Photography"
                required
              />

              <Input
                name="email"
                type="email"
                label="Correo electrónico"
                placeholder="tu@estudio.com"
                required
                autoComplete="email"
              />

              <Input
                name="password"
                type="password"
                label="Contraseña (mínimo 6 caracteres)"
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button type="submit" variant="primary" className="w-full" loading={loading}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
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
