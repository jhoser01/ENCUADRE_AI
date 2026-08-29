import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-card bg-[#100A2E]/60 border border-dashed border-[#7C3DFF]/30 space-y-4',
        className
      )}
    >
      {Icon && (
        <div className="p-4 rounded-full bg-[#7C3DFF]/15 text-[#7C3DFF] ring-8 ring-[#7C3DFF]/5">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <div className="space-y-1 max-w-md">
        <h3 className="font-poppins text-lg font-semibold text-[#F7F7FB]">{title}</h3>
        <p className="text-sm text-[#A9A7B7]">{description}</p>
      </div>

      {actionLabel && (
        <div className="pt-2">
          {actionHref ? (
            <Button asChild variant="primary">
              <a href={actionHref}>{actionLabel}</a>
            </Button>
          ) : (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
