'use client';

import React from 'react';
import { formatAlignmentLevel } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

export interface AlignmentGaugeProps {
  score: number;
  level?: string;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabels?: boolean;
}

export function AlignmentGauge({
  score,
  level = 'good',
  confidence = 0.95,
  size = 'lg',
  className,
  showLabels = true,
}: AlignmentGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const levelInfo = formatAlignmentLevel(level);

  // SVG circular geometry
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const sizePixels = {
    sm: 120,
    md: 180,
    lg: 240,
  }[size];

  return (
    <div className={cn('flex flex-col items-center justify-center text-center', className)}>
      <div className="relative flex items-center justify-center" style={{ width: sizePixels, height: sizePixels }}>
        <svg
          className="transform -rotate-90 w-full h-full"
          viewBox="0 0 200 200"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7C3DFF" />
              <stop offset="100%" stopColor="#16C95A" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#1e1640"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />

          {/* Animated Progress Ring */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#glow)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="font-poppins text-4xl md:text-5xl font-bold text-white tracking-tight">
            {Math.round(clampedScore)}
            <span className="text-2xl text-[#16C95A] font-semibold">%</span>
          </span>
          <span className="text-xs uppercase tracking-wider text-[#A9A7B7] font-medium mt-0.5">
            Alineación
          </span>
        </div>
      </div>

      {showLabels && (
        <div className="mt-4 space-y-1.5 flex flex-col items-center">
          <div className={cn('px-3.5 py-1 rounded-full text-xs font-semibold border', levelInfo.bgColor, levelInfo.color)}>
            {levelInfo.label}
          </div>
          {confidence !== undefined && (
            <p className="text-xs text-[#A9A7B7]">
              Confianza del cálculo: <span className="text-white font-medium">{Math.round(confidence * 100)}%</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
