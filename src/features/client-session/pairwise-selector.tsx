'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export interface PairwiseItem {
  id: string;
  url: string;
  category?: string;
}

export interface PairwiseChoiceResult {
  left_image_id: string;
  right_image_id: string;
  selected_image_id: string;
  response_ms: number;
}

export interface PairwiseSelectorProps {
  pairs: Array<{ left: PairwiseItem; right: PairwiseItem }>;
  onComplete: (choices: PairwiseChoiceResult[]) => void;
}

export function PairwiseSelector({ pairs, onComplete }: PairwiseSelectorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<PairwiseChoiceResult[]>([]);
  const [selectedInCurrent, setSelectedInCurrent] = useState<'left' | 'right' | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());

  if (!pairs || pairs.length === 0) {
    return (
      <div className="text-center py-12 text-[#626171]">
        <p>No hay suficientes fotografías disponibles para la comparación.</p>
      </div>
    );
  }

  const currentPair = pairs[currentIndex];
  if (!currentPair) return null;

  const total = pairs.length;
  const progressPercent = ((currentIndex + 1) / total) * 100;

  const handleSelect = (side: 'left' | 'right') => {
    if (selectedInCurrent) return; // prevent double clicks during transition
    setSelectedInCurrent(side);

    const responseMs = Date.now() - startTime;
    const selectedId = side === 'left' ? currentPair.left.id : currentPair.right.id;

    const newChoice: PairwiseChoiceResult = {
      left_image_id: currentPair.left.id,
      right_image_id: currentPair.right.id,
      selected_image_id: selectedId,
      response_ms: responseMs,
    };

    const nextChoices = [...choices, newChoice];
    setChoices(nextChoices);

    // Smooth transition
    setTimeout(() => {
      if (currentIndex + 1 < total) {
        setCurrentIndex(currentIndex + 1);
        setSelectedInCurrent(null);
        setStartTime(Date.now());
      } else {
        onComplete(nextChoices);
      }
    }, 280);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setChoices(choices.slice(0, -1));
      setSelectedInCurrent(null);
      setStartTime(Date.now());
    }
  };

  return (
    <div className="flex flex-col h-full w-full justify-between space-y-4">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-[#626171]">
          {currentIndex > 0 ? (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1 hover:text-[#080714] transition-colors p-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Anterior</span>
            </button>
          ) : (
            <div />
          )}
          <span className="bg-[#EEEEF5] px-3 py-1 rounded-full text-[#080714] font-bold">
            {currentIndex + 1} de {total}
          </span>
        </div>

        {/* Visual progress bar */}
        <div className="w-full h-1.5 bg-[#EEEEF5] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#7C3DFF] to-[#16C95A] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Friendly prompt */}
      <div className="text-center py-1">
        <h2 className="font-poppins text-lg md:text-xl font-bold text-[#080714]">
          ¿Cuál de estas dos fotografías te representa más?
        </h2>
        <p className="text-xs text-[#626171] mt-1">
          Toca la imagen o el botón que más se acerque a lo que imaginas.
        </p>
      </div>

      {/* Pair comparison images (stacked or 2-col on mobile) */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 my-auto">
        {/* Option A (Left) */}
        <div
          onClick={() => handleSelect('left')}
          className={cn(
            'group relative flex flex-col items-center rounded-card overflow-hidden cursor-pointer transition-all duration-200 border-2 shadow-sm',
            selectedInCurrent === 'left'
              ? 'border-[#7C3DFF] ring-4 ring-[#7C3DFF]/20 scale-[0.98]'
              : 'border-[#EEEEF5] hover:border-[#7C3DFF]/50 active:scale-[0.98]'
          )}
        >
          <div className="relative w-full aspect-[3/4] bg-[#EEEEF5] overflow-hidden">
            <Image
              src={currentPair.left.url}
              alt="Opción A"
              fill
              sizes="(max-width: 520px) 50vw, 240px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {selectedInCurrent === 'left' && (
              <div className="absolute inset-0 bg-[#7C3DFF]/30 flex items-center justify-center">
                <div className="p-2 rounded-full bg-[#7C3DFF] text-white shadow-lg">
                  <Check className="h-6 w-6 stroke-[3]" />
                </div>
              </div>
            )}
          </div>
          <div className="w-full p-2 bg-white text-center">
            <Button
              type="button"
              variant={selectedInCurrent === 'left' ? 'primary' : 'secondary'}
              className="w-full text-xs h-10 min-h-[40px]"
            >
              Elegir Opción A
            </Button>
          </div>
        </div>

        {/* Option B (Right) */}
        <div
          onClick={() => handleSelect('right')}
          className={cn(
            'group relative flex flex-col items-center rounded-card overflow-hidden cursor-pointer transition-all duration-200 border-2 shadow-sm',
            selectedInCurrent === 'right'
              ? 'border-[#7C3DFF] ring-4 ring-[#7C3DFF]/20 scale-[0.98]'
              : 'border-[#EEEEF5] hover:border-[#7C3DFF]/50 active:scale-[0.98]'
          )}
        >
          <div className="relative w-full aspect-[3/4] bg-[#EEEEF5] overflow-hidden">
            <Image
              src={currentPair.right.url}
              alt="Opción B"
              fill
              sizes="(max-width: 520px) 50vw, 240px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {selectedInCurrent === 'right' && (
              <div className="absolute inset-0 bg-[#7C3DFF]/30 flex items-center justify-center">
                <div className="p-2 rounded-full bg-[#7C3DFF] text-white shadow-lg">
                  <Check className="h-6 w-6 stroke-[3]" />
                </div>
              </div>
            )}
          </div>
          <div className="w-full p-2 bg-white text-center">
            <Button
              type="button"
              variant={selectedInCurrent === 'right' ? 'primary' : 'secondary'}
              className="w-full text-xs h-10 min-h-[40px]"
            >
              Elegir Opción B
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
