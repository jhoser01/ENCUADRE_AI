'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { loginAction } from '@/server/actions/auth';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await loginAction(formData);

      if (result && !result.success) {
        setError(result.error || 'Error al iniciar sesión.');
        setLoading(false);
      }
    } catch (err: any) {
      // Next.js redirect() throws a NEXT_REDIRECT error which is caught by Next.js router
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
            <CardTitle className="text-2xl">Studio Login</CardTitle>
            <CardDescription>Accede a tu panel de fotógrafo en ENCUADRE</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-[#E5484D]/15 border border-[#E5484D]/30 text-xs text-[#E5484D] leading-relaxed">
                  {error}
                </div>
              )}

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
                label="Contraseña"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button type="submit" variant="primary" className="w-full gap-2" loading={loading}>
                <span>{loading ? 'Iniciando sesión...' : 'Iniciar sesión'}</span>
                {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>

              <p className="text-xs text-center text-[#A9A7B7]">
                ¿No tienes cuenta aún?{' '}
                <Link href="/auth/signup" className="text-[#45E679] hover:underline font-medium">
                  Regístrate aquí
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
