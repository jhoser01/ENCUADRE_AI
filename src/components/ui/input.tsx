import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  lightMode?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, lightMode = false, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium',
              lightMode ? 'text-[#080714]' : 'text-[#A9A7B7]'
            )}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            'flex h-11 w-full rounded-md px-3.5 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3DFF] disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]',
            lightMode
              ? 'bg-white border border-[#A9A7B7]/40 text-[#080714] placeholder:text-[#626171]'
              : 'bg-[#100A2E] border border-[#7C3DFF]/30 text-[#F7F7FB] placeholder:text-[#A9A7B7]/50',
            error && 'border-[#E5484D] focus-visible:ring-[#E5484D]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-xs text-[#E5484D]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
