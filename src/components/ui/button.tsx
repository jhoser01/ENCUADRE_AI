import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3DFF] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] cursor-pointer select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-[#7C3DFF] to-[#16C95A] text-white font-semibold shadow-lg hover:opacity-95 active:scale-[0.98] transition-transform',
        purple:
          'bg-[#7C3DFF] text-white font-semibold hover:bg-[#5B21E8] active:scale-[0.98]',
        green:
          'bg-[#16C95A] text-white font-semibold hover:bg-[#12a84a] active:scale-[0.98]',
        secondary:
          'bg-[#100A2E] text-[#F7F7FB] border border-[#7C3DFF]/30 hover:bg-[#1e1640] hover:border-[#7C3DFF]/60',
        outline:
          'border border-[#A9A7B7]/30 bg-transparent text-[#F7F7FB] hover:bg-[#100A2E] hover:border-[#A9A7B7]/60',
        ghost:
          'text-[#A9A7B7] hover:text-[#F7F7FB] hover:bg-[#100A2E]/60',
        danger:
          'bg-[#E5484D] text-white hover:bg-[#c9353a]',
      },
      size: {
        default: 'h-11 px-5 py-2',
        sm: 'h-9 px-3 text-xs rounded-sm',
        lg: 'h-13 px-8 text-base rounded-lg',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Cargando...</span>
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
