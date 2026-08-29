import React from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { DIMENSION_LABELS_ES } from '@/server/services/alignment';
import type { AlignmentMismatch } from '@/types/database';
import { cn } from '@/lib/utils/cn';

export interface MismatchCardProps {
  mismatch: AlignmentMismatch;
  type?: 'mismatch' | 'match';
}

export function MismatchCard({ mismatch, type = 'mismatch' }: MismatchCardProps) {
  const isMismatch = type === 'mismatch';
  const label = DIMENSION_LABELS_ES[mismatch.dimension] || mismatch.dimension;
  const diff = Math.round(mismatch.difference * 100);

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all duration-200',
        isMismatch
          ? 'bg-[#F5A524]/10 border-[#F5A524]/30'
          : 'bg-[#16C95A]/10 border-[#16C95A]/30'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'p-2 rounded-lg flex-shrink-0 mt-0.5',
            isMismatch ? 'bg-[#F5A524]/20 text-[#F5A524]' : 'bg-[#16C95A]/20 text-[#16C95A]'
          )}
        >
          {isMismatch ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white">{label}</h4>
            <span
              className={cn(
                'text-xs font-bold px-2 py-0.5 rounded',
                isMismatch
                  ? 'bg-[#F5A524]/20 text-[#F5A524]'
                  : 'bg-[#16C95A]/20 text-[#16C95A]'
              )}
            >
              {diff > 0 ? `+${diff}%` : `${diff}%`}
            </span>
          </div>

          <p className="text-xs text-[#F7F7FB]/85 leading-relaxed">{mismatch.explanation}</p>

          <div className="flex items-center gap-4 text-[11px] text-[#A9A7B7] pt-1">
            <span>
              Estudio:{' '}
              <strong className="text-white">{Math.round(mismatch.photographerValue * 100)}%</strong>
            </span>
            <span>
              Cliente:{' '}
              <strong className="text-white">{Math.round(mismatch.clientValue * 100)}%</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
