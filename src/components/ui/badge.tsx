import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-[#7C3DFF]/20 text-[#7C3DFF] border border-[#7C3DFF]/40',
        active:
          'bg-[#7C3DFF]/20 text-[#7C3DFF] border border-[#7C3DFF]/40',
        aligned:
          'bg-[#16C95A]/20 text-[#16C95A] border border-[#16C95A]/40',
        waiting:
          'bg-[#F5A524]/20 text-[#F5A524] border border-[#F5A524]/40',
        archived:
          'bg-[#A9A7B7]/20 text-[#A9A7B7] border border-[#A9A7B7]/40',
        danger:
          'bg-[#E5484D]/20 text-[#E5484D] border border-[#E5484D]/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
