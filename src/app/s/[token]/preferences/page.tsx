'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PairwiseSelector, type PairwiseItem, type PairwiseChoiceResult } from '@/features/client-session/pairwise-selector';
import { LoadingSpinner } from '@/components/feedback/loading-spinner';
import { createBrowserClient } from '@/lib/supabase/browser';

// Synthetic fallback photos for demo if no real portfolio exists yet
const DEMO_FALLBACK_PHOTOS: PairwiseItem[] = [
  { id: 'a0000000-0000-0000-0000-000000000001', url: '/brand/symbol.png', category: 'Cálido & Espontáneo' },
  { id: 'a0000000-0000-0000-0000-000000000002', url: '/brand/logo-dark.png', category: 'Luz Natural' },
  { id: 'a0000000-0000-0000-0000-000000000003', url: '/brand/logo-light.png', category: 'Editorial' },
  { id: 'a0000000-0000-0000-0000-000000000004', url: '/brand/symbol.png', category: 'Intimidad' },
  { id: 'a0000000-0000-0000-0000-000000000005', url: '/brand/logo-dark.png', category: 'Documental' },
  { id: 'a0000000-0000-0000-0000-000000000006', url: '/brand/logo-light.png', category: 'Plano Abierto' },
];

export default function ClientPreferencesPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const token = params.token;

  const [pairs, setPairs] = useState<Array<{ left: PairwiseItem; right: PairwiseItem }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessionImages() {
      setLoading(true);
      const supabase = createBrowserClient();

      // Fetch images
      const { data: images } = (await supabase
        .from('portfolio_images')
        .select('id, storage_path, category')
        .limit(16)) as any;

      let items: PairwiseItem[] = [];

      if (images && images.length >= 2) {
        items = images.map((img: any) => ({
          id: img.id,
          url: '/brand/symbol.png', // in real signed storage this is the signed url
          category: img.category || undefined,
        }));
      } else {
        items = DEMO_FALLBACK_PHOTOS;
      }

      // Generate distinct pairs (up to 8 pairs)
      const generatedPairs: Array<{ left: PairwiseItem; right: PairwiseItem }> = [];
      const count = Math.min(8, Math.floor(items.length / 2));

      for (let i = 0; i < count; i++) {
        const left = items[i * 2];
        const right = items[i * 2 + 1];
        if (left && right) {
          generatedPairs.push({ left, right });
        }
      }

      // If we only had 1 pair, duplicate with variation
      if (generatedPairs.length === 0 && items.length >= 2) {
        const first = items[0];
        const second = items[1];
        if (first && second) {
          generatedPairs.push({ left: first, right: second });
        }
      }

      setPairs(generatedPairs);
      setLoading(false);
    }

    loadSessionImages();
  }, [token]);

  const handleChoicesComplete = (choices: PairwiseChoiceResult[]) => {
    // Store choices in sessionStorage to submit along with context questions
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`encuadre_choices_${token}`, JSON.stringify(choices));
    }
    router.push(`/s/${token}/questions`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" label="Cargando fotografías..." />
      </div>
    );
  }

  return (
    <div className="w-full">
      <PairwiseSelector pairs={pairs} onComplete={handleChoicesComplete} />
    </div>
  );
}
