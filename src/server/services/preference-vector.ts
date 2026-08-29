/**
 * preference-vector.ts
 * Computes client preference vector from pairwise comparison choices.
 * Deterministic math algorithm.
 */

import type { ImageFeatureVector } from '@/types/database';

export const PREFERENCE_ALGORITHM_VERSION = 'v1.0.0';

export interface PairwiseChoiceData {
  selectedFeatures: ImageFeatureVector;
  rejectedFeatures: ImageFeatureVector;
  responseMs?: number | null;
}

export interface PreferenceProfileResult {
  vector: ImageFeatureVector;
  confidence: Record<keyof ImageFeatureVector, number>;
  totalChoices: number;
  algorithm_version: string;
}

const FEATURE_KEYS: Array<keyof ImageFeatureVector> = [
  'warmth', 'brightness', 'contrast', 'saturation', 'naturalLight',
  'candidness', 'posedness', 'editorialness', 'documentaryness',
  'intimacy', 'wideComposition', 'retouchLevel', 'emotionalIntensity', 'minimalism',
];

/**
 * Derives a normalized [0, 1] preference vector from a series of pairwise choices.
 * Uses Bradley-Terry delta accumulation with exponential diversity weighting.
 */
export function calculatePreferenceVector(
  choices: PairwiseChoiceData[],
  fallbackBaseline?: ImageFeatureVector
): PreferenceProfileResult {
  if (!choices || choices.length === 0) {
    const defaultVector: ImageFeatureVector = fallbackBaseline ?? {
      warmth: 0.5, brightness: 0.5, contrast: 0.5, saturation: 0.5,
      naturalLight: 0.5, candidness: 0.5, posedness: 0.5, editorialness: 0.5,
      documentaryness: 0.5, intimacy: 0.5, wideComposition: 0.5,
      retouchLevel: 0.5, emotionalIntensity: 0.5, minimalism: 0.5,
    };
    const defaultConfidence: Record<keyof ImageFeatureVector, number> = {} as any;
    for (const key of FEATURE_KEYS) defaultConfidence[key] = 0;

    return {
      vector: defaultVector,
      confidence: defaultConfidence,
      totalChoices: 0,
      algorithm_version: PREFERENCE_ALGORITHM_VERSION,
    };
  }

  // Baseline from selected features average or provided baseline
  const baseline = fallbackBaseline ?? {
    warmth: 0.5, brightness: 0.5, contrast: 0.5, saturation: 0.5,
    naturalLight: 0.5, candidness: 0.5, posedness: 0.5, editorialness: 0.5,
    documentaryness: 0.5, intimacy: 0.5, wideComposition: 0.5,
    retouchLevel: 0.5, emotionalIntensity: 0.5, minimalism: 0.5,
  };

  const deltaAccum: Record<keyof ImageFeatureVector, number> = {
    warmth: 0, brightness: 0, contrast: 0, saturation: 0, naturalLight: 0,
    candidness: 0, posedness: 0, editorialness: 0, documentaryness: 0,
    intimacy: 0, wideComposition: 0, retouchLevel: 0, emotionalIntensity: 0, minimalism: 0,
  };

  const evidenceCount: Record<keyof ImageFeatureVector, number> = {
    warmth: 0, brightness: 0, contrast: 0, saturation: 0, naturalLight: 0,
    candidness: 0, posedness: 0, editorialness: 0, documentaryness: 0,
    intimacy: 0, wideComposition: 0, retouchLevel: 0, emotionalIntensity: 0, minimalism: 0,
  };

  const selectedAccum: Record<keyof ImageFeatureVector, number> = {
    warmth: 0, brightness: 0, contrast: 0, saturation: 0, naturalLight: 0,
    candidness: 0, posedness: 0, editorialness: 0, documentaryness: 0,
    intimacy: 0, wideComposition: 0, retouchLevel: 0, emotionalIntensity: 0, minimalism: 0,
  };

  // Process choices
  choices.forEach((choice, index) => {
    // Later choices get slight progression boost (up to 1.3x)
    const progressionWeight = 1.0 + (index / Math.max(1, choices.length)) * 0.3;

    for (const key of FEATURE_KEYS) {
      const selVal = choice.selectedFeatures[key] ?? 0.5;
      const rejVal = choice.rejectedFeatures[key] ?? 0.5;
      const delta = selVal - rejVal;

      selectedAccum[key] += selVal * progressionWeight;

      if (Math.abs(delta) > 0.05) {
        deltaAccum[key] += delta * progressionWeight;
        evidenceCount[key] += Math.abs(delta) * progressionWeight;
      }
    }
  });

  const totalChoices = choices.length;
  const vector: ImageFeatureVector = { ...baseline };
  const confidence: Record<keyof ImageFeatureVector, number> = {} as any;

  for (const key of FEATURE_KEYS) {
    const rawDirectAvg = selectedAccum[key] / (totalChoices * 1.15);
    const deltaShift = deltaAccum[key] / Math.max(1, totalChoices);

    // Blended estimation: 70% direct selected attributes + 30% pairwise delta shift
    const blended = rawDirectAvg * 0.7 + (baseline[key] + deltaShift * 0.5) * 0.3;

    // Bound firmly in [0, 1]
    vector[key] = Math.round(Math.max(0.02, Math.min(0.98, blended)) * 1000) / 1000;

    // Confidence is proportional to evidence gathered for this dimension
    const confVal = Math.min(1.0, (evidenceCount[key] / Math.max(1, totalChoices * 0.35)));
    confidence[key] = Math.round(confVal * 100) / 100;
  }

  return {
    vector,
    confidence,
    totalChoices,
    algorithm_version: PREFERENCE_ALGORITHM_VERSION,
  };
}
