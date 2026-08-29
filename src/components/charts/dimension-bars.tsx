'use client';

import React from 'react';
import { FEATURE_DIMENSIONS } from '@/constants';
import type { AlignmentDimension } from '@/types/database';
import { cn } from '@/lib/utils/cn';

export interface DimensionBarsProps {
  dimensions: AlignmentDimension[];
  className?: string;
}

export function DimensionBars({ dimensions, className }: DimensionBarsProps) {
  // Sort dimensions by absolute difference descending to highlight key differences first
  const sorted = [...dimensions].sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));

  return (
    <div className={cn('space-y-4 w-full', className)}>
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#A9A7B7] border-b border-[#7C3DFF]/15 pb-2 px-1">
        <span>Dimensión Visual</span>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-[#7C3DFF]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7C3DFF]" /> Fotógrafo
          </span>
          <span className="flex items-center gap-1.5 text-[#16C95A]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16C95A]" /> Cliente
          </span>
          <span className="w-16 text-right">Diferencia</span>
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((dim) => {
          const meta = FEATURE_DIMENSIONS.find((d) => d.key === dim.key);
          const pVal = Math.round(dim.photographerValue * 100);
          const cVal = Math.round(dim.clientValue * 100);
          const diff = Math.round(dim.difference * 100);
          const absDiff = Math.abs(diff);

          const isDivergent = absDiff >= 20;

          return (
            <div
              key={dim.key}
              className={cn(
                'p-3 rounded-lg bg-[#100A2E]/50 border transition-all duration-150',
                isDivergent
                  ? 'border-[#F5A524]/40 bg-[#F5A524]/5'
                  : 'border-[#7C3DFF]/10 hover:border-[#7C3DFF]/30'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-white">{meta?.label || dim.key}</span>
                  {meta && (
                    <p className="text-xs text-[#A9A7B7] hidden md:block">{meta.description}</p>
                  )}
                </div>
                <div className="text-right flex items-center gap-4">
                  <span
                    className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded',
                      absDiff === 0
                        ? 'text-[#16C95A] bg-[#16C95A]/10'
                        : isDivergent
                        ? 'text-[#F5A524] bg-[#F5A524]/10'
                        : 'text-white bg-white/5'
                    )}
                  >
                    {diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : '0%'}
                  </span>
                </div>
              </div>

              {/* Overlapping/dual progress bars */}
              <div className="space-y-1.5">
                {/* Photographer bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#7C3DFF] w-6 text-right font-medium">{pVal}%</span>
                  <div className="flex-1 h-2 rounded-full bg-[#1e1640] overflow-hidden">
                    <div
                      className="h-full bg-[#7C3DFF] rounded-full transition-all duration-500"
                      style={{ width: `${pVal}%` }}
                    />
                  </div>
                </div>

                {/* Client bar */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#16C95A] w-6 text-right font-medium">{cVal}%</span>
                  <div className="flex-1 h-2 rounded-full bg-[#1e1640] overflow-hidden">
                    <div
                      className="h-full bg-[#16C95A] rounded-full transition-all duration-500"
                      style={{ width: `${cVal}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
