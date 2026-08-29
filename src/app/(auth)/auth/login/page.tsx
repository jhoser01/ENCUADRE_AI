'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { createBrowserClient } from '@/lib/supabase/browser';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const supabase = createBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInError) {
        setError(signInError.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos. Verifica tus datos o regístrate si es una cuenta nueva.'
          : signInError.message
        );
        setLoading(false);
        return;
      }

      if (data?.user || data?.session) {
        // Full hard navigation to ensure cookies are fresh on server
        window.location.href = '/app';
      } else {
        setError('No se pudo verificar la sesión. Intenta nuevamente.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Error de conexión al iniciar sesión.');
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
                type="email"
                label="Correo electrónico"
                placeholder="tu@estudio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <Input
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
