import React from 'react';
import { cn } from '@/lib/utils/cn';

export function LoadingSpinner({
  size = 'md',
  className,
  label,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-t-transparent border-r-[#16C95A] border-b-[#7C3DFF] border-l-[#7C3DFF]',
          sizeClasses[size]
        )}
      />
      {label && <p className="text-sm font-medium text-[#A9A7B7]">{label}</p>}
    </div>
  );
}
