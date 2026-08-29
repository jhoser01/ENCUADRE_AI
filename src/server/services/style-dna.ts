/**
 * style-dna.ts
 * Deterministic Style DNA calculation service.
 * Aggregates photographer portfolio image vectors to extract central style DNA and variance.
 */

import type { ImageFeatureVector } from '@/types/database';
import { DIMENSION_LABELS_ES } from './alignment';

export const STYLE_DNA_VERSION = 'v1.0.0';

export interface StyleDNAResult {
  vector: ImageFeatureVector;
  spread: Record<keyof ImageFeatureVector, number>;
  sample_count: number;
  dominant_dimensions: Array<{
    key: keyof ImageFeatureVector;
    label: string;
    value: number;
    description: string;
  }>;
  algorithm_version: string;
}

const FEATURE_KEYS: Array<keyof ImageFeatureVector> = [
  'warmth',
  'brightness',
  'contrast',
  'saturation',
  'naturalLight',
  'candidness',
  'posedness',
  'editorialness',
  'documentaryness',
  'intimacy',
  'wideComposition',
  'retouchLevel',
  'emotionalIntensity',
  'minimalism',
];

/**
 * Calculates Style DNA mean vector and standard deviation (spread) from portfolio feature vectors.
 */
export function calculateStyleDNA(vectors: ImageFeatureVector[]): StyleDNAResult {
  if (!vectors || vectors.length === 0) {
    throw new Error('At least one feature vector is required to calculate Style DNA.');
  }

  const sample_count = vectors.length;
  const vectorAccum: Record<keyof ImageFeatureVector, number> = {
    warmth: 0, brightness: 0, contrast: 0, saturation: 0, naturalLight: 0,
    candidness: 0, posedness: 0, editorialness: 0, documentaryness: 0,
    intimacy: 0, wideComposition: 0, retouchLevel: 0, emotionalIntensity: 0, minimalism: 0,
  };

  // 1. Mean calculation
  for (const v of vectors) {
    for (const key of FEATURE_KEYS) {
      vectorAccum[key] += v[key] ?? 0.5;
    }
  }

  const vector: ImageFeatureVector = {
    warmth: 0, brightness: 0, contrast: 0, saturation: 0, naturalLight: 0,
    candidness: 0, posedness: 0, editorialness: 0, documentaryness: 0,
    intimacy: 0, wideComposition: 0, retouchLevel: 0, emotionalIntensity: 0, minimalism: 0,
  };

  for (const key of FEATURE_KEYS) {
    vector[key] = Math.round((vectorAccum[key] / sample_count) * 1000) / 1000;
  }

  // 2. Standard deviation (spread) calculation
  const spread: Record<keyof ImageFeatureVector, number> = {
    warmth: 0, brightness: 0, contrast: 0, saturation: 0, naturalLight: 0,
    candidness: 0, posedness: 0, editorialness: 0, documentaryness: 0,
    intimacy: 0, wideComposition: 0, retouchLevel: 0, emotionalIntensity: 0, minimalism: 0,
  };

  for (const key of FEATURE_KEYS) {
    const mean = vector[key];
    const variance =
      vectors.reduce((sum, v) => sum + Math.pow((v[key] ?? 0.5) - mean, 2), 0) / sample_count;
    spread[key] = Math.round(Math.sqrt(variance) * 1000) / 1000;
  }

  // 3. Dominant / defining dimensions (dimensions that deviate most from 0.5 neutral center or have high confidence)
  const scoredDimensions = FEATURE_KEYS.map((key) => {
    const mean = vector[key];
    const extremity = Math.abs(mean - 0.5);
    const consistency = 1 - Math.min(1, spread[key] * 2);
    const distinctivenessScore = extremity * 0.7 + consistency * 0.3;

    return {
      key,
      label: DIMENSION_LABELS_ES[key],
      value: mean,
      score: distinctivenessScore,
      description: getDimensionStyleDescription(key, mean),
    };
  });

  scoredDimensions.sort((a, b) => b.score - a.score);
  const dominant_dimensions = scoredDimensions.slice(0, 5).map(({ key, label, value, description }) => ({
    key,
    label,
    value,
    description,
  }));

  return {
    vector,
    spread,
    sample_count,
    dominant_dimensions,
    algorithm_version: STYLE_DNA_VERSION,
  };
}

function getDimensionStyleDescription(key: keyof ImageFeatureVector, val: number): string {
  const isHigh = val >= 0.6;
  const isLow = val <= 0.4;
  switch (key) {
    case 'candidness':
      return isHigh ? 'Predilección marcada por instantes espontáneos y no posados' : isLow ? 'Enfoque en dirección y composición estructurada' : 'Equilibrio entre tomas guiadas y espontáneas';
    case 'naturalLight':
      return isHigh ? 'Firma visual basada en luz natural y atmósfera orgánica' : isLow ? 'Uso intensivo de esquemas de luz controlada / flash' : 'Adaptabilidad a luz natural y artificial';
    case 'warmth':
      return isHigh ? 'Paleta con tonalidades doradas, cálidas y acogedoras' : isLow ? 'Tonos fríos, limpios, contemporáneos o neutros' : 'Balance de color neutro y fiel a la escena';
    case 'retouchLevel':
      return isHigh ? 'Acabado editorial con alto grado de pulido y retoque' : isLow ? 'Estética orgánica, pieles auténticas y mínimo artificio' : 'Retoque moderado y natural';
    case 'intimacy':
      return isHigh ? 'Composiciones cercanas con fuerte conexión emocional' : isLow ? 'Planos que integran al sujeto ampliamente en su entorno' : 'Variedad de planos medios e íntimos';
    case 'documentaryness':
      return isHigh ? 'Narrativa visual de fotoperiodismo y relato secuencial' : 'Enfoque estético y plástico sobre el relato cronológico';
    default:
      return `${DIMENSION_LABELS_ES[key]}: ${(val * 100).toFixed(0)}%`;
  }
}
