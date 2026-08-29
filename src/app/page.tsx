import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles, Layers, Eye, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { GradientText } from '@/components/brand/gradient-text';
import { Button } from '@/components/ui/button';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#080714] text-[#F7F7FB] flex flex-col selection:bg-[#7C3DFF]/30">
      {/* Top Navbar */}
      <header className="w-full max-w-[1440px] mx-auto px-6 py-6 flex items-center justify-between">
        <Logo mode="dark" size="md" href="/" />

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="text-sm">
            <Link href="/auth/login">Iniciar sesión</Link>
          </Button>
          <Button asChild variant="primary" className="text-sm">
            <Link href="/auth/signup">Crear cuenta</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-[1200px] mx-auto px-6 pt-12 pb-20 flex flex-col items-center text-center justify-center">
        {/* Highlight pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7C3DFF]/15 border border-[#7C3DFF]/30 text-xs font-semibold text-[#45E679] mb-8 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>La nueva era del entendimiento visual entre fotógrafo y cliente</span>
        </div>

        {/* Headline */}
        <h1 className="font-poppins text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-4xl leading-tight">
          Alinea la visión. <br />
          <GradientText>Antes de tomar la foto.</GradientText>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-[#A9A7B7] max-w-2xl font-normal leading-relaxed">
          Las expectativas visuales se comunican con palabras subjetivas, cuando deberían validarse visualmente. ENCUADRE mide la compatibilidad estética y genera un acuerdo visual antes de la sesión.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button asChild variant="primary" size="lg" className="w-full sm:w-auto text-base gap-2 shadow-glow-purple">
            <Link href="/auth/signup">
              <span>Comenzar gratis</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto text-base">
            <Link href="/app">Ver Studio Demo</Link>
          </Button>
        </div>

        {/* Value Prop 3-step cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 w-full text-left">
          <div className="p-6 rounded-card bg-[#100A2E]/80 border border-[#7C3DFF]/20 space-y-3">
            <div className="p-3 rounded-lg bg-[#7C3DFF]/15 text-[#7C3DFF] w-fit">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="font-poppins text-lg font-semibold text-white">1. Tu Style DNA</h3>
            <p className="text-sm text-[#A9A7B7] leading-relaxed">
              Sube tus fotos representativas. El sistema analiza tu calidez, luz natural, espontaneidad y retoque para definir tu firma visual única.
            </p>
          </div>

          <div className="p-6 rounded-card bg-[#100A2E]/80 border border-[#7C3DFF]/20 space-y-3">
            <div className="p-3 rounded-lg bg-[#16C95A]/15 text-[#16C95A] w-fit">
              <Eye className="h-6 w-6" />
            </div>
            <h3 className="font-poppins text-lg font-semibold text-white">2. Test Visual del Cliente</h3>
            <p className="text-sm text-[#A9A7B7] leading-relaxed">
              El cliente abre un enlace por WhatsApp sin registro ni instalación. Con simples elecciones A/B, descubres lo que realmente imagina.
            </p>
          </div>

          <div className="p-6 rounded-card bg-[#100A2E]/80 border border-[#7C3DFF]/20 space-y-3">
            <div className="p-3 rounded-lg bg-[#45E679]/15 text-[#45E679] w-fit">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-poppins text-lg font-semibold text-white">3. Visual Brief Acordado</h3>
            <p className="text-sm text-[#A9A7B7] leading-relaxed">
              Obtén el Alignment Score matemático, detecta divergencias a tiempo y aprueben juntos un Brief Visual con fotos de referencia reales.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-[#7C3DFF]/10 py-8 px-6 text-center text-xs text-[#A9A7B7]">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo mode="dark" size="sm" />
          <p>© {new Date().getFullYear()} ENCUADRE. Alinea la visión. Antes de tomar la foto.</p>
        </div>
      </footer>
    </div>
  );
}
