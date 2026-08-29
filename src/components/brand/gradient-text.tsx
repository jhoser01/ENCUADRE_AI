import React from 'react';
import { cn } from '@/lib/utils/cn';

export function GradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'bg-gradient-to-r from-[#7C3DFF] to-[#45E679] bg-clip-text text-transparent inline-block',
        className
      )}
    >
      {children}
    </span>
  );
}
