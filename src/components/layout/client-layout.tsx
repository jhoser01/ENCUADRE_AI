import React from 'react';
import { Logo } from '@/components/brand/logo';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F7FB] text-[#080714] flex flex-col justify-between selection:bg-[#7C3DFF]/20">
      {/* Minimal Top Brand Bar */}
      <header className="w-full py-4 px-6 flex justify-center items-center border-b border-[#EEEEF5] bg-white/80 backdrop-blur sticky top-0 z-30">
        <Logo mode="symbol" size="sm" />
      </header>

      {/* Main Mobile-First Container (max 520px) */}
      <main className="flex-1 w-full max-w-[520px] mx-auto px-5 py-6 flex flex-col justify-center">
        {children}
      </main>

      {/* Minimal Warm Footer */}
      <footer className="w-full py-4 text-center text-xs text-[#626171] border-t border-[#EEEEF5]">
        <p>Impulsado por <span className="font-semibold text-[#7C3DFF]">ENCUADRE</span> · Acuerdo Visual</p>
      </footer>
    </div>
  );
}
