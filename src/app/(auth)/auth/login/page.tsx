'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { createBrowserClient } from '@/lib/supabase/browser';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@encuadre.app');
  const [password, setPassword] = useState('EncuadreDemo2024!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (loginEmail = email, loginPassword = password) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (signInError) {
        setError(signInError.message || 'Credenciales incorrectas.');
        setLoading(false);
        return;
      }

      if (data.user) {
        router.push('/app');
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión.');
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  const handleDemoLogin = () => {
    setEmail('demo@encuadre.app');
    setPassword('EncuadreDemo2024!');
    handleLogin('demo@encuadre.app', 'EncuadreDemo2024!');
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

          {/* Quick Demo Access Button */}
          <div className="px-6 pb-2">
            <Button
              type="button"
              variant="secondary"
              className="w-full text-xs font-semibold gap-2 border-[#16C95A]/40 text-[#16C95A] bg-[#16C95A]/10 hover:bg-[#16C95A]/20"
              onClick={handleDemoLogin}
              loading={loading}
            >
              <Sparkles className="h-4 w-4" />
              <span>⚡ Ingresar como Martín Valdivia (Demo 1-Click)</span>
            </Button>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-[#7C3DFF]/20"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase text-[#A9A7B7] tracking-wider">
                o con tus credenciales
              </span>
              <div className="flex-grow border-t border-[#7C3DFF]/20"></div>
            </div>
          </div>

          <form onSubmit={handleFormSubmit}>
            <CardContent className="space-y-4 pt-0">
              {error && (
                <div className="p-3 rounded-md bg-[#E5484D]/15 border border-[#E5484D]/30 text-xs text-[#E5484D]">
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
              />

              <Input
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button type="submit" variant="primary" className="w-full gap-2" loading={loading}>
                <span>Iniciar sesión</span>
                <ArrowRight className="h-4 w-4" />
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
