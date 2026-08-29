import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export interface LogoProps {
  mode?: 'dark' | 'light' | 'symbol';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  href?: string;
}

const sizeMap = {
  sm: {
    symbol: { width: 32, height: 32 },
    full: { width: 130, height: 36 },
  },
  md: {
    symbol: { width: 44, height: 44 },
    full: { width: 170, height: 48 },
  },
  lg: {
    symbol: { width: 64, height: 64 },
    full: { width: 240, height: 68 },
  },
};

export function Logo({ mode = 'dark', size = 'md', className, href }: LogoProps) {
  const isSymbol = mode === 'symbol';
  const dimensions = isSymbol ? sizeMap[size].symbol : sizeMap[size].full;

  const src = isSymbol
    ? '/brand/symbol.png'
    : mode === 'light'
    ? '/brand/logo-light.png'
    : '/brand/logo-dark.png';

  const imageElement = (
    <div className={cn('inline-flex items-center', className)}>
      <Image
        src={src}
        alt="ENCUADRE - Alinea la visión antes de tomar la foto"
        width={dimensions.width}
        height={dimensions.height}
        priority
        className="object-contain"
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block transition-opacity hover:opacity-90">
        {imageElement}
      </Link>
    );
  }

  return imageElement;
}
